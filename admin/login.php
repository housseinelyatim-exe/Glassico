<?php
// =============================================================
//  Glassico — Admin Login
//  POST JSON { email, password } → sets $_SESSION['admin_id']
// =============================================================

require_once '../includes/cors.php';
require_once '../includes/db.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['success' => false, 'data' => null, 'error' => 'Method not allowed.']);
    exit;
}

$body     = json_decode(file_get_contents('php://input'), true) ?? [];
$email    = trim($body['email']    ?? '');
$password = $body['password']      ?? '';

if (empty($email) || empty($password)) {
    http_response_code(400);
    echo json_encode(['success' => false, 'data' => null, 'error' => 'Email and password are required.']);
    exit;
}

if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
    http_response_code(400);
    echo json_encode(['success' => false, 'data' => null, 'error' => 'Invalid email address.']);
    exit;
}

try {
    $pdo  = db();
    $stmt = $pdo->prepare(
        'SELECT id, email, password_hash FROM admins WHERE email = ? LIMIT 1'
    );
    $stmt->execute([$email]);
    $admin = $stmt->fetch();

    if (!$admin || !password_verify($password, $admin['password_hash'])) {
        http_response_code(401);
        echo json_encode(['success' => false, 'data' => null, 'error' => 'Invalid credentials.']);
        exit;
    }

    login_admin((int) $admin['id']);

    echo json_encode([
        'success' => true,
        'data'    => [
            'admin_id' => (int) $admin['id'],
            'email'    => $admin['email'],
        ],
        'error' => '',
    ]);

} catch (RuntimeException $e) {
    http_response_code(500);
    echo json_encode(['success' => false, 'data' => null, 'error' => $e->getMessage()]);
}
