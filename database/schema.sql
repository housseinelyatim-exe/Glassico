-- =============================================================
--  Glassico — Database Schema
--  Engine: MySQL 8.0+  |  Charset: utf8mb4
-- =============================================================

SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

-- -------------------------------------------------------------
-- Drop tables in reverse dependency order (safe re-run)
-- -------------------------------------------------------------
DROP TABLE IF EXISTS wishlist;
DROP TABLE IF EXISTS order_items;
DROP TABLE IF EXISTS orders;
DROP TABLE IF EXISTS admins;
DROP TABLE IF EXISTS customers;
DROP TABLE IF EXISTS products;

SET FOREIGN_KEY_CHECKS = 1;

-- =============================================================
--  TABLE: products
-- =============================================================
CREATE TABLE products (
    id            INT            NOT NULL AUTO_INCREMENT,
    name          VARCHAR(120)   NOT NULL,
    brand         VARCHAR(80)    DEFAULT NULL,
    subtitle      VARCHAR(120)   DEFAULT NULL        COMMENT 'e.g. Havana Tortoise',
    price         DECIMAL(10,2)  NOT NULL,
    description   TEXT           DEFAULT NULL,
    image_url     VARCHAR(500)   DEFAULT NULL        COMMENT 'Cloudinary secure URL',
    sku           VARCHAR(40)    DEFAULT NULL,
    stock         INT            NOT NULL DEFAULT 0,
    gender        ENUM('men','women','kids','unisex') DEFAULT NULL,
    frame_shape   ENUM('round','square','aviator','cat_eye') DEFAULT NULL,
    color         VARCHAR(40)    DEFAULT NULL,
    badge         VARCHAR(40)    DEFAULT NULL        COMMENT 'new | bestseller | NULL',
    material      VARCHAR(120)   DEFAULT NULL,
    measurements  VARCHAR(60)    DEFAULT NULL        COMMENT 'e.g. 52-20-145',
    is_active     TINYINT(1)     NOT NULL DEFAULT 1,
    created_at    TIMESTAMP      NOT NULL DEFAULT CURRENT_TIMESTAMP,

    PRIMARY KEY (id),
    UNIQUE KEY uq_products_sku (sku),
    KEY idx_products_brand      (brand),
    KEY idx_products_gender     (gender),
    KEY idx_products_frame_shape(frame_shape),
    KEY idx_products_badge      (badge),
    KEY idx_products_is_active  (is_active),
    KEY idx_products_created_at (created_at)
) ENGINE=InnoDB
  DEFAULT CHARSET=utf8mb4
  COLLATE=utf8mb4_unicode_ci
  COMMENT='Eyewear product catalogue';

-- =============================================================
--  TABLE: customers
-- =============================================================
CREATE TABLE customers (
    id            INT            NOT NULL AUTO_INCREMENT,
    email         VARCHAR(180)   NOT NULL,
    password_hash VARCHAR(255)   NOT NULL,
    first_name    VARCHAR(80)    DEFAULT NULL,
    last_name     VARCHAR(80)    DEFAULT NULL,
    created_at    TIMESTAMP      NOT NULL DEFAULT CURRENT_TIMESTAMP,

    PRIMARY KEY (id),
    UNIQUE KEY uq_customers_email (email),
    KEY idx_customers_created_at  (created_at)
) ENGINE=InnoDB
  DEFAULT CHARSET=utf8mb4
  COLLATE=utf8mb4_unicode_ci
  COMMENT='Registered storefront customers';

-- =============================================================
--  TABLE: admins
-- =============================================================
CREATE TABLE admins (
    id            INT            NOT NULL AUTO_INCREMENT,
    email         VARCHAR(180)   NOT NULL,
    password_hash VARCHAR(255)   NOT NULL,
    created_at    TIMESTAMP      NOT NULL DEFAULT CURRENT_TIMESTAMP,

    PRIMARY KEY (id),
    UNIQUE KEY uq_admins_email (email)
) ENGINE=InnoDB
  DEFAULT CHARSET=utf8mb4
  COLLATE=utf8mb4_unicode_ci
  COMMENT='Back-office administrator accounts';

-- =============================================================
--  TABLE: orders
-- =============================================================
CREATE TABLE orders (
    id               INT            NOT NULL AUTO_INCREMENT,
    customer_id      INT            DEFAULT NULL     COMMENT 'NULL for guest checkout',
    guest_email      VARCHAR(180)   DEFAULT NULL,
    status           ENUM(
                         'pending',
                         'processing',
                         'shipped',
                         'delivered',
                         'cancelled'
                     )              NOT NULL DEFAULT 'pending',
    subtotal         DECIMAL(10,2)  DEFAULT NULL,
    shipping         DECIMAL(10,2)  NOT NULL DEFAULT 0.00,
    tax              DECIMAL(10,2)  DEFAULT NULL,
    total            DECIMAL(10,2)  DEFAULT NULL,
    shipping_address JSON           DEFAULT NULL,
    payment_method   VARCHAR(40)    DEFAULT NULL,
    created_at       TIMESTAMP      NOT NULL DEFAULT CURRENT_TIMESTAMP,

    PRIMARY KEY (id),
    KEY idx_orders_customer_id  (customer_id),
    KEY idx_orders_status       (status),
    KEY idx_orders_created_at   (created_at),

    CONSTRAINT fk_orders_customer
        FOREIGN KEY (customer_id) REFERENCES customers (id)
        ON DELETE SET NULL
        ON UPDATE CASCADE
) ENGINE=InnoDB
  DEFAULT CHARSET=utf8mb4
  COLLATE=utf8mb4_unicode_ci
  COMMENT='Customer purchase orders';

-- =============================================================
--  TABLE: order_items
-- =============================================================
CREATE TABLE order_items (
    id           INT           NOT NULL AUTO_INCREMENT,
    order_id     INT           NOT NULL,
    product_id   INT           DEFAULT NULL  COMMENT 'NULL if product later deleted',
    quantity     INT           NOT NULL DEFAULT 1,
    unit_price   DECIMAL(10,2) NOT NULL,

    PRIMARY KEY (id),
    KEY idx_order_items_order_id   (order_id),
    KEY idx_order_items_product_id (product_id),

    CONSTRAINT fk_order_items_order
        FOREIGN KEY (order_id) REFERENCES orders (id)
        ON DELETE CASCADE
        ON UPDATE CASCADE,

    CONSTRAINT fk_order_items_product
        FOREIGN KEY (product_id) REFERENCES products (id)
        ON DELETE SET NULL
        ON UPDATE CASCADE
) ENGINE=InnoDB
  DEFAULT CHARSET=utf8mb4
  COLLATE=utf8mb4_unicode_ci
  COMMENT='Line items belonging to an order';

-- =============================================================
--  TABLE: wishlist
-- =============================================================
CREATE TABLE wishlist (
    id           INT       NOT NULL AUTO_INCREMENT,
    customer_id  INT       NOT NULL,
    product_id   INT       NOT NULL,

    PRIMARY KEY (id),
    UNIQUE KEY uq_wishlist_customer_product (customer_id, product_id),
    KEY idx_wishlist_product_id (product_id),

    CONSTRAINT fk_wishlist_customer
        FOREIGN KEY (customer_id) REFERENCES customers (id)
        ON DELETE CASCADE
        ON UPDATE CASCADE,

    CONSTRAINT fk_wishlist_product
        FOREIGN KEY (product_id) REFERENCES products (id)
        ON DELETE CASCADE
        ON UPDATE CASCADE
) ENGINE=InnoDB
  DEFAULT CHARSET=utf8mb4
  COLLATE=utf8mb4_unicode_ci
  COMMENT='Per-customer product wish list';
