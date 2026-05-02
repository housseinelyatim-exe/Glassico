<?php
// =============================================================
//  Glassico — Admin Dashboard Metrics
//  GET → {total_sales_mtd, active_orders, low_stock, recent_orders}
// =============================================================

require_once '../includes/cors.php';
require_once '../includes/db.php';

if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    http_response_code(405);
    echo json_encode(['success' => false, 'data' => null, 'error' => 'Method not allowed.']);
    exit;
}

require_admin();

try {
    $pdo = db();

    // Total sales month-to-date (exclude cancelled)
    $salesStmt = $pdo->prepare(
        "SELECT COALESCE(SUM(total), 0)
         FROM orders
         WHERE YEAR(created_at)  = YEAR(CURDATE())
           AND MONTH(created_at) = MONTH(CURDATE())
           AND status != 'cancelled'"
    );
    $salesStmt->execute();
    $totalSalesMtd = (float) $salesStmt->fetchColumn();

    // Active orders count
    $activeStmt = $pdo->prepare(
        "SELECT COUNT(*) FROM orders
         WHERE status IN ('pending','processing')"
    );
    $activeStmt->execute();
    $activeOrders = (int) $activeStmt->fetchColumn();

    // Low stock count (stock < 5 and active)
    $lowStockStmt = $pdo->prepare(
        'SELECT COUNT(*) FROM products
         WHERE stock < 5 AND is_active = 1'
    );
    $lowStockStmt->execute();
    $lowStock = (int) $lowStockStmt->fetchColumn();

    // Recent 5 orders with customer email
    $recentStmt = $pdo->prepare(
        "SELECT o.id,
                o.status,
                o.total,
                o.created_at,
                COALESCE(c.email, o.guest_email) AS customer_email,
                COALESCE(CONCAT(c.first_name,' ',c.last_name), 'Guest') AS customer_name
         FROM orders o
         LEFT JOIN customers c ON c.id = o.customer_id
         ORDER BY o.created_at DESC
         LIMIT 5"
    );
    $recentStmt->execute();
    $recentOrders = $recentStmt->fetchAll();

    // Top selling products (by quantity this month)
    $topStmt = $pdo->prepare(
        "SELECT p.id, p.name, p.brand, p.image_url,
                SUM(oi.quantity) AS units_sold
         FROM order_items oi
         JOIN products p ON p.id = oi.product_id
         JOIN orders o   ON o.id = oi.order_id
         WHERE YEAR(o.created_at)  = YEAR(CURDATE())
           AND MONTH(o.created_at) = MONTH(CURDATE())
           AND o.status != 'cancelled'
         GROUP BY p.id
         ORDER BY units_sold DESC
         LIMIT 5"
    );
    $topStmt->execute();
    $topProducts = $topStmt->fetchAll();

    echo json_encode([
        'success' => true,
        'data'    => [
            'total_sales_mtd' => $totalSalesMtd,
            'active_orders'   => $activeOrders,
            'low_stock'       => $lowStock,
            'recent_orders'   => $recentOrders,
            'top_products'    => $topProducts,
        ],
        'error' => '',
    ]);

} catch (RuntimeException $e) {
    http_response_code(500);
    echo json_encode(['success' => false, 'data' => null, 'error' => $e->getMessage()]);
}
