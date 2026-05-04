INSERT INTO products
(name, brand, subtitle, price, description, sku, stock, gender, frame_shape, color, badge, material, measurements)
VALUES

-- Men's Aviator
('Skyline Aviator I', 'RayBan', 'Classic Pilot Heritage', 129.99,
 'Iconic aviator with UV400 protection and lightweight metal frame for all-day comfort.',
 'RB-AV-001', 45, 'men', 'aviator', 'Gold', 'new', 'Metal', '58-14-140'),

('Skyline Aviator II', 'RayBan', 'Bold Dark Edition', 149.99,
 'Deep gunmetal finish with polarized lenses, perfect for outdoor adventures.',
 'RB-AV-002', 30, 'men', 'aviator', 'Gunmetal', 'bestseller', 'Metal', '60-14-145'),

('Alpha Aviator', 'TomFord', 'Executive Pilot Style', 389.99,
 'Premium stainless steel aviator with gradient lenses and signature T-logo temple.',
 'TF-AV-003', 20, 'men', 'aviator', 'Silver', NULL, 'Stainless Steel', '57-14-145'),

('Stealth Aviator', 'TomFord', 'Matte Tactical Look', 420.00,
 'Matte black finish with military-inspired design and scratch-resistant coating.',
 'TF-AV-004', 15, 'men', 'aviator', 'Matte Black', 'bestseller', 'Stainless Steel', '58-15-145'),

-- Men's Square
('Urban Square Elite', 'Oakley', 'Modern City Look', 249.99,
 'Bold square frames for the urban professional with scratch-resistant lenses.',
 'OA-SQ-005', 35, 'men', 'square', 'Matte Black', 'bestseller', 'Acetate', '54-18-145'),

('Boardroom Square', 'Persol', 'Refined Professional', 310.00,
 'Handcrafted Italian acetate with meflecto temple system for superior fit.',
 'PE-SQ-006', 22, 'men', 'square', 'Black', NULL, 'Acetate', '53-18-140'),

('Carbon Square Pro', 'Oakley', 'Sport-Tech Precision', 275.00,
 'Carbon fiber reinforced frame with Unobtainium nose pads for active wear.',
 'OA-SQ-007', 28, 'men', 'square', 'Carbon Black', 'new', 'Carbon Fiber', '55-17-143'),

('Heritage Square', 'Persol', 'Vintage Italian Craft', 340.00,
 'Supreme Venetian craftsmanship with signature arrow hinge and crystal lenses.',
 'PE-SQ-008', 18, 'men', 'square', 'Havana', NULL, 'Acetate', '52-20-145'),

-- Men's Round
('Round Vintage Club', 'Persol', 'Retro Gentleman Style', 299.99,
 'Handcrafted round frames inspired by 1960s Italian fashion with supreme comfort.',
 'PE-RD-009', 20, 'men', 'round', 'Tortoise', NULL, 'Acetate', '50-20-140'),

('Circle Scholar', 'Oliver Peoples', 'Intellectual Edge', 365.00,
 'Thin titanium round frames with photochromic lenses, minimalist and refined.',
 'OP-RD-010', 12, 'men', 'round', 'Antique Gold', 'new', 'Titanium', '48-22-145'),

('Neo Round Dark', 'Dior Homme', 'Dark Romanticism', 520.00,
 'Ultra-slim acetate rounds with deep dark tints, a bold fashion-forward choice.',
 'DH-RD-011', 10, 'men', 'round', 'Dark Brown', 'new', 'Acetate', '49-21-140'),

-- Women's Cat Eye
('Cat Eye Luxe', 'Gucci', 'Glamour Redefined', 589.99,
 'Sophisticated cat-eye silhouette with gold-tone accents and premium acetate.',
 'GU-CE-012', 25, 'women', 'cat_eye', 'Rose Gold', 'new', 'Acetate', '52-16-140'),

('Feline Chic', 'Prada', 'Milan Runway Edition', 670.00,
 'Sharp cat-eye design straight from the Prada runway with Swarovski detail.',
 'PR-CE-013', 14, 'women', 'cat_eye', 'Black', 'bestseller', 'Acetate', '54-15-138'),

('Retro Cat Gold', 'Versace', 'Bold Italian Statement', 730.00,
 'Oversized cat-eye with Versace Medusa logo temples and 18K gold plating.',
 'VE-CE-014', 10, 'women', 'cat_eye', 'Gold', NULL, 'Metal', '55-16-140'),

('Soft Cat Pearl', 'Chloe', 'Feminine Softness', 445.00,
 'Delicate cat-eye shape with pearl inlay detail on temples, spring hinge comfort.',
 'CH-CE-015', 18, 'women', 'cat_eye', 'Pearl White', 'new', 'Acetate', '51-17-135'),

-- Women's Round
('Havana Round Chic', 'Prada', 'Timeless Havana Pattern', 474.99,
 'Elegant round frames in classic Havana, lightweight and ultra durable.',
 'PR-RD-016', 18, 'women', 'round', 'Havana', 'bestseller', 'Acetate', '50-18-135'),

('Bohemian Circle', 'Saint Laurent', 'Free-Spirit Parisian', 560.00,
 'Oversized round frames with a tortoiseshell gradient finish and UV400 lenses.',
 'SL-RD-017', 15, 'women', 'round', 'Tortoise', NULL, 'Acetate', '53-19-140'),

('Luna Round Rose', 'Dior', 'Dreamy Feminine Aura', 620.00,
 'Lightweight rose-tinted round frames with Dior signature on temples.',
 'DI-RD-018', 12, 'women', 'round', 'Rose Pink', 'new', 'Acetate', '51-18-138'),

-- Women's Square
('Square Minimalist', 'Celine', 'Clean Modern Lines', 495.00,
 'Ultra-minimal square frames for the contemporary woman, feather-light titanium.',
 'CE-SQ-019', 22, 'women', 'square', 'Crystal Clear', NULL, 'Titanium', '53-17-140'),

('Power Square Black', 'Balenciaga', 'Architectural Boldness', 850.00,
 'Oversized square frames with extreme proportions, a true fashion statement.',
 'BA-SQ-020', 8, 'women', 'square', 'Glossy Black', 'new', 'Acetate', '56-16-145'),

('Chic Square Nude', 'Bottega Veneta', 'Understated Luxury', 710.00,
 'Square frames in nude acetate with woven-leather temple detail.',
 'BV-SQ-021', 10, 'women', 'square', 'Nude', 'bestseller', 'Acetate', '53-16-138'),

-- Kids
('Junior Flex Round', 'JuniorVision', 'Flexible & Safe', 119.99,
 'Bendable unbreakable frames for active kids with full UV protection.',
 'JV-RD-022', 60, 'kids', 'round', 'Blue', 'new', 'TR90 Flex', '46-16-125'),

('Kids Square Fun', 'SmartKids', 'Bold & Colorful', 109.99,
 'Fun square frames with spring hinges for all-day comfort, hypoallergenic.',
 'SK-SQ-023', 55, 'kids', 'square', 'Red', NULL, 'TR90 Flex', '44-15-120'),

('Mini Aviator Cool', 'JuniorVision', 'Little Pilot Edition', 129.99,
 'Kid-sized aviator with shatterproof lenses and flexible memory metal frame.',
 'JV-AV-024', 40, 'kids', 'aviator', 'Silver', 'new', 'Memory Metal', '46-13-120'),

('Kiddo Cat Eye', 'SmartKids', 'Playful & Cute', 114.99,
 'Adorable cat-eye silhouette for young fashionistas, ultra-light and safe.',
 'SK-CE-025', 35, 'kids', 'cat_eye', 'Purple', 'bestseller', 'TR90 Flex', '44-14-118'),

-- Unisex Aviator
('Eco Aviator Sand', 'GreenSight', 'Sustainable Pilot', 189.99,
 'Bio-acetate aviator with polarized lenses, made from 100% recycled materials.',
 'GS-AV-026', 38, 'unisex', 'aviator', 'Sand Beige', 'new', 'Bio-Acetate', '56-14-142'),

('Titanium Air Pro', 'Lindberg', 'Featherlight Performance', 780.00,
 'Ultra-light titanium aviator, screwless construction, custom fit available.',
 'LI-AV-027', 15, 'unisex', 'aviator', 'Brushed Titanium', 'bestseller', 'Titanium', '57-14-145'),

-- Unisex Round
('Eco Round Natural', 'GreenSight', 'Sustainable Vision', 174.99,
 'Made from 100% recycled bio-acetate, lightweight eco-friendly and stylish.',
 'GS-RD-028', 40, 'unisex', 'round', 'Olive Green', 'new', 'Bio-Acetate', '51-19-140'),

('Naked Round Clear', 'Warby Parker', 'Invisible Minimalism', 195.00,
 'Nearly invisible clear frames with anti-reflective lenses for a clean look.',
 'WP-RD-029', 33, 'unisex', 'round', 'Crystal Clear', NULL, 'Acetate', '49-20-140'),

('Retro Round Amber', 'Oliver Peoples', 'Warm California Style', 415.00,
 'Warm amber frames with gradient brown lenses, handcrafted in California.',
 'OP-RD-030', 20, 'unisex', 'round', 'Amber', 'bestseller', 'Acetate', '50-21-145'),

-- Unisex Square
('Street Square Mono', 'Balenciaga', 'Urban Streetwear Edge', 640.00,
 'Mono-lens square shield with wraparound design for maximum street impact.',
 'BA-SQ-031', 12, 'unisex', 'square', 'Black', 'new', 'Acetate', '55-00-140'),

('Slim Square Steel', 'Lindberg', 'Precision Engineering', 820.00,
 'Surgical-grade stainless steel square frames, minimalist and incredibly durable.',
 'LI-SQ-032', 10, 'unisex', 'square', 'Brushed Steel', NULL, 'Stainless Steel', '54-17-145'),

('Classic Square Tort', 'Warby Parker', 'Everyday Confidence', 210.00,
 'Well-balanced square tortoise frames with polarized lenses and case included.',
 'WP-SQ-033', 50, 'unisex', 'square', 'Tortoise', 'bestseller', 'Acetate', '52-18-140'),

-- Bonus premium picks
('Mask Futurist', 'Dior', 'Avant-Garde Shield', 950.00,
 'Full wraparound shield lens with Dior logo etched in gold, futuristic design.',
 'DI-SH-034', 6, 'unisex', 'square', 'White Gold', 'new', 'Injected Nylon', '60-00-135'),

('Golden Heritage', 'Cartier', 'Parisian Opulence', 990.00,
 '18K gold-plated frame with sapphire crystal lenses, the pinnacle of luxury eyewear.',
 'CA-AV-035', 5, 'unisex', 'aviator', 'Yellow Gold', 'bestseller', '18K Gold Plated', '56-15-145');