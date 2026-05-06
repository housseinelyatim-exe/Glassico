<?php


require_once __DIR__ . '/config.php';
require_once __DIR__ . '/auth_helpers.php';


$allowedOrigins = [
    'http://localhost',
    'http://localhost:3000',
    'http://localhost:8080',
    'http://127.0.0.1',
    APP_URL,
];

$origin = $_SERVER['HTTP_ORIGIN'] ?? '';

if (in_array($origin, $allowedOrigins, true)) {
    header('Access-Control-Allow-Origin: ' . $origin);
} else {

    header('Access-Control-Allow-Origin: ' . APP_URL);
}

header('Access-Control-Allow-Credentials: true');
header('Access-Control-Allow-Methods: GET, POST, PATCH, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With');
header('Access-Control-Max-Age: 86400');


if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(204);
    exit;
}


header('Content-Type: application/json; charset=utf-8');


header('Cache-Control: no-store, no-cache, must-revalidate');
header('Pragma: no-cache');

start_session();
