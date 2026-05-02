<?php
// =============================================================
//  Glassico — Authentication Helpers
// =============================================================

require_once __DIR__ . '/config.php';

// Start session once with hardened settings
function start_session(): void
{
    if (session_status() === PHP_SESSION_ACTIVE) {
        return;
    }

    session_name(SESSION_NAME);

    session_set_cookie_params([
        'lifetime' => SESSION_LIFETIME,
        'path'     => '/',
        'domain'   => '',
        'secure'   => isset($_SERVER['HTTPS']),
        'httponly' => true,
        'samesite' => 'Lax',
    ]);

    session_start();
}

// ── Customer helpers ──────────────────────────────────────────

function is_logged_in(): bool
{
    start_session();
    return !empty($_SESSION['customer_id']) && is_numeric($_SESSION['customer_id']);
}

function current_customer_id(): ?int
{
    return is_logged_in() ? (int) $_SESSION['customer_id'] : null;
}

function login_customer(int $id): void
{
    start_session();
    session_regenerate_id(true);
    unset($_SESSION['admin_id']);
    $_SESSION['customer_id'] = $id;
}

function logout_customer(): void
{
    start_session();
    unset($_SESSION['customer_id']);
    session_destroy();
}

/**
 * Halt with 401 JSON if the customer is not logged in.
 * Used by API endpoints that require authentication.
 */
function require_login(): void
{
    if (!is_logged_in()) {
        http_response_code(401);
        echo json_encode([
            'success' => false,
            'data'    => null,
            'error'   => 'Authentication required. Please log in.',
        ]);
        exit;
    }
}

// ── Admin helpers ─────────────────────────────────────────────

function is_admin(): bool
{
    start_session();
    return !empty($_SESSION['admin_id']) && is_numeric($_SESSION['admin_id']);
}

function current_admin_id(): ?int
{
    return is_admin() ? (int) $_SESSION['admin_id'] : null;
}

function login_admin(int $id): void
{
    start_session();
    session_regenerate_id(true);
    unset($_SESSION['customer_id']);
    $_SESSION['admin_id'] = $id;
}

function logout_admin(): void
{
    start_session();
    unset($_SESSION['admin_id']);
    session_destroy();
}

/**
 * Halt with 403 JSON if the caller does not have an active admin session.
 */
function require_admin(): void
{
    if (!is_admin()) {
        http_response_code(403);
        echo json_encode([
            'success' => false,
            'data'    => null,
            'error'   => 'Admin access required.',
        ]);
        exit;
    }
}
