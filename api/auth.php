<?php
// =============================================================
//  Glassico — API: Authentication
//  POST ?action=signup   → register new customer
//  POST ?action=login    → authenticate customer
//  POST ?action=logout   → destroy session
//  GET  ?action=session  → return current session info
// =============================================================

require_once '../includes/cors.php';
require_once '../includes/db.php';

$method = $_SERVER['REQUEST_METHOD'];
$action = $_GET['action'] ?? '';

// ── GET: session check ────────────────────────────────────────
if ($method === 'GET' && $action === 'session') {
    if (is_admin()) {
        echo json_encode([
            'success' => true,
            'data'    => [
                'logged_in' => true,
                'is_admin'  => true,
                'admin_id'  => current_admin_id(),
            ],
            'error' => '',
        ]);
    } elseif (is_logged_in()) {
        try {
            $pdo  = db();
            $stmt = $pdo->prepare(
                'SELECT id, email, first_name, last_name, created_at
                 FROM customers WHERE id = ? LIMIT 1'
            );
            $stmt->execute([current_customer_id()]);
            $customer = $stmt->fetch();

            if (!$customer) {
                logout_customer();
                echo json_encode(['success' => true, 'data' => null, 'error' => '']);
                exit;
            }

            echo json_encode([
                'success' => true,
                'data'    => [
                    'logged_in'  => true,
                    'customer'   => $customer,
                    'is_admin'   => false,
                ],
                'error'   => '',
            ]);
        } catch (RuntimeException $e) {
            http_response_code(500);
            echo json_encode(['success' => false, 'data' => null, 'error' => $e->getMessage()]);
        }
    } else {
        echo json_encode([
            'success' => true,
            'data'    => ['logged_in' => false],
            'error'   => '',
        ]);
    }
    exit;
}

// ── POST actions ──────────────────────────────────────────────
if ($method !== 'POST') {
    http_response_code(405);
    echo json_encode(['success' => false, 'data' => null, 'error' => 'Method not allowed.']);
    exit;
}

$body = json_decode(file_get_contents('php://input'), true) ?? [];

// ── POST: signup ──────────────────────────────────────────────
if ($action === 'signup') {
    $email     = trim($body['email']      ?? '');
    $password  = $body['password']        ?? '';
    $firstName = trim($body['first_name'] ?? '');
    $lastName  = trim($body['last_name']  ?? '');

    // Validation
    if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
        http_response_code(400);
        echo json_encode(['success' => false, 'data' => null, 'error' => 'Invalid email address.']);
        exit;
    }

    if (strlen($password) < 8) {
        http_response_code(400);
        echo json_encode(['success' => false, 'data' => null, 'error' => 'Password must be at least 8 characters.']);
        exit;
    }

    if (empty($firstName) || empty($lastName)) {
        http_response_code(400);
        echo json_encode(['success' => false, 'data' => null, 'error' => 'First and last name are required.']);
        exit;
    }

    try {
        $pdo = db();

        // Check email uniqueness
        $check = $pdo->prepare('SELECT id FROM customers WHERE email = ? LIMIT 1');
        $check->execute([$email]);
        if ($check->fetch()) {
            http_response_code(409);
            echo json_encode(['success' => false, 'data' => null, 'error' => 'An account with this email already exists.']);
            exit;
        }

        $hash = password_hash($password, PASSWORD_BCRYPT, ['cost' => 12]);

        $stmt = $pdo->prepare(
            'INSERT INTO customers (email, password_hash, first_name, last_name)
             VALUES (?, ?, ?, ?)'
        );
        $stmt->execute([$email, $hash, $firstName, $lastName]);

        $newId = (int) $pdo->lastInsertId();
        login_customer($newId);

        http_response_code(201);
        echo json_encode([
            'success' => true,
            'data'    => [
                'id'         => $newId,
                'email'      => $email,
                'first_name' => $firstName,
                'last_name'  => $lastName,
            ],
            'error' => '',
        ]);

    } catch (RuntimeException $e) {
        http_response_code(500);
        echo json_encode(['success' => false, 'data' => null, 'error' => $e->getMessage()]);
    }
    exit;
}

// ── POST: login ───────────────────────────────────────────────
if ($action === 'login') {
    $email    = trim($body['email']    ?? '');
    $password = $body['password']      ?? '';

    if (empty($email) || empty($password)) {
        http_response_code(400);
        echo json_encode(['success' => false, 'data' => null, 'error' => 'Email and password are required.']);
        exit;
    }

    try {
        $pdo = db();

        // Check admin first
        $adminStmt = $pdo->prepare('SELECT id, password_hash FROM admins WHERE email = ? LIMIT 1');
        $adminStmt->execute([$email]);
        $admin = $adminStmt->fetch();

        if ($admin && password_verify($password, $admin['password_hash'])) {
            login_admin((int) $admin['id']);
            echo json_encode([
                'success' => true,
                'data'    => ['is_admin' => true, 'admin_id' => (int) $admin['id']],
                'error'   => '',
            ]);
            exit;
        }

        // Check customer
        $custStmt = $pdo->prepare(
            'SELECT id, email, password_hash, first_name, last_name
             FROM customers WHERE email = ? LIMIT 1'
        );
        $custStmt->execute([$email]);
        $customer = $custStmt->fetch();

        if (!$customer || !password_verify($password, $customer['password_hash'])) {
            http_response_code(401);
            echo json_encode(['success' => false, 'data' => null, 'error' => 'Invalid email or password.']);
            exit;
        }

        login_customer((int) $customer['id']);

        echo json_encode([
            'success' => true,
            'data'    => [
                'is_admin'   => false,
                'id'         => (int) $customer['id'],
                'email'      => $customer['email'],
                'first_name' => $customer['first_name'],
                'last_name'  => $customer['last_name'],
            ],
            'error' => '',
        ]);

    } catch (RuntimeException $e) {
        http_response_code(500);
        echo json_encode(['success' => false, 'data' => null, 'error' => $e->getMessage()]);
    }
    exit;
}

// ── POST: logout ──────────────────────────────────────────────
if ($action === 'logout') {
    if (is_admin()) {
        logout_admin();
    } else {
        logout_customer();
    }
    echo json_encode(['success' => true, 'data' => null, 'error' => '']);
    exit;
}

// Unknown action
http_response_code(400);
echo json_encode(['success' => false, 'data' => null, 'error' => 'Unknown action.']);
