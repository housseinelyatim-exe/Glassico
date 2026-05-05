-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: May 05, 2026 at 02:09 PM
-- Server version: 10.4.32-MariaDB
-- PHP Version: 8.2.12

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `glassico`
--

-- --------------------------------------------------------

--
-- Table structure for table `admins`
--

CREATE TABLE `admins` (
  `id` int(11) NOT NULL,
  `email` varchar(180) NOT NULL,
  `password_hash` varchar(255) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Back-office administrator accounts';

--
-- Dumping data for table `admins`
--

INSERT INTO `admins` (`id`, `email`, `password_hash`, `created_at`) VALUES
(2, 'admin@glassico.com', '$2y$12$0RxevgPyGKaZy/KFvhqPx.dyIAAuSgxU9CD8HACA0ib4eWL87rb.W', '2026-05-03 20:10:08');

-- --------------------------------------------------------

--
-- Table structure for table `customers`
--

CREATE TABLE `customers` (
  `id` int(11) NOT NULL,
  `email` varchar(180) NOT NULL,
  `password_hash` varchar(255) NOT NULL,
  `first_name` varchar(80) DEFAULT NULL,
  `last_name` varchar(80) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Registered storefront customers';

--
-- Dumping data for table `customers`
--

INSERT INTO `customers` (`id`, `email`, `password_hash`, `first_name`, `last_name`, `created_at`) VALUES
(2, 'admin@glassico.com', '$2y$12$0RxevgPyGKaZy/KFvhqPx.dyIAAuSgxU9CD8HACA0ib4eWL87rb.W', 'admin', 'glassico', '2026-05-03 20:11:04');

-- --------------------------------------------------------

--
-- Table structure for table `orders`
--

CREATE TABLE `orders` (
  `id` int(11) NOT NULL,
  `customer_id` int(11) DEFAULT NULL COMMENT 'NULL for guest checkout',
  `guest_email` varchar(180) DEFAULT NULL,
  `status` enum('pending','processing','shipped','delivered','cancelled') NOT NULL DEFAULT 'pending',
  `subtotal` decimal(10,2) DEFAULT NULL,
  `shipping` decimal(10,2) NOT NULL DEFAULT 0.00,
  `tax` decimal(10,2) DEFAULT NULL,
  `total` decimal(10,2) DEFAULT NULL,
  `shipping_address` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`shipping_address`)),
  `payment_method` varchar(40) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Customer purchase orders';

--
-- Dumping data for table `orders`
--

INSERT INTO `orders` (`id`, `customer_id`, `guest_email`, `status`, `subtotal`, `shipping`, `tax`, `total`, `shipping_address`, `payment_method`, `created_at`) VALUES
(1, NULL, 'elyatim.houssein.x@gmail.com', 'delivered', 100.00, 15.00, 0.00, 115.00, '{\"email\":\"elyatim.houssein.x@gmail.com\",\"first\":\"houssein\",\"last\":\"elyatim\",\"street\":\"residence errachidia 4 bloc 25 apprt 4 mourouj 3\",\"apt\":\"\",\"city\":\"mourouj 3\",\"state\":\"Ben Arous\",\"zip\":\"2074\"}', 'cod', '2026-05-04 12:37:02'),
(2, NULL, 'elyatim.houssein.x@gmail.com', 'pending', 129.99, 15.00, 0.00, 144.99, '{\"email\":\"elyatim.houssein.x@gmail.com\",\"first\":\"Houssein\",\"last\":\"Elyatim\",\"street\":\"08 rue mialn mourouj 4\",\"apt\":\"\",\"city\":\"El Mourouj\",\"state\":\"Siliana\",\"zip\":\"2074\"}', 'd17', '2026-05-05 12:43:54');

-- --------------------------------------------------------

--
-- Table structure for table `order_items`
--

CREATE TABLE `order_items` (
  `id` int(11) NOT NULL,
  `order_id` int(11) NOT NULL,
  `product_id` int(11) DEFAULT NULL COMMENT 'NULL if product later deleted',
  `quantity` int(11) NOT NULL DEFAULT 1,
  `unit_price` decimal(10,2) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Line items belonging to an order';

--
-- Dumping data for table `order_items`
--

INSERT INTO `order_items` (`id`, `order_id`, `product_id`, `quantity`, `unit_price`) VALUES
(1, 1, NULL, 1, 100.00),
(2, 2, 45, 1, 129.99);

-- --------------------------------------------------------

--
-- Table structure for table `products`
--

CREATE TABLE `products` (
  `id` int(11) NOT NULL,
  `name` varchar(120) NOT NULL,
  `brand` varchar(80) DEFAULT NULL,
  `subtitle` varchar(120) DEFAULT NULL COMMENT 'e.g. Havana Tortoise',
  `price` decimal(10,2) NOT NULL,
  `description` text DEFAULT NULL,
  `image_url` varchar(500) DEFAULT NULL COMMENT 'Cloudinary secure URL',
  `sku` varchar(40) DEFAULT NULL,
  `stock` int(11) NOT NULL DEFAULT 0,
  `gender` enum('men','women','kids','unisex') DEFAULT NULL,
  `frame_shape` enum('round','square','aviator','cat_eye') DEFAULT NULL,
  `color` varchar(40) DEFAULT NULL,
  `badge` varchar(40) DEFAULT NULL COMMENT 'new | bestseller | NULL',
  `material` varchar(120) DEFAULT NULL,
  `measurements` varchar(60) DEFAULT NULL COMMENT 'e.g. 52-20-145',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `is_active` tinyint(1) NOT NULL DEFAULT 1
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Eyewear product catalogue';

--
-- Dumping data for table `products`
--

INSERT INTO `products` (`id`, `name`, `brand`, `subtitle`, `price`, `description`, `image_url`, `sku`, `stock`, `gender`, `frame_shape`, `color`, `badge`, `material`, `measurements`, `created_at`, `is_active`) VALUES
(45, 'Skyline Aviator I', 'RayBan', 'Classic Pilot Heritage', 129.99, 'Iconic aviator with UV400 protection and lightweight metal frame for all-day comfort.', NULL, 'RB-AV-001', 44, 'men', 'aviator', 'Gold', 'new', 'Metal', '58-14-140', '2026-05-04 14:13:36', 1),
(46, 'Skyline Aviator II', 'RayBan', 'Bold Dark Edition', 149.99, 'Deep gunmetal finish with polarized lenses, perfect for outdoor adventures.', NULL, 'RB-AV-002', 30, 'men', 'aviator', 'Gunmetal', 'bestseller', 'Metal', '60-14-145', '2026-05-04 14:13:36', 1),
(47, 'Alpha Aviator', 'TomFord', 'Executive Pilot Style', 389.99, 'Premium stainless steel aviator with gradient lenses and signature T-logo temple.', NULL, 'TF-AV-003', 20, 'men', 'aviator', 'Silver', NULL, 'Stainless Steel', '57-14-145', '2026-05-04 14:13:36', 1),
(48, 'Stealth Aviator', 'TomFord', 'Matte Tactical Look', 420.00, 'Matte black finish with military-inspired design and scratch-resistant coating.', 'https://res.cloudinary.com/dwzeqbmrs/image/upload/v1777984414/9D9EGLHCUMFS_kmu8kp.jpg', 'TF-AV-004', 15, 'men', 'aviator', 'Matte Black', 'bestseller', 'Stainless Steel', '58-15-145', '2026-05-04 14:13:36', 1),
(49, 'Urban Square Elite', 'Oakley', 'Modern City Look', 249.99, 'Bold square frames for the urban professional with scratch-resistant lenses.', 'https://res.cloudinary.com/dwzeqbmrs/image/upload/v1777984413/8W44VNR0ZW63_vucfud.jpg', 'OA-SQ-005', 35, 'men', 'square', 'Matte Black', 'bestseller', 'Acetate', '54-18-145', '2026-05-04 14:13:36', 1),
(50, 'Boardroom Square', 'Persol', 'Refined Professional', 310.00, 'Handcrafted Italian acetate with meflecto temple system for superior fit.', 'https://res.cloudinary.com/dwzeqbmrs/image/upload/v1777984413/8VF2CVS0PJ7D_jm9i48.jpg', 'PE-SQ-006', 22, 'men', 'square', 'Black', NULL, 'Acetate', '53-18-140', '2026-05-04 14:13:36', 1),
(51, 'Carbon Square Pro', 'Oakley', 'Sport-Tech Precision', 275.00, 'Carbon fiber reinforced frame with Unobtainium nose pads for active wear.', 'https://res.cloudinary.com/dwzeqbmrs/image/upload/v1777984412/8TKGXDAVD1C9_sabkxe.jpg', 'OA-SQ-007', 28, 'men', 'square', 'Carbon Black', 'new', 'Carbon Fiber', '55-17-143', '2026-05-04 14:13:36', 1),
(52, 'Heritage Square', 'Persol', 'Vintage Italian Craft', 340.00, 'Supreme Venetian craftsmanship with signature arrow hinge and crystal lenses.', 'https://res.cloudinary.com/dwzeqbmrs/image/upload/v1777984412/7X9ROKXZHGPC_lb9xzn.jpg', 'PE-SQ-008', 18, 'men', 'square', 'Havana', NULL, 'Acetate', '52-20-145', '2026-05-04 14:13:36', 1),
(53, 'Round Vintage Club', 'Persol', 'Retro Gentleman Style', 299.99, 'Handcrafted round frames inspired by 1960s Italian fashion with supreme comfort.', 'https://res.cloudinary.com/dwzeqbmrs/image/upload/v1777984411/7R8C9AHAW4SN_qmlyli.jpg', 'PE-RD-009', 20, 'men', 'round', 'Tortoise', NULL, 'Acetate', '50-20-140', '2026-05-04 14:13:36', 1),
(54, 'Circle Scholar', 'Oliver Peoples', 'Intellectual Edge', 365.00, 'Thin titanium round frames with photochromic lenses, minimalist and refined.', 'https://res.cloudinary.com/dwzeqbmrs/image/upload/v1777984411/7Q63T9VT7W7X_phyrh1.jpg', 'OP-RD-010', 12, 'men', 'round', 'Antique Gold', 'new', 'Titanium', '48-22-145', '2026-05-04 14:13:36', 1),
(55, 'Neo Round Dark', 'Dior Homme', 'Dark Romanticism', 520.00, 'Ultra-slim acetate rounds with deep dark tints, a bold fashion-forward choice.', 'https://res.cloudinary.com/dwzeqbmrs/image/upload/v1777984410/6WZY7RR77YGE_rnmxyc.jpg', 'DH-RD-011', 10, 'men', 'round', 'Dark Brown', 'new', 'Acetate', '49-21-140', '2026-05-04 14:13:36', 1),
(56, 'Cat Eye Luxe', 'Gucci', 'Glamour Redefined', 589.99, 'Sophisticated cat-eye silhouette with gold-tone accents and premium acetate.', 'https://res.cloudinary.com/dwzeqbmrs/image/upload/v1777984410/6OUH6O5S2TDP_r1q1zy.jpg', 'GU-CE-012', 25, 'women', 'cat_eye', 'Rose Gold', 'new', 'Acetate', '52-16-140', '2026-05-04 14:13:36', 1),
(57, 'Feline Chic', 'Prada', 'Milan Runway Edition', 670.00, 'Sharp cat-eye design straight from the Prada runway with Swarovski detail.', 'https://res.cloudinary.com/dwzeqbmrs/image/upload/v1777984409/6K10ST3YSARA_mcq36e.jpg', 'PR-CE-013', 14, 'women', 'cat_eye', 'Black', 'bestseller', 'Acetate', '54-15-138', '2026-05-04 14:13:36', 1),
(58, 'Retro Cat Gold', 'Versace', 'Bold Italian Statement', 730.00, 'Oversized cat-eye with Versace Medusa logo temples and 18K gold plating.', 'https://res.cloudinary.com/dwzeqbmrs/image/upload/v1777984408/5CLW0CJO4P2B_ch0x4j.jpg', 'VE-CE-014', 10, 'women', 'cat_eye', 'Gold', NULL, 'Metal', '55-16-140', '2026-05-04 14:13:36', 1),
(59, 'Soft Cat Pearl', 'Chloe', 'Feminine Softness', 445.00, 'Delicate cat-eye shape with pearl inlay detail on temples, spring hinge comfort.', 'https://res.cloudinary.com/dwzeqbmrs/image/upload/v1777984408/5AN41VMMYL9A_l8zdkk.jpg', 'CH-CE-015', 18, 'women', 'cat_eye', 'Pearl White', 'new', 'Acetate', '51-17-135', '2026-05-04 14:13:36', 1),
(60, 'Havana Round Chic', 'Prada', 'Timeless Havana Pattern', 474.99, 'Elegant round frames in classic Havana, lightweight and ultra durable.', 'https://res.cloudinary.com/dwzeqbmrs/image/upload/v1777984407/4TLINGLUCC6L_nqdu7u.jpg', 'PR-RD-016', 18, 'women', 'round', 'Havana', 'bestseller', 'Acetate', '50-18-135', '2026-05-04 14:13:36', 1),
(61, 'Bohemian Circle', 'Saint Laurent', 'Free-Spirit Parisian', 560.00, 'Oversized round frames with a tortoiseshell gradient finish and UV400 lenses.', 'https://res.cloudinary.com/dwzeqbmrs/image/upload/v1777984407/4NTJ2RBMO9BT_xsrnbb.jpg', 'SL-RD-017', 15, 'women', 'round', 'Tortoise', NULL, 'Acetate', '53-19-140', '2026-05-04 14:13:36', 1),
(62, 'Luna Round Rose', 'Dior', 'Dreamy Feminine Aura', 620.00, 'Lightweight rose-tinted round frames with Dior signature on temples.', 'https://res.cloudinary.com/dwzeqbmrs/image/upload/v1777984406/3Q6L4S5PGXM5_silv3k.jpg', 'DI-RD-018', 12, 'women', 'round', 'Rose Pink', 'new', 'Acetate', '51-18-138', '2026-05-04 14:13:36', 1),
(63, 'Square Minimalist', 'Celine', 'Clean Modern Lines', 495.00, 'Ultra-minimal square frames for the contemporary woman, feather-light titanium.', 'https://res.cloudinary.com/dwzeqbmrs/image/upload/v1777984406/2U2YBCPZMSRB_oxhzhh.jpg', 'CE-SQ-019', 22, 'women', 'square', 'Crystal Clear', NULL, 'Titanium', '53-17-140', '2026-05-04 14:13:36', 1),
(64, 'Power Square Black', 'Balenciaga', 'Architectural Boldness', 850.00, 'Oversized square frames with extreme proportions, a true fashion statement.', 'https://res.cloudinary.com/dwzeqbmrs/image/upload/v1777984405/2CYCTUS0I82C_zyye58.jpg', 'BA-SQ-020', 8, 'women', 'square', 'Glossy Black', 'new', 'Acetate', '56-16-145', '2026-05-04 14:13:36', 1),
(65, 'Chic Square Nude', 'Bottega Veneta', 'Understated Luxury', 710.00, 'Square frames in nude acetate with woven-leather temple detail.', 'https://res.cloudinary.com/dwzeqbmrs/image/upload/v1777984404/0YKO01NIM9PM_vpxttd.jpg', 'BV-SQ-021', 10, 'women', 'square', 'Nude', 'bestseller', 'Acetate', '53-16-138', '2026-05-04 14:13:36', 1),
(66, 'Junior Flex Round', 'JuniorVision', 'Flexible & Safe', 119.99, 'Bendable unbreakable frames for active kids with full UV protection.', 'https://res.cloudinary.com/dwzeqbmrs/image/upload/v1777984404/0S7NS61UGWZR_wkufu8.jpg', 'JV-RD-022', 60, 'kids', 'round', 'Blue', 'new', 'TR90 Flex', '46-16-125', '2026-05-04 14:13:36', 1),
(67, 'Kids Square Fun', 'SmartKids', 'Bold & Colorful', 109.99, 'Fun square frames with spring hinges for all-day comfort, hypoallergenic.', 'https://res.cloudinary.com/dwzeqbmrs/image/upload/v1777984403/0FX5C7D0N89F_xbiolq.jpg', 'SK-SQ-023', 55, 'kids', 'square', 'Red', NULL, 'TR90 Flex', '44-15-120', '2026-05-04 14:13:36', 1),
(68, 'Mini Aviator Cool', 'JuniorVision', 'Little Pilot Edition', 129.99, 'Kid-sized aviator with shatterproof lenses and flexible memory metal frame.', 'https://res.cloudinary.com/dwzeqbmrs/image/upload/v1777984403/0BRJ7XSKXNLR_ixusn3.jpg', 'JV-AV-024', 40, 'kids', 'aviator', 'Silver', 'new', 'Memory Metal', '46-13-120', '2026-05-04 14:13:36', 1),
(69, 'Kiddo Cat Eye', 'SmartKids', 'Playful & Cute', 114.99, 'Adorable cat-eye silhouette for young fashionistas, ultra-light and safe.', 'https://res.cloudinary.com/dwzeqbmrs/image/upload/v1777984402/0B0JPVMW5YUI_th3boh.jpg', 'SK-CE-025', 35, 'kids', 'cat_eye', 'Purple', 'bestseller', 'TR90 Flex', '44-14-118', '2026-05-04 14:13:36', 1),
(70, 'Eco Aviator Sand', 'GreenSight', 'Sustainable Pilot', 189.99, 'Bio-acetate aviator with polarized lenses, made from 100% recycled materials.', 'https://res.cloudinary.com/dwzeqbmrs/image/upload/v1777984401/ESJTVX81DS8L_nkam8r.jpg', 'GS-AV-026', 38, 'unisex', 'aviator', 'Sand Beige', 'new', 'Bio-Acetate', '56-14-142', '2026-05-04 14:13:36', 1),
(71, 'Titanium Air Pro', 'Lindberg', 'Featherlight Performance', 780.00, 'Ultra-light titanium aviator, screwless construction, custom fit available.', 'https://res.cloudinary.com/dwzeqbmrs/image/upload/v1777984401/EJFH4QL6GGEP_h4pdq5.jpg', 'LI-AV-027', 15, 'unisex', 'aviator', 'Brushed Titanium', 'bestseller', 'Titanium', '57-14-145', '2026-05-04 14:13:36', 1),
(72, 'Eco Round Natural', 'GreenSight', 'Sustainable Vision', 174.99, 'Made from 100% recycled bio-acetate, lightweight eco-friendly and stylish.', 'https://res.cloudinary.com/dwzeqbmrs/image/upload/v1777984399/B43TA8GFIB62_pqnyab.jpg', 'GS-RD-028', 40, 'unisex', 'round', 'Olive Green', 'new', 'Bio-Acetate', '51-19-140', '2026-05-04 14:13:36', 1),
(73, 'Naked Round Clear', 'Warby Parker', 'Invisible Minimalism', 195.00, 'Nearly invisible clear frames with anti-reflective lenses for a clean look.', NULL, 'WP-RD-029', 33, 'unisex', 'round', 'Crystal Clear', NULL, 'Acetate', '49-20-140', '2026-05-04 14:13:36', 1),
(74, 'Retro Round Amber', 'Oliver Peoples', 'Warm California Style', 415.00, 'Warm amber frames with gradient brown lenses, handcrafted in California.', NULL, 'OP-RD-030', 20, 'unisex', 'round', 'Amber', 'bestseller', 'Acetate', '50-21-145', '2026-05-04 14:13:36', 1),
(75, 'Street Square Mono', 'Balenciaga', 'Urban Streetwear Edge', 640.00, 'Mono-lens square shield with wraparound design for maximum street impact.', NULL, 'BA-SQ-031', 12, 'unisex', 'square', 'Black', 'new', 'Acetate', '55-00-140', '2026-05-04 14:13:36', 1),
(76, 'Slim Square Steel', 'Lindberg', 'Precision Engineering', 820.00, 'Surgical-grade stainless steel square frames, minimalist and incredibly durable.', NULL, 'LI-SQ-032', 10, 'unisex', 'square', 'Brushed Steel', NULL, 'Stainless Steel', '54-17-145', '2026-05-04 14:13:36', 1),
(77, 'Classic Square Tort', 'Warby Parker', 'Everyday Confidence', 210.00, 'Well-balanced square tortoise frames with polarized lenses and case included.', NULL, 'WP-SQ-033', 50, 'unisex', 'square', 'Tortoise', 'bestseller', 'Acetate', '52-18-140', '2026-05-04 14:13:36', 1),
(78, 'Mask Futurist', 'Dior', 'Avant-Garde Shield', 950.00, 'Full wraparound shield lens with Dior logo etched in gold, futuristic design.', NULL, 'DI-SH-034', 6, 'unisex', 'square', 'White Gold', 'new', 'Injected Nylon', '60-00-135', '2026-05-04 14:13:36', 1),
(79, 'Golden Heritage', 'Cartier', 'Parisian Opulence', 990.00, '18K gold-plated frame with sapphire crystal lenses, the pinnacle of luxury eyewear.', NULL, 'CA-AV-035', 5, 'unisex', 'aviator', 'Yellow Gold', 'bestseller', '18K Gold Plated', '56-15-145', '2026-05-04 14:13:36', 1);

--
-- Indexes for dumped tables
--

--
-- Indexes for table `admins`
--
ALTER TABLE `admins`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `uq_admins_email` (`email`);

--
-- Indexes for table `customers`
--
ALTER TABLE `customers`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `uq_customers_email` (`email`),
  ADD KEY `idx_customers_created_at` (`created_at`);

--
-- Indexes for table `orders`
--
ALTER TABLE `orders`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_orders_customer_id` (`customer_id`),
  ADD KEY `idx_orders_status` (`status`),
  ADD KEY `idx_orders_created_at` (`created_at`);

--
-- Indexes for table `order_items`
--
ALTER TABLE `order_items`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_order_items_order_id` (`order_id`),
  ADD KEY `idx_order_items_product_id` (`product_id`);

--
-- Indexes for table `products`
--
ALTER TABLE `products`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `uq_products_sku` (`sku`),
  ADD KEY `idx_products_brand` (`brand`),
  ADD KEY `idx_products_gender` (`gender`),
  ADD KEY `idx_products_frame_shape` (`frame_shape`),
  ADD KEY `idx_products_badge` (`badge`),
  ADD KEY `idx_products_created_at` (`created_at`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `admins`
--
ALTER TABLE `admins`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT for table `customers`
--
ALTER TABLE `customers`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT for table `orders`
--
ALTER TABLE `orders`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT for table `order_items`
--
ALTER TABLE `order_items`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT for table `products`
--
ALTER TABLE `products`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=80;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `orders`
--
ALTER TABLE `orders`
  ADD CONSTRAINT `fk_orders_customer` FOREIGN KEY (`customer_id`) REFERENCES `customers` (`id`) ON DELETE SET NULL ON UPDATE CASCADE;

--
-- Constraints for table `order_items`
--
ALTER TABLE `order_items`
  ADD CONSTRAINT `fk_order_items_order` FOREIGN KEY (`order_id`) REFERENCES `orders` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `fk_order_items_product` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`) ON DELETE SET NULL ON UPDATE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
