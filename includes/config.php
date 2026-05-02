<?php
// =============================================================
//  Glassico — Central Configuration
//  Load order:
//    1. This file sets production / default constants.
//    2. If includes/config.local.php exists it is loaded next
//       and any re-defined constants override the defaults.
//  NEVER commit config.local.php to version control.
// =============================================================

// -------------------------------------------------------------
//  Local override — load first so constants can be redefined
//  below only if not already set by the local file.
// -------------------------------------------------------------
$_localConfig = __DIR__ . '/config.local.php';
if (file_exists($_localConfig)) {
    require_once $_localConfig;
}
unset($_localConfig);

// -------------------------------------------------------------
//  Database
// -------------------------------------------------------------
defined('DB_HOST')    || define('DB_HOST',    'localhost');
defined('DB_PORT')    || define('DB_PORT',    '3306');
defined('DB_NAME')    || define('DB_NAME',    'glassico');
defined('DB_USER')    || define('DB_USER',    'root');
defined('DB_PASS')    || define('DB_PASS',    '');
defined('DB_CHARSET') || define('DB_CHARSET', 'utf8mb4');

// -------------------------------------------------------------
//  Cloudinary
// -------------------------------------------------------------
defined('CLOUDINARY_CLOUD_NAME') || define('CLOUDINARY_CLOUD_NAME', 'dwzeqbmrs');
defined('CLOUDINARY_API_KEY')    || define('CLOUDINARY_API_KEY',    '885492696971822');
defined('CLOUDINARY_API_SECRET') || define('CLOUDINARY_API_SECRET', 'qcyJW7qAsbhfbHWTlzUf7m54f44');

// Folder paths inside your Cloudinary account
defined('CLOUDINARY_FOLDER_PRODUCTS') || define('CLOUDINARY_FOLDER_PRODUCTS', 'glassico/products');
defined('CLOUDINARY_FOLDER_ASSETS')   || define('CLOUDINARY_FOLDER_ASSETS',   'glassico/assets');

// -------------------------------------------------------------
//  Application
// -------------------------------------------------------------
defined('APP_NAME')    || define('APP_NAME',    'Glassico');
defined('APP_ENV')     || define('APP_ENV',     'production'); // 'development' | 'production'
defined('APP_DEBUG')   || define('APP_DEBUG',   false);

// Base URL — set in config.local.php for local dev
// e.g. define('APP_URL', 'http://localhost/glassico');
defined('APP_URL') || define('APP_URL', 'https://glassico.com');

// -------------------------------------------------------------
//  Session
// -------------------------------------------------------------
defined('SESSION_NAME')     || define('SESSION_NAME',     'glassico_session');
defined('SESSION_LIFETIME') || define('SESSION_LIFETIME', 86400); // 24 hours in seconds

// -------------------------------------------------------------
//  Pagination defaults
// -------------------------------------------------------------
defined('PRODUCTS_PER_PAGE') || define('PRODUCTS_PER_PAGE', 12);
defined('ORDERS_PER_PAGE')   || define('ORDERS_PER_PAGE',   20);

// -------------------------------------------------------------
//  Shipping & Tax
// -------------------------------------------------------------
defined('FREE_SHIPPING_THRESHOLD') || define('FREE_SHIPPING_THRESHOLD', 200.00);
defined('FLAT_SHIPPING_RATE')      || define('FLAT_SHIPPING_RATE',       15.00);
defined('TAX_RATE')                || define('TAX_RATE',                  0.08); // 8 %

// -------------------------------------------------------------
//  Error reporting — suppress on production
// -------------------------------------------------------------
if (APP_ENV === 'development' || APP_DEBUG === true) {
    ini_set('display_errors', '1');
    ini_set('display_startup_errors', '1');
    error_reporting(E_ALL);
} else {
    ini_set('display_errors', '0');
    ini_set('display_startup_errors', '0');
    error_reporting(E_ALL & ~E_DEPRECATED & ~E_STRICT);
}
