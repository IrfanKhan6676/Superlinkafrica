-- Critical performance indexes for Superlink marketplace

-- Users table indexes
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_users_username ON users(username);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_users_role ON users(role);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_users_location ON users USING GIST(coordinates);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_users_active ON users(is_active, last_active_at);

-- Products table indexes (most critical for performance)
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_products_seller ON products(seller_id);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_products_category ON products(category_id);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_products_status ON products(status);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_products_price ON products(price);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_products_location ON products USING GIST(coordinates);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_products_created ON products(created_at DESC);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_products_featured ON products(featured, created_at DESC);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_products_search ON products USING GIN(to_tsvector('english', title || ' ' || description));
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_products_tags ON products USING GIN(tags);

-- Composite indexes for common queries
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_products_active_category ON products(category_id, status, created_at DESC);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_products_seller_status ON products(seller_id, status, created_at DESC);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_products_price_range ON products(category_id, price, status);

-- Orders table indexes
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_orders_buyer ON orders(buyer_id, created_at DESC);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_orders_seller ON orders(seller_id, created_at DESC);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_orders_status ON orders(order_status, created_at DESC);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_orders_payment ON orders(payment_status, created_at DESC);

-- User behavior indexes for AI recommendations
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_behavior_user ON user_behavior(user_id, created_at DESC);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_behavior_action ON user_behavior(action_type, target_type, created_at DESC);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_behavior_target ON user_behavior(target_id, action_type);

-- Chat and messaging indexes
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_conversations_buyer ON conversations(buyer_id, last_message_at DESC);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_conversations_seller ON conversations(seller_id, last_message_at DESC);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_messages_conversation ON messages(conversation_id, created_at DESC);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_messages_unread ON messages(conversation_id, is_read, created_at);

-- Reviews and ratings indexes
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_reviews_product ON reviews(product_id, created_at DESC);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_reviews_reviewer ON reviews(reviewer_id, created_at DESC);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_reviews_reviewed_user ON reviews(reviewed_user_id, created_at DESC);

-- Notifications indexes
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_notifications_user ON notifications(user_id, is_read, created_at DESC);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_notifications_type ON notifications(type, created_at DESC);

-- Wishlist and likes indexes
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_wishlists_user ON wishlists(user_id, created_at DESC);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_product_likes_user ON product_likes(user_id, created_at DESC);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_product_likes_product ON product_likes(product_id, created_at DESC);

-- Social features indexes
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_connections_follower ON user_connections(follower_id, connection_type);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_connections_following ON user_connections(following_id, connection_type);

-- Analytics and reporting indexes
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_promoted_listings_user ON promoted_listings(user_id, status, created_at DESC);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_subscriptions_user ON user_subscriptions(user_id, status, ends_at);
