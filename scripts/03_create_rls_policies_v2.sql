-- Row Level Security policies for enhanced schema

-- Enable RLS on all tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_interests ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_connections ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_media ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_behavior ENABLE ROW LEVEL SECURITY;
ALTER TABLE wishlists ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_discussions ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_badges ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE promoted_listings ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_recommendations ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;

-- User policies
CREATE POLICY "Users can view public profiles" ON users FOR SELECT USING (true);
CREATE POLICY "Users can update own profile" ON users FOR UPDATE USING (auth.uid() = id);

-- Product policies with visibility controls
CREATE POLICY "Public products visible to all" ON products FOR SELECT USING (
  visibility = 'public' AND status = 'active'
);
CREATE POLICY "Friends products visible to friends" ON products FOR SELECT USING (
  visibility = 'friends' AND status = 'active' AND (
    seller_id = auth.uid() OR
    EXISTS (
      SELECT 1 FROM user_connections 
      WHERE follower_id = auth.uid() AND following_id = seller_id AND connection_type = 'friend'
    )
  )
);
CREATE POLICY "Sellers can manage own products" ON products FOR ALL USING (seller_id = auth.uid());

-- Chat policies
CREATE POLICY "Users can view own conversations" ON conversations FOR SELECT USING (
  buyer_id = auth.uid() OR seller_id = auth.uid()
);
CREATE POLICY "Users can view messages in own conversations" ON messages FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM conversations 
    WHERE id = conversation_id AND (buyer_id = auth.uid() OR seller_id = auth.uid())
  )
);

-- Wishlist policies
CREATE POLICY "Users can manage own wishlist" ON wishlists FOR ALL USING (user_id = auth.uid());

-- Notification policies
CREATE POLICY "Users can view own notifications" ON notifications FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "Users can update own notifications" ON notifications FOR UPDATE USING (user_id = auth.uid());

-- AI recommendation policies
CREATE POLICY "Users can view own recommendations" ON ai_recommendations FOR SELECT USING (user_id = auth.uid());

-- Order policies
CREATE POLICY "Users can view own orders" ON orders FOR SELECT USING (
  buyer_id = auth.uid() OR seller_id = auth.uid()
);

-- Review policies
CREATE POLICY "Reviews are publicly viewable" ON reviews FOR SELECT USING (true);
CREATE POLICY "Users can create reviews for own orders" ON reviews FOR INSERT WITH CHECK (
  reviewer_id = auth.uid() AND
  EXISTS (
    SELECT 1 FROM orders 
    WHERE id = order_id AND (buyer_id = auth.uid() OR seller_id = auth.uid())
  )
);
