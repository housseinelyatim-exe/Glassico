<?php
// =============================================================
//  Glassico — CORS + JSON Headers
//  Include at the very top of every API file.
// =============================================================

require_once __DIR__ . '/config.php';
require_once __DIR__ . '/auth_helpers.php';

// Allowed origins — tighten for production
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
    // Fall back to same-origin (no CORS header) for unlisted origins
    header('Access-Control-Allow-Origin: ' . APP_URL);
}

header('Access-Control-Allow-Credentials: true');
header('Access-Control-Allow-Methods: GET, POST, PATCH, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With');
header('Access-Control-Max-Age: 86400');

// Handle pre-flight OPTIONS request
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(204);
    exit;
}

// All API responses are JSON
header('Content-Type: application/json; charset=utf-8');

// Prevent caching of API responses
header('Cache-Control: no-store, no-cache, must-revalidate');
header('Pragma: no-cache');

// Start session so auth helpers work across all API files
start_session();
