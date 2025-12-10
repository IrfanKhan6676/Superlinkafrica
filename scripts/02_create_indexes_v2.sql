-- Performance indexes for the enhanced schema

-- User indexes
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_username ON users(username);
CREATE INDEX IF NOT EXISTS idx_users_location ON users USING GIST(coordinates);
CREATE INDEX IF NOT EXISTS idx_users_active ON users(is_active, last_active_at);

-- Product indexes
CREATE INDEX IF NOT EXISTS idx_products_seller ON products(seller_id);
CREATE INDEX IF NOT EXISTS idx_products_category ON products(category_id);
CREATE INDEX IF NOT EXISTS idx_products_status ON products(status);
CREATE INDEX IF NOT EXISTS idx_products_location ON products USING GIST(coordinates);
CREATE INDEX IF NOT EXISTS idx_products_price ON products(price);
CREATE INDEX IF NOT EXISTS idx_products_created ON products(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_products_featured ON products(featured, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_products_promoted ON products(promoted_until) WHERE promoted_until IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_products_tags ON products USING GIN(tags);
CREATE INDEX IF NOT EXISTS idx_products_visibility ON products(visibility, status);

-- Behavior tracking indexes
CREATE INDEX IF NOT EXISTS idx_behavior_user ON user_behavior(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_behavior_action ON user_behavior(action_type, target_type, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_behavior_target ON user_behavior(target_id, action_type);

-- Social feature indexes
CREATE INDEX IF NOT EXISTS idx_connections_follower ON user_connections(follower_id, connection_type);
CREATE INDEX IF NOT EXISTS idx_connections_following ON user_connections(following_id, connection_type);
CREATE INDEX IF NOT EXISTS idx_interests_user ON user_interests(user_id);
CREATE INDEX IF NOT EXISTS idx_interests_category ON user_interests(category_id);

-- Chat indexes
CREATE INDEX IF NOT EXISTS idx_conversations_buyer ON conversations(buyer_id, status);
CREATE INDEX IF NOT EXISTS idx_conversations_seller ON conversations(seller_id, status);
CREATE INDEX IF NOT EXISTS idx_messages_conversation ON messages(conversation_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_messages_unread ON messages(sender_id, is_read) WHERE is_read = false;

-- Wishlist and likes indexes
CREATE INDEX IF NOT EXISTS idx_wishlists_user ON wishlists(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_likes_user ON product_likes(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_likes_product ON product_likes(product_id);

-- Notification indexes
CREATE INDEX IF NOT EXISTS idx_notifications_user ON notifications(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_notifications_unread ON notifications(user_id, is_read) WHERE is_read = false;

-- AI recommendation indexes
CREATE INDEX IF NOT EXISTS idx_recommendations_user ON ai_recommendations(user_id, recommendation_type, expires_at);

-- Order and transaction indexes
CREATE INDEX IF NOT EXISTS idx_orders_buyer ON orders(buyer_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_orders_seller ON orders(seller_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(order_status, payment_status);

-- Review indexes
CREATE INDEX IF NOT EXISTS idx_reviews_product ON reviews(product_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_reviews_reviewer ON reviews(reviewer_id);
CREATE INDEX IF NOT EXISTS idx_reviews_reviewed_user ON reviews(reviewed_user_id);
