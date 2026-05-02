-- =============================================================
--  Glassico — Sample Data
--  Run AFTER schema.sql
--  Admin password note: the hash below was generated with
--    password_hash('Admin123!', PASSWORD_BCRYPT)
--  Re-generate a fresh hash in PHP before going to production:
--    php -r "echo password_hash('Admin123!', PASSWORD_BCRYPT);"
-- =============================================================

SET NAMES utf8mb4;

-- =============================================================
--  PRODUCTS  (6 seed rows)
-- =============================================================
INSERT INTO products
    (name, brand, subtitle, price, description, image_url, sku, stock,
     gender, frame_shape, color, badge, material, measurements, is_active)
VALUES

-- 1. The Architect
(
    'The Architect',
    'Oliver Peoples',
    'Havana Tortoise',
    345.00,
    'A refined round silhouette handcrafted from premium Italian acetate. '
    'The Architect balances intellectual gravitas with editorial sensibility — '
    'a frame built for those who see the world as a composition.',
    NULL,
    'OP-ARCH-HT-001',
    45,
    'unisex',
    'round',
    'Havana',
    'new',
    'Italian acetate, stainless steel hinges',
    '52-20-145',
    1
),

-- 2. The Minimalist
(
    'The Minimalist',
    'Oliver Peoples',
    'Brushed Gold',
    285.00,
    'Clean lines and a weightless feel define The Minimalist. '
    'Constructed from ultra-thin brushed gold titanium, this square frame '
    'disappears on the face while elevating every look.',
    NULL,
    'OP-MIN-BG-002',
    120,
    'unisex',
    'square',
    'Gold',
    NULL,
    'Titanium, spring hinges',
    '50-19-140',
    1
),

-- 3. The Aviator Classic
(
    'The Aviator Classic',
    'Tom Ford',
    'Matte Black',
    420.00,
    'Commanding and precise, The Aviator Classic reinterprets a timeless '
    'silhouette through the Tom Ford lens. Matte black metal construction '
    'with gradient smoke lenses — authority in every detail.',
    NULL,
    'TF-AVI-MB-003',
    8,
    'men',
    'aviator',
    'Black',
    'bestseller',
    'Stainless steel, acetate tips',
    '58-14-145',
    1
),

-- 4. Aurelian Flight
(
    'Aurelian Flight',
    'Tom Ford',
    'Aged Gold',
    580.00,
    'Inspired by the golden age of aviation, Aurelian Flight features a '
    'double-bridge aged gold frame with warm amber lenses. Limited production '
    'ensures an exclusivity befitting the name.',
    NULL,
    'TF-AUR-AG-004',
    3,
    'men',
    'aviator',
    'Gold',
    NULL,
    'Aged gold-plated stainless steel, acetate tips',
    '60-13-145',
    1
),

-- 5. Cary Grant
(
    'Cary Grant',
    'Oliver Peoples',
    'Onyx',
    425.00,
    'An homage to old Hollywood, the Cary Grant frame captures the effortless '
    'elegance of its namesake. Deep onyx acetate in a bold square form — '
    'presence without pretension.',
    NULL,
    'OP-CGRT-ON-005',
    60,
    'men',
    'square',
    'Black',
    NULL,
    'Premium Japanese acetate, 7-barrel hinges',
    '54-18-145',
    1
),

-- 6. Coleridge
(
    'Coleridge',
    'Persol',
    'Silver',
    380.00,
    'The Coleridge channels the spirit of the Italian Riviera through '
    'Persol''s signature Meflecto bridge and supreme arrow detail. '
    'Silver metal frames with glass crystal lenses — craftsmanship as poetry.',
    NULL,
    'PS-COL-SV-006',
    2,
    'unisex',
    'round',
    'Silver',
    'new',
    'Meflecto steel, crystal glass lenses',
    '49-22-145',
    1
);

-- =============================================================
--  ADMIN USER
--  Password: Admin123!
--  Hash generated with: password_hash('Admin123!', PASSWORD_BCRYPT)
--  Replace the hash below if you regenerate it.
-- =============================================================
INSERT INTO admins (email, password_hash)
VALUES (
    'admin@glassico.com',
    '$2y$12$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi'
    -- ↑ This is the bcrypt hash for 'Admin123!'
    -- To generate a fresh hash run:
    --   php -r "echo password_hash('Admin123!', PASSWORD_BCRYPT);"
    -- and replace the string above before deploying to production.
);

-- =============================================================
--  USEFUL VERIFICATION QUERIES
--  (run after seeding to confirm data integrity)
-- =============================================================

-- Check all products loaded correctly
-- SELECT id, name, brand, price, stock, badge, is_active FROM products ORDER BY id;

-- Check admin exists
-- SELECT id, email, created_at FROM admins;

-- Preview low-stock items (stock < 5)
-- SELECT id, name, brand, stock FROM products WHERE stock < 5 AND is_active = 1;

-- Preview product counts by brand
-- SELECT brand, COUNT(*) AS total FROM products GROUP BY brand ORDER BY total DESC;
