<?php
// =============================================================
//  Glassico — Admin Logout
//  Destroys admin session and redirects to auth.html
// =============================================================

require_once '../includes/config.php';
require_once '../includes/auth_helpers.php';

start_session();
logout_admin();

// If called via AJAX expect JSON, otherwise redirect
$wantsJson = (
    isset($_SERVER['HTTP_ACCEPT']) &&
    strpos($_SERVER['HTTP_ACCEPT'], 'application/json') !== false
) || (
    isset($_SERVER['HTTP_X_REQUESTED_WITH']) &&
    strtolower($_SERVER['HTTP_X_REQUESTED_WITH']) === 'xmlhttprequest'
);

if ($wantsJson) {
    header('Content-Type: application/json; charset=utf-8');
    echo json_encode(['success' => true, 'data' => null, 'error' => '']);
} else {
    header('Location: ../auth.html');
    exit;
}
