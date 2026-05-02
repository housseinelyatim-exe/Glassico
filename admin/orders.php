<?php
// =============================================================
//  Glassico — Admin Orders
//  GET       → all orders paginated with customer info
//  PATCH ?id=N → update order status
// =============================================================

require_once '../includes/cors.php';
require_once '../includes/db.php';

require_admin();

$method = $_SERVER['REQUEST_METHOD'];

// ── GET: all orders ───────────────────────────────────────────
if ($method === 'GET') {
    $page   = max(1, (int) ($_GET['page']   ?? 1));
    $limit  = min(50, max(1, (int) ($_GET['limit'] ?? ORDERS_PER_PAGE)));
    $offset = ($page - 1) * $limit;
    $status = trim($_GET['status'] ?? '');

    $where  = ['1=1'];
    $params = [];

    $validStatuses = ['pending', 'processing', 'shipped', 'delivered', 'cancelled'];
    if ($status !== '' && in_array($status, $validStatuses, true)) {
        $where[]  = 'o.status = ?';
        $params[] = $status;
    }

    $whereSQL = implode(' AND ', $where);

    try {
        $pdo = db();

        $countStmt = $pdo->prepare(
            "SELECT COUNT(*) FROM orders o WHERE {$whereSQL}"
        );
        $countStmt->execute($params);
        $total = (int) $countStmt->fetchColumn();

        $dataStmt = $pdo->prepare(
            "SELECT o.id,
                    o.status,
                    o.subtotal,
                    o.shipping,
                    o.tax,
                    o.total,
                    o.payment_method,
                    o.created_at,
                    o.shipping_address,
                    COALESCE(c.email, o.guest_email)                    AS customer_email,
                    COALESCE(CONCAT(c.first_name,' ',c.last_name), 'Guest') AS customer_name
             FROM orders o
             LEFT JOIN customers c ON c.id = o.customer_id
             WHERE {$whereSQL}
             ORDER BY o.created_at DESC
             LIMIT {$limit} OFFSET {$offset}"
        );
        $dataStmt->execute($params);
        $orders = $dataStmt->fetchAll();

        foreach ($orders as &$order) {
            $order['shipping_address'] = json_decode($order['shipping_address'] ?? '{}', true) ?? [];
        }
        unset($order);

        echo json_encode([
            'success' => true,
            'data'    => [
                'orders'      => $orders,
                'total'       => $total,
                'page'        => $page,
                'limit'       => $limit,
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

// ── PATCH: update order status ────────────────────────────────
if ($method === 'PATCH') {
    $id = filter_input(INPUT_GET, 'id', FILTER_VALIDATE_INT);
    if (!$id) {
        http_response_code(400);
        echo json_encode(['success' => false, 'data' => null, 'error' => 'Valid order id required.']);
        exit;
    }

    $body   = json_decode(file_get_contents('php://input'), true) ?? [];
    $status = trim($body['status'] ?? '');

    $validStatuses = ['pending', 'processing', 'shipped', 'delivered', 'cancelled'];
    if (!in_array($status, $validStatuses, true)) {
        http_response_code(400);
        echo json_encode([
            'success' => false,
            'data'    => null,
            'error'   => 'Invalid status. Must be one of: ' . implode(', ', $validStatuses) . '.',
        ]);
        exit;
    }

    try {
        $pdo  = db();
        $stmt = $pdo->prepare('UPDATE orders SET status = ? WHERE id = ?');
        $stmt->execute([$status, $id]);

        if ($stmt->rowCount() === 0) {
            http_response_code(404);
            echo json_encode(['success' => false, 'data' => null, 'error' => 'Order not found.']);
            exit;
        }

        echo json_encode([
            'success' => true,
            'data'    => ['id' => $id, 'status' => $status],
            'error'   => '',
        ]);
    } catch (RuntimeException $e) {
        http_response_code(500);
        echo json_encode(['success' => false, 'data' => null, 'error' => $e->getMessage()]);
    }
    exit;
}

http_response_code(405);
echo json_encode(['success' => false, 'data' => null, 'error' => 'Method not allowed.']);
