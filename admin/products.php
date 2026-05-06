<?php


require_once '../includes/cors.php';
require_once '../includes/db.php';

require_admin();

$method = $_SERVER['REQUEST_METHOD'];

// ── GET: product list ────
if ($method === 'GET') {
    $page   = max(1, (int) ($_GET['page'] ?? 1));
    $limit  = min(50, max(1, (int) ($_GET['limit'] ?? PRODUCTS_PER_PAGE)));
    $offset = ($page - 1) * $limit;
    $search = trim($_GET['search'] ?? '');
    $status = $_GET['status'] ?? ''; // 'active' | 'inactive' | 'all' | ''

    $where  = ['is_active = 1'];
    $params = [];

    if ($status === 'inactive') {
        $where = ['is_active = 0'];
    } elseif ($status === 'all') {
        $where = ['1=1'];
    }

    if ($search !== '') {
        $where[]  = '(name LIKE ? OR brand LIKE ? OR sku LIKE ?)';
        $like     = '%' . $search . '%';
        $params[] = $like;
        $params[] = $like;
        $params[] = $like;
    }

    $whereSQL = implode(' AND ', $where);

    try {
        $pdo = db();

        $countStmt = $pdo->prepare("SELECT COUNT(*) FROM products WHERE {$whereSQL}");
        $countStmt->execute($params);
        $total = (int) $countStmt->fetchColumn();

        $dataStmt = $pdo->prepare(
            "SELECT * FROM products WHERE {$whereSQL}
             ORDER BY created_at DESC
             LIMIT {$limit} OFFSET {$offset}"
        );
        $dataStmt->execute($params);
        $products = $dataStmt->fetchAll();

        echo json_encode([
            'success' => true,
            'data'    => [
                'products'    => $products,
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

// ── POST: create product ────
if ($method === 'POST') {
    $body = json_decode(file_get_contents('php://input'), true) ?? [];

    if (empty($body['name']) || !isset($body['price'])) {
        http_response_code(400);
        echo json_encode(['success' => false, 'data' => null, 'error' => 'Name and price are required.']);
        exit;
    }

    $price = filter_var($body['price'], FILTER_VALIDATE_FLOAT);
    if ($price === false || $price < 0) {
        http_response_code(400);
        echo json_encode(['success' => false, 'data' => null, 'error' => 'Invalid price.']);
        exit;
    }

    try {
        $pdo  = db();
        $stmt = $pdo->prepare(
            'INSERT INTO products
             (name, brand, subtitle, price, description, image_url, sku, stock,
              gender, frame_shape, color, badge, material, measurements, is_active)
             VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)'
        );
        $stmt->execute([
            trim($body['name']),
            trim($body['brand'] ?? ''),
            trim($body['subtitle'] ?? ''),
            $price,
            trim($body['description'] ?? ''),
            trim($body['image_url'] ?? ''),
            trim($body['sku'] ?? '') ?: null,
            max(0, (int) ($body['stock'] ?? 0)),
            $body['gender'] ?? null,
            $body['frame_shape'] ?? null,
            trim($body['color'] ?? ''),
            $body['badge'] ?? null,
            trim($body['material'] ?? ''),
            trim($body['measurements'] ?? ''),
            isset($body['is_active']) ? (int) $body['is_active'] : 1,
        ]);

        $newId = (int) $pdo->lastInsertId();

        http_response_code(201);
        echo json_encode(['success' => true, 'data' => ['id' => $newId], 'error' => '']);
    } catch (PDOException $e) {
        if ($e->getCode() === '23000') {
            http_response_code(409);
            echo json_encode(['success' => false, 'data' => null, 'error' => 'SKU already exists.']);
        } else {
            http_response_code(500);
            error_log('[Admin Products] ' . $e->getMessage());
            echo json_encode(['success' => false, 'data' => null, 'error' => 'Failed to create product.']);
        }
    } catch (RuntimeException $e) {
        http_response_code(500);
        echo json_encode(['success' => false, 'data' => null, 'error' => $e->getMessage()]);
    }
    exit;
}

// ── PATCH: update product ───
if ($method === 'PATCH') {
    $id = filter_input(INPUT_GET, 'id', FILTER_VALIDATE_INT);
    if (!$id) {
        http_response_code(400);
        echo json_encode(['success' => false, 'data' => null, 'error' => 'Valid product id required.']);
        exit;
    }

    $body = json_decode(file_get_contents('php://input'), true) ?? [];

    $allowed = [
        'name', 'brand', 'subtitle', 'price', 'description', 'image_url',
        'sku', 'stock', 'gender', 'frame_shape', 'color', 'badge',
        'material', 'measurements', 'is_active',
    ];

    $setClauses = [];
    $params     = [];

    foreach ($allowed as $field) {
        if (array_key_exists($field, $body)) {
            $setClauses[] = "{$field} = ?";
            $value = $body[$field];
            if ($field === 'stock') {
                $value = max(0, (int) $value);
            }
            $params[] = $value;
        }
    }

    if (empty($setClauses)) {
        http_response_code(400);
        echo json_encode(['success' => false, 'data' => null, 'error' => 'No valid fields provided.']);
        exit;
    }

    $params[] = $id;

    try {
        $pdo  = db();
        $stmt = $pdo->prepare(
            'UPDATE products SET ' . implode(', ', $setClauses) . ' WHERE id = ?'
        );
        $stmt->execute($params);

        if ($stmt->rowCount() === 0) {
            http_response_code(404);
            echo json_encode(['success' => false, 'data' => null, 'error' => 'Product not found.']);
            exit;
        }

        echo json_encode(['success' => true, 'data' => ['id' => $id], 'error' => '']);
    } catch (RuntimeException $e) {
        http_response_code(500);
        echo json_encode(['success' => false, 'data' => null, 'error' => $e->getMessage()]);
    }
    exit;
}

// ── DELETE: hard-delete ─────
if ($method === 'DELETE') {
    $id = filter_input(INPUT_GET, 'id', FILTER_VALIDATE_INT);
    if (!$id) {
        http_response_code(400);
        echo json_encode(['success' => false, 'data' => null, 'error' => 'Valid product id required.']);
        exit;
    }

    try {
        $pdo  = db();
        $stmt = $pdo->prepare('DELETE FROM products WHERE id = ?');
        $stmt->execute([$id]);

        if ($stmt->rowCount() === 0) {
            http_response_code(404);
            echo json_encode(['success' => false, 'data' => null, 'error' => 'Product not found.']);
            exit;
        }

        echo json_encode(['success' => true, 'data' => null, 'error' => '']);
    } catch (RuntimeException $e) {
        http_response_code(500);
        echo json_encode(['success' => false, 'data' => null, 'error' => $e->getMessage()]);
    }
    exit;
}

http_response_code(405);
echo json_encode(['success' => false, 'data' => null, 'error' => 'Method not allowed.']);
