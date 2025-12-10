-- Insert test user data (assumes user has already signed up through Supabase Auth)
-- This script should be run after the user signs up through the normal flow

-- Insert first test user into users table
INSERT INTO users (
  id,
  email,
  full_name,
  phone,
  role,
  status,
  created_at,
  updated_at
) VALUES (
  -- Note: This ID should match the Supabase Auth user ID after signup
  gen_random_uuid(),
  'joshuamuhali95@gmail.com',
  'Joshua Muhali',
  '+260123456789',
  'seller',
  'active',
  NOW(),
  NOW()
) ON CONFLICT (email) DO UPDATE SET
  full_name = EXCLUDED.full_name,
  phone = EXCLUDED.phone,
  role = EXCLUDED.role,
  updated_at = NOW();

-- Insert second test user into users table
INSERT INTO users (
  id,
  email,
  full_name,
  phone,
  role,
  status,
  created_at,
  updated_at
) VALUES (
  gen_random_uuid(),
  'Charlesmsuccess@gmail.com',
  'Charles M Success',
  '+260987654321',
  'seller',
  'active',
  NOW(),
  NOW()
) ON CONFLICT (email) DO UPDATE SET
  full_name = EXCLUDED.full_name,
  phone = EXCLUDED.phone,
  role = EXCLUDED.role,
  updated_at = NOW();

-- Insert seller verification for first test user
INSERT INTO seller_verifications (
  user_id,
  business_name,
  document_type,
  document_number,
  status,
  created_at,
  updated_at
) VALUES (
  (SELECT id FROM users WHERE email = 'joshuamuhali95@gmail.com'),
  'Josh Electronics Store',
  'nrc',
  '123456/78/9',
  'approved',
  NOW(),
  NOW()
) ON CONFLICT (user_id) DO UPDATE SET
  business_name = EXCLUDED.business_name,
  status = EXCLUDED.status,
  updated_at = NOW();

-- Insert seller verification for second test user
INSERT INTO seller_verifications (
  user_id,
  business_name,
  document_type,
  document_number,
  status,
  created_at,
  updated_at
) VALUES (
  (SELECT id FROM users WHERE email = 'Charlesmsuccess@gmail.com'),
  'Charles Tech Solutions',
  'nrc',
  '987654/32/1',
  'approved',
  NOW(),
  NOW()
) ON CONFLICT (user_id) DO UPDATE SET
  business_name = EXCLUDED.business_name,
  status = EXCLUDED.status,
  updated_at = NOW();

-- Insert some test products for the first seller
INSERT INTO products (
  id,
  seller_id,
  title,
  description,
  price,
  category_id,
  condition,
  listing_type,
  status,
  images,
  created_at,
  updated_at
) VALUES 
(
  gen_random_uuid(),
  (SELECT id FROM users WHERE email = 'joshuamuhali95@gmail.com'),
  'iPhone 14 Pro Max',
  'Brand new iPhone 14 Pro Max, 256GB, Space Black. Still in original packaging with all accessories.',
  8500.00,
  (SELECT id FROM categories WHERE name = 'Electronics'),
  'new',
  'fixed',
  'active',
  ARRAY['/placeholder.svg?height=400&width=400'],
  NOW(),
  NOW()
),
(
  gen_random_uuid(),
  (SELECT id FROM users WHERE email = 'joshuamuhali95@gmail.com'),
  'Samsung 55" Smart TV',
  'Samsung 55-inch 4K Smart TV with HDR. Excellent condition, barely used.',
  4200.00,
  (SELECT id FROM categories WHERE name = 'Electronics'),
  'used',
  'auction',
  'active',
  ARRAY['/placeholder.svg?height=400&width=400'],
  NOW(),
  NOW()
);

-- Insert some test products for the second seller
INSERT INTO products (
  id,
  seller_id,
  title,
  description,
  price,
  category_id,
  condition,
  listing_type,
  status,
  images,
  created_at,
  updated_at
) VALUES 
(
  gen_random_uuid(),
  (SELECT id FROM users WHERE email = 'Charlesmsuccess@gmail.com'),
  'MacBook Pro 16-inch',
  'Apple MacBook Pro 16-inch with M2 Pro chip, 512GB SSD, 16GB RAM. Perfect for professionals.',
  12500.00,
  (SELECT id FROM categories WHERE name = 'Electronics'),
  'new',
  'fixed',
  'active',
  ARRAY['/placeholder.svg?height=400&width=400'],
  NOW(),
  NOW()
),
(
  gen_random_uuid(),
  (SELECT id FROM users WHERE email = 'Charlesmsuccess@gmail.com'),
  'Gaming Chair',
  'Ergonomic gaming chair with lumbar support. Great condition, used for 6 months.',
  850.00,
  (SELECT id FROM categories WHERE name = 'Office Appliances'),
  'used',
  'auction',
  'active',
  ARRAY['/placeholder.svg?height=400&width=400'],
  NOW(),
  NOW()
);
