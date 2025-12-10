-- Analytics aggregation tables
CREATE TABLE IF NOT EXISTS analytics_daily (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  date DATE NOT NULL,
  metric_type VARCHAR(50) NOT NULL, -- 'sales', 'users', 'products', 'revenue'
  category_id UUID REFERENCES categories(id),
  user_id UUID REFERENCES auth.users(id),
  metric_value DECIMAL(15,2) NOT NULL,
  additional_data JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- User analytics tracking
CREATE TABLE IF NOT EXISTS user_analytics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  session_id VARCHAR(100),
  event_type VARCHAR(50) NOT NULL, -- 'page_view', 'product_view', 'search', 'purchase'
  event_data JSONB,
  page_url TEXT,
  referrer TEXT,
  user_agent TEXT,
  ip_address INET,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Product performance analytics
CREATE TABLE IF NOT EXISTS product_analytics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID REFERENCES products(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  views INTEGER DEFAULT 0,
  likes INTEGER DEFAULT 0,
  shares INTEGER DEFAULT 0,
  inquiries INTEGER DEFAULT 0,
  purchases INTEGER DEFAULT 0,
  revenue DECIMAL(10,2) DEFAULT 0,
  conversion_rate DECIMAL(5,4) DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Seller performance metrics
CREATE TABLE IF NOT EXISTS seller_analytics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  seller_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  total_listings INTEGER DEFAULT 0,
  active_listings INTEGER DEFAULT 0,
  views INTEGER DEFAULT 0,
  inquiries INTEGER DEFAULT 0,
  sales INTEGER DEFAULT 0,
  revenue DECIMAL(10,2) DEFAULT 0,
  avg_rating DECIMAL(3,2) DEFAULT 0,
  response_time_hours DECIMAL(5,2) DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Market trends and insights
CREATE TABLE IF NOT EXISTS market_trends (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  category_id UUID REFERENCES categories(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  trend_type VARCHAR(30) NOT NULL, -- 'demand', 'supply', 'price', 'popularity'
  trend_value DECIMAL(10,4),
  trend_direction VARCHAR(20), -- 'increasing', 'decreasing', 'stable'
  confidence_score DECIMAL(5,2),
  factors JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Revenue analytics
CREATE TABLE IF NOT EXISTS revenue_analytics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  date DATE NOT NULL,
  revenue_type VARCHAR(30) NOT NULL, -- 'sales_commission', 'subscription', 'ads', 'delivery'
  gross_revenue DECIMAL(12,2) DEFAULT 0,
  net_revenue DECIMAL(12,2) DEFAULT 0,
  transaction_count INTEGER DEFAULT 0,
  avg_transaction_value DECIMAL(10,2) DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Geographic analytics
CREATE TABLE IF NOT EXISTS geographic_analytics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  date DATE NOT NULL,
  city VARCHAR(100) NOT NULL,
  region VARCHAR(100),
  users_count INTEGER DEFAULT 0,
  sellers_count INTEGER DEFAULT 0,
  products_count INTEGER DEFAULT 0,
  transactions_count INTEGER DEFAULT 0,
  revenue DECIMAL(10,2) DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_analytics_daily_date ON analytics_daily(date);
CREATE INDEX IF NOT EXISTS idx_analytics_daily_type ON analytics_daily(metric_type);
CREATE INDEX IF NOT EXISTS idx_user_analytics_user_id ON user_analytics(user_id);
CREATE INDEX IF NOT EXISTS idx_user_analytics_event_type ON user_analytics(event_type);
CREATE INDEX IF NOT EXISTS idx_product_analytics_product_id ON product_analytics(product_id);
CREATE INDEX IF NOT EXISTS idx_product_analytics_date ON product_analytics(date);
CREATE INDEX IF NOT EXISTS idx_seller_analytics_seller_id ON seller_analytics(seller_id);
CREATE INDEX IF NOT EXISTS idx_seller_analytics_date ON seller_analytics(date);
CREATE INDEX IF NOT EXISTS idx_market_trends_category ON market_trends(category_id);
CREATE INDEX IF NOT EXISTS idx_revenue_analytics_date ON revenue_analytics(date);
CREATE INDEX IF NOT EXISTS idx_geographic_analytics_city ON geographic_analytics(city);

-- Create unique constraints
CREATE UNIQUE INDEX IF NOT EXISTS idx_analytics_daily_unique ON analytics_daily(date, metric_type, COALESCE(category_id::text, ''), COALESCE(user_id::text, ''));
CREATE UNIQUE INDEX IF NOT EXISTS idx_product_analytics_unique ON product_analytics(product_id, date);
CREATE UNIQUE INDEX IF NOT EXISTS idx_seller_analytics_unique ON seller_analytics(seller_id, date);
CREATE UNIQUE INDEX IF NOT EXISTS idx_revenue_analytics_unique ON revenue_analytics(date, revenue_type);
CREATE UNIQUE INDEX IF NOT EXISTS idx_geographic_analytics_unique ON geographic_analytics(date, city);
