<?php

require_once '../includes/cors.php';
require_once '../includes/db.php';

$method = $_SERVER['REQUEST_METHOD'];

// ── GET
if ($method === 'GET') {
    $action = $_GET['action'] ?? '';

    if ($action !== 'list') {
        http_response_code(400);
        echo json_encode(['success' => false, 'data' => null, 'error' => 'Unknown action.']);
        exit;
    }

    require_login();

    $customerId = current_customer_id();
    $page       = max(1, (int) ($_GET['page'] ?? 1));
    $limit      = ORDERS_PER_PAGE;
    $offset     = ($page - 1) * $limit;

    try {
        $pdo = db();

        $countStmt = $pdo->prepare(
            'SELECT COUNT(*) FROM orders WHERE customer_id = ?'
        );
        $countStmt->execute([$customerId]);
        $total = (int) $countStmt->fetchColumn();

        $stmt = $pdo->prepare(
            'SELECT o.id, o.status, o.subtotal, o.shipping, o.tax, o.total,
                    o.payment_method, o.created_at,
                    (SELECT JSON_ARRAYAGG(
                         JSON_OBJECT(
                             "product_id",  oi.product_id,
                             "quantity",    oi.quantity,
                             "unit_price",  oi.unit_price,
                             "name",        p.name,
                             "brand",       p.brand,
                             "image_url",   p.image_url
                         )
                     )
                     FROM order_items oi
                     LEFT JOIN products p ON p.id = oi.product_id
                     WHERE oi.order_id = o.id
                    ) AS items
             FROM orders o
             WHERE o.customer_id = ?
             ORDER BY o.created_at DESC
             LIMIT ? OFFSET ?'
        );
        $stmt->execute([$customerId, $limit, $offset]);
        $orders = $stmt->fetchAll();

        // Decode JSON items string returned by MySQL
        foreach ($orders as &$order) {
            $order['items'] = json_decode($order['items'] ?? '[]', true) ?? [];
        }
        unset($order);

        echo json_encode([
            'success' => true,
            'data'    => [
                'orders'      => $orders,
                'total'       => $total,
                'page'        => $page,
                'total_pages' => (int) ceil($total / $limit),
            ],
            'error' => '',
        ]);
    } catch (RuntimeException $e) {
        http_response_code(500);
        echo json_encode(['success' => false, 'data' => null, 'error' => $e->getMessage()]);
    }
    exit;
}

// ── POST: create order ────────────────────────────────────────
if ($method === 'POST') {
    $body = json_decode(file_get_contents('php://input'), true) ?? [];

    $items           = $body['items']            ?? [];
    $shippingAddress = $body['shipping_address'] ?? [];
    $paymentMethod   = trim($body['payment_method'] ?? '');
    $guestEmail      = trim($body['guest_email']    ?? '');
    $allowedPayments = ['credit_card', 'cod', 'd17'];

    // Basic validation
    if (empty($items) || !is_array($items)) {
        http_response_code(400);
        echo json_encode(['success' => false, 'data' => null, 'error' => 'Order must contain at least one item.']);
        exit;
    }

    if (empty($shippingAddress)) {
        http_response_code(400);
        echo json_encode(['success' => false, 'data' => null, 'error' => 'Shipping address is required.']);
        exit;
    }

    if ($paymentMethod !== '' && !in_array($paymentMethod, $allowedPayments, true)) {
        http_response_code(400);
        echo json_encode(['success' => false, 'data' => null, 'error' => 'Invalid payment method.']);
        exit;
    }

    $customerId = current_customer_id(); // null for guests

    if (!$customerId && !filter_var($guestEmail, FILTER_VALIDATE_EMAIL)) {
        http_response_code(400);
        echo json_encode(['success' => false, 'data' => null, 'error' => 'A valid email is required for guest checkout.']);
        exit;
    }

    try {
        $pdo = db();
        $pdo->beginTransaction();

        $subtotal = 0.0;
        $lineItems = [];

        foreach ($items as $item) {
            $productId = filter_var($item['product_id'] ?? 0, FILTER_VALIDATE_INT);
            $qty       = max(1, (int) ($item['quantity'] ?? 1));

            if (!$productId) {
                $pdo->rollBack();
                http_response_code(400);
                echo json_encode(['success' => false, 'data' => null, 'error' => 'Invalid product id in items.']);
                exit;
            }

            // Lock row for stock check
            $pStmt = $pdo->prepare(
                'SELECT id, name, price, stock FROM products
                 WHERE id = ? AND is_active = 1
                 FOR UPDATE'
            );
            $pStmt->execute([$productId]);
            $product = $pStmt->fetch();

            if (!$product) {
                $pdo->rollBack();
                http_response_code(404);
                echo json_encode(['success' => false, 'data' => null, 'error' => "Product #{$productId} not found."]);
                exit;
            }

            if ($product['stock'] < $qty) {
                $pdo->rollBack();
                http_response_code(409);
                echo json_encode([
                    'success' => false,
                    'data'    => null,
                    'error'   => "Insufficient stock for \"{$product['name']}\". Available: {$product['stock']}.",
                ]);
                exit;
            }

            $lineItems[] = [
                'product_id' => $productId,
                'quantity'   => $qty,
                'unit_price' => (float) $product['price'],
            ];

            $subtotal += (float) $product['price'] * $qty;
        }

        $shipping = $subtotal >= FREE_SHIPPING_THRESHOLD ? 0.00 : FLAT_SHIPPING_RATE;
        $tax      = 0.00;
        $total    = round($subtotal + $shipping + $tax, 2);

        // Insert order
        $orderStmt = $pdo->prepare(
            'INSERT INTO orders
             (customer_id, guest_email, status, subtotal, shipping, tax, total,
              shipping_address, payment_method)
             VALUES (?,?,\'pending\',?,?,?,?,?,?)'
        );
        $orderStmt->execute([
            $customerId,
            $customerId ? null : $guestEmail,
            round($subtotal, 2),
            $shipping,
            $tax,
            $total,
            json_encode($shippingAddress),
            $paymentMethod ?: 'credit_card',
        ]);
        $orderId = (int) $pdo->lastInsertId();

        // Insert line items + decrement stock
        $itemStmt  = $pdo->prepare(
            'INSERT INTO order_items (order_id, product_id, quantity, unit_price)
             VALUES (?,?,?,?)'
        );
        $stockStmt = $pdo->prepare(
            'UPDATE products SET stock = stock - ? WHERE id = ?'
        );

        foreach ($lineItems as $li) {
            $itemStmt->execute([$orderId, $li['product_id'], $li['quantity'], $li['unit_price']]);
            $stockStmt->execute([$li['quantity'], $li['product_id']]);
        }

        $pdo->commit();

        http_response_code(201);
        echo json_encode([
            'success' => true,
            'data'    => [
                'order_id' => $orderId,
                'subtotal' => round($subtotal, 2),
                'shipping' => $shipping,
                'tax'      => $tax,
                'total'    => $total,
            ],
            'error' => '',
        ]);

    } catch (RuntimeException $e) {
        if ($pdo->inTransaction()) {
            $pdo->rollBack();
        }
        http_response_code(500);
        echo json_encode(['success' => false, 'data' => null, 'error' => $e->getMessage()]);
    }
    exit;
}

http_response_code(405);
echo json_encode(['success' => false, 'data' => null, 'error' => 'Method not allowed.']);
