<?php
// =============================================================
//  Glassico — Local Configuration Template
//
//  SETUP INSTRUCTIONS:
//    1. Copy this file:
//         cp includes/config.local.example.php includes/config.local.php
//    2. Fill in your local values below.
//    3. Add config.local.php to .gitignore — never commit it.
//
//  Any constant defined here overrides the default in config.php.
//  Only uncomment + edit the values you need to change.
// =============================================================

// -------------------------------------------------------------
//  Database — local development
// -------------------------------------------------------------
define('DB_HOST',    'localhost');
define('DB_PORT',    '3306');
define('DB_NAME',    'glassico');
define('DB_USER',    'root');       // change to your MySQL username
define('DB_PASS',    '');           // change to your MySQL password
define('DB_CHARSET', 'utf8mb4');

// -------------------------------------------------------------
//  Application environment
// -------------------------------------------------------------
define('APP_ENV',   'development');
define('APP_DEBUG', true);
define('APP_URL',   'http://localhost/glassico');

// -------------------------------------------------------------
//  Cloudinary — override only if using a different account locally
//  Leave commented to inherit the defaults from config.php.
// -------------------------------------------------------------
// define('CLOUDINARY_CLOUD_NAME', 'your_cloud_name');
// define('CLOUDINARY_API_KEY',    'your_api_key');
// define('CLOUDINARY_API_SECRET', 'your_api_secret');

// -------------------------------------------------------------
//  Session
// -------------------------------------------------------------
// define('SESSION_NAME',     'glassico_session_dev');
// define('SESSION_LIFETIME', 86400);

// -------------------------------------------------------------
//  Optional: shorter pagination for dev/testing
// -------------------------------------------------------------
// define('PRODUCTS_PER_PAGE', 6);
// define('ORDERS_PER_PAGE',   10);
