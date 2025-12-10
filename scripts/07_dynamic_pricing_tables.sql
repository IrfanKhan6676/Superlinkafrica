-- Price history tracking
CREATE TABLE IF NOT EXISTS price_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID REFERENCES products(id) ON DELETE CASCADE,
  old_price DECIMAL(10,2),
  new_price DECIMAL(10,2),
  change_reason VARCHAR(100), -- 'manual', 'suggestion_accepted', 'market_adjustment'
  changed_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Market data for categories
CREATE TABLE IF NOT EXISTS market_data (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  category_id UUID REFERENCES categories(id) ON DELETE CASCADE,
  avg_price DECIMAL(10,2),
  median_price DECIMAL(10,2),
  min_price DECIMAL(10,2),
  max_price DECIMAL(10,2),
  total_listings INTEGER DEFAULT 0,
  sold_listings INTEGER DEFAULT 0,
  avg_days_to_sell INTEGER,
  demand_score DECIMAL(5,2), -- 0-100 demand indicator
  trend_direction VARCHAR(20), -- 'increasing', 'decreasing', 'stable'
  last_updated TIMESTAMPTZ DEFAULT NOW()
);

-- Price suggestions for products
CREATE TABLE IF NOT EXISTS price_suggestions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID REFERENCES products(id) ON DELETE CASCADE,
  current_price DECIMAL(10,2),
  suggested_price DECIMAL(10,2),
  confidence_score DECIMAL(5,2), -- 0-100 confidence in suggestion
  reasoning TEXT,
  factors JSONB, -- Store analysis factors
  status VARCHAR(20) DEFAULT 'pending', -- 'pending', 'accepted', 'rejected', 'expired'
  created_at TIMESTAMPTZ DEFAULT NOW(),
  expires_at TIMESTAMPTZ DEFAULT (NOW() + INTERVAL '7 days')
);

-- Competitive analysis data
CREATE TABLE IF NOT EXISTS competitive_analysis (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID REFERENCES products(id) ON DELETE CASCADE,
  similar_products JSONB, -- Array of similar product data
  market_position VARCHAR(20), -- 'below_market', 'at_market', 'above_market'
  competitive_advantage TEXT,
  price_recommendation DECIMAL(10,2),
  analysis_date TIMESTAMPTZ DEFAULT NOW()
);

-- Price alerts for buyers
CREATE TABLE IF NOT EXISTS price_alerts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  product_id UUID REFERENCES products(id) ON DELETE CASCADE,
  target_price DECIMAL(10,2),
  alert_type VARCHAR(20) DEFAULT 'price_drop', -- 'price_drop', 'back_in_stock'
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  triggered_at TIMESTAMPTZ
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_price_history_product_id ON price_history(product_id);
CREATE INDEX IF NOT EXISTS idx_market_data_category_id ON market_data(category_id);
CREATE INDEX IF NOT EXISTS idx_price_suggestions_product_id ON price_suggestions(product_id);
CREATE INDEX IF NOT EXISTS idx_price_suggestions_status ON price_suggestions(status);
CREATE INDEX IF NOT EXISTS idx_competitive_analysis_product_id ON competitive_analysis(product_id);
CREATE INDEX IF NOT EXISTS idx_price_alerts_user_id ON price_alerts(user_id);
CREATE INDEX IF NOT EXISTS idx_price_alerts_product_id ON price_alerts(product_id);
