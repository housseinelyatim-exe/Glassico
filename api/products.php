<?php
// =============================================================
//  Glassico — API: Products
//  GET  ?action=list    → paginated + filtered product list
//  GET  ?action=single&id=N → single product
//  POST   (admin)       → create product
//  PATCH  (admin)       → update product
//  DELETE (admin)       → soft-delete (is_active = 0)
// =============================================================

require_once '../includes/cors.php';
require_once '../includes/db.php';

$method = $_SERVER['REQUEST_METHOD'];

// ── GET ───────────────────────────────────────────────────────
if ($method === 'GET') {
    $action = $_GET['action'] ?? 'list';

    if ($action === 'single') {
        $id = filter_input(INPUT_GET, 'id', FILTER_VALIDATE_INT);
        if (!$id) {
            http_response_code(400);
            echo json_encode(['success' => false, 'data' => null, 'error' => 'Valid product id required.']);
            exit;
        }

        try {
            $pdo  = db();
            $stmt = $pdo->prepare(
                'SELECT * FROM products WHERE id = ? AND is_active = 1 LIMIT 1'
            );
            $stmt->execute([$id]);
            $product = $stmt->fetch();

            if (!$product) {
                http_response_code(404);
                echo json_encode(['success' => false, 'data' => null, 'error' => 'Product not found.']);
                exit;
            }

            echo json_encode(['success' => true, 'data' => $product, 'error' => '']);
        } catch (RuntimeException $e) {
            http_response_code(500);
            echo json_encode(['success' => false, 'data' => null, 'error' => $e->getMessage()]);
        }
        exit;
    }

    // action = list
    $page      = max(1, (int) ($_GET['page']      ?? 1));
    $limit     = min(48, max(1, (int) ($_GET['limit'] ?? PRODUCTS_PER_PAGE)));
    $offset    = ($page - 1) * $limit;

    $gender    = $_GET['gender']      ?? '';
    $brand     = $_GET['brand']       ?? '';
    $shape     = $_GET['shape']       ?? '';
    $color     = $_GET['color']       ?? '';
    $priceMin  = filter_input(INPUT_GET, 'price_min', FILTER_VALIDATE_FLOAT);
    $priceMax  = filter_input(INPUT_GET, 'price_max', FILTER_VALIDATE_FLOAT);
    $sort      = $_GET['sort']        ?? 'featured';
    $search    = trim($_GET['search'] ?? '');

    $where  = ['p.is_active = 1'];
    $params = [];

    if ($gender) {
        $where[]  = 'p.gender = ?';
        $params[] = $gender;
    }
    if ($brand) {
        $where[]  = 'p.brand = ?';
        $params[] = $brand;
    }
    if ($shape) {
        $where[]  = 'p.frame_shape = ?';
        $params[] = $shape;
    }
    if ($color) {
        $where[]  = 'p.color = ?';
        $params[] = $color;
    }
    if ($priceMin !== false && $priceMin !== null) {
        $where[]  = 'p.price >= ?';
        $params[] = $priceMin;
    }
    if ($priceMax !== false && $priceMax !== null) {
        $where[]  = 'p.price <= ?';
        $params[] = $priceMax;
    }
    if ($search !== '') {
        $where[]  = '(p.name LIKE ? OR p.brand LIKE ? OR p.subtitle LIKE ?)';
        $like     = '%' . $search . '%';
        $params[] = $like;
        $params[] = $like;
        $params[] = $like;
    }

    $orderBy = match ($sort) {
        'price_asc'  => 'p.price ASC',
        'price_desc' => 'p.price DESC',
        'newest'     => 'p.created_at DESC',
        default      => 'p.badge IS NOT NULL DESC, p.created_at DESC',
    };

    $whereSQL = implode(' AND ', $where);

    try {
        $pdo = db();

        // Total count for pagination
        $countStmt = $pdo->prepare(
            "SELECT COUNT(*) FROM products p WHERE {$whereSQL}"
        );
        $countStmt->execute($params);
        $total = (int) $countStmt->fetchColumn();

        // Paginated rows
        $dataStmt = $pdo->prepare(
            "SELECT p.* FROM products p
             WHERE {$whereSQL}
             ORDER BY {$orderBy}
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

// ── POST: create product (admin only) ─────────────────────────
if ($method === 'POST') {
    require_admin();

    $body = json_decode(file_get_contents('php://input'), true) ?? [];

    $required = ['name', 'price'];
    foreach ($required as $field) {
        if (empty($body[$field])) {
            http_response_code(400);
            echo json_encode(['success' => false, 'data' => null, 'error' => "Field '{$field}' is required."]);
            exit;
        }
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
            trim($body['brand']        ?? ''),
            trim($body['subtitle']     ?? ''),
            $price,
            trim($body['description']  ?? ''),
            trim($body['image_url']    ?? ''),
            trim($body['sku']          ?? '') ?: null,
            max(0, (int) ($body['stock'] ?? 0)),
            $body['gender']      ?? null,
            $body['frame_shape'] ?? null,
            trim($body['color']        ?? ''),
            $body['badge']       ?? null,
            trim($body['material']     ?? ''),
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
            error_log('[Products API] ' . $e->getMessage());
            echo json_encode(['success' => false, 'data' => null, 'error' => 'Failed to create product.']);
        }
    } catch (RuntimeException $e) {
        http_response_code(500);
        echo json_encode(['success' => false, 'data' => null, 'error' => $e->getMessage()]);
    }
    exit;
}

// ── PATCH: update product (admin only) ───────────────────────
if ($method === 'PATCH') {
    require_admin();

    $id = filter_input(INPUT_GET, 'id', FILTER_VALIDATE_INT);
    if (!$id) {
        http_response_code(400);
        echo json_encode(['success' => false, 'data' => null, 'error' => 'Valid product id required.']);
        exit;
    }

    $body = json_decode(file_get_contents('php://input'), true) ?? [];
    if (empty($body)) {
        http_response_code(400);
        echo json_encode(['success' => false, 'data' => null, 'error' => 'No fields to update.']);
        exit;
    }

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
            $params[]     = $body[$field];
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

// ── DELETE: soft-delete (admin only) ─────────────────────────
if ($method === 'DELETE') {
    require_admin();

    $id = filter_input(INPUT_GET, 'id', FILTER_VALIDATE_INT);
    if (!$id) {
        http_response_code(400);
        echo json_encode(['success' => false, 'data' => null, 'error' => 'Valid product id required.']);
        exit;
    }

    try {
        $pdo  = db();
        $stmt = $pdo->prepare('UPDATE products SET is_active = 0 WHERE id = ?');
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
