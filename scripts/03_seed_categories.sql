-- Insert default categories
INSERT INTO categories (name, slug, description) VALUES
('Electronics', 'electronics', 'Phones, computers, gadgets and electronic devices'),
('Office Appliances', 'office-appliances', 'Printers, scanners, office equipment'),
('Headphones', 'headphones', 'Audio equipment and headphones'),
('Smart Watches', 'smart-watches', 'Smartwatches and wearable technology'),
('Cameras', 'cameras', 'Digital cameras and photography equipment'),
('Air Conditioners', 'air-conditioners', 'Cooling and air conditioning systems'),
('Home & Garden', 'home-garden', 'Home improvement and garden supplies'),
('Fashion', 'fashion', 'Clothing, shoes and accessories'),
('Sports & Outdoors', 'sports-outdoors', 'Sports equipment and outdoor gear'),
('Books & Media', 'books-media', 'Books, movies, music and media')
ON CONFLICT (slug) DO NOTHING;
