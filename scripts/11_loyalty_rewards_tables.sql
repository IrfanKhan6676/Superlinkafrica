-- User loyalty points and tiers
CREATE TABLE IF NOT EXISTS user_loyalty (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
  total_points INTEGER DEFAULT 0,
  available_points INTEGER DEFAULT 0,
  tier_level VARCHAR(20) DEFAULT 'bronze', -- 'bronze', 'silver', 'gold', 'platinum'
  tier_progress INTEGER DEFAULT 0, -- Points toward next tier
  lifetime_spent DECIMAL(12,2) DEFAULT 0,
  referral_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Points transactions history
CREATE TABLE IF NOT EXISTS points_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  transaction_type VARCHAR(30) NOT NULL, -- 'earned', 'redeemed', 'expired', 'bonus'
  points_amount INTEGER NOT NULL,
  source VARCHAR(50) NOT NULL, -- 'purchase', 'referral', 'review', 'daily_login', 'campaign'
  source_id UUID, -- Reference to order, referral, etc.
  description TEXT,
  expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Reward catalog
CREATE TABLE IF NOT EXISTS rewards_catalog (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title VARCHAR(255) NOT NULL,
  description TEXT,
  reward_type VARCHAR(30) NOT NULL, -- 'discount', 'cashback', 'free_shipping', 'product', 'experience'
  points_cost INTEGER NOT NULL,
  monetary_value DECIMAL(8,2),
  discount_percentage DECIMAL(5,2),
  min_tier_required VARCHAR(20) DEFAULT 'bronze',
  max_redemptions INTEGER, -- NULL for unlimited
  current_redemptions INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  valid_from TIMESTAMPTZ DEFAULT NOW(),
  valid_until TIMESTAMPTZ,
  terms_conditions TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- User reward redemptions
CREATE TABLE IF NOT EXISTS reward_redemptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  reward_id UUID REFERENCES rewards_catalog(id),
  points_used INTEGER NOT NULL,
  redemption_code VARCHAR(50) UNIQUE,
  status VARCHAR(20) DEFAULT 'active', -- 'active', 'used', 'expired', 'cancelled'
  used_at TIMESTAMPTZ,
  expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Referral system
CREATE TABLE IF NOT EXISTS referrals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  referrer_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  referred_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  referral_code VARCHAR(20) UNIQUE NOT NULL,
  status VARCHAR(20) DEFAULT 'pending', -- 'pending', 'completed', 'rewarded'
  referrer_bonus INTEGER DEFAULT 0,
  referred_bonus INTEGER DEFAULT 0,
  completed_at TIMESTAMPTZ,
  rewarded_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Loyalty campaigns and promotions
CREATE TABLE IF NOT EXISTS loyalty_campaigns (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  description TEXT,
  campaign_type VARCHAR(30) NOT NULL, -- 'points_multiplier', 'bonus_points', 'tier_boost', 'special_reward'
  rules JSONB NOT NULL, -- Campaign rules and conditions
  rewards JSONB NOT NULL, -- Reward structure
  target_audience JSONB, -- User segments, tiers, etc.
  is_active BOOLEAN DEFAULT true,
  start_date TIMESTAMPTZ NOT NULL,
  end_date TIMESTAMPTZ NOT NULL,
  max_participants INTEGER,
  current_participants INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Campaign participation tracking
CREATE TABLE IF NOT EXISTS campaign_participations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_id UUID REFERENCES loyalty_campaigns(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  participation_data JSONB,
  rewards_earned JSONB,
  status VARCHAR(20) DEFAULT 'active', -- 'active', 'completed', 'disqualified'
  joined_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ
);

-- Daily check-in streaks
CREATE TABLE IF NOT EXISTS daily_checkins (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  checkin_date DATE NOT NULL,
  streak_count INTEGER DEFAULT 1,
  points_earned INTEGER DEFAULT 0,
  bonus_applied BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, checkin_date)
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_user_loyalty_user_id ON user_loyalty(user_id);
CREATE INDEX IF NOT EXISTS idx_user_loyalty_tier ON user_loyalty(tier_level);
CREATE INDEX IF NOT EXISTS idx_points_transactions_user_id ON points_transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_points_transactions_type ON points_transactions(transaction_type);
CREATE INDEX IF NOT EXISTS idx_reward_redemptions_user_id ON reward_redemptions(user_id);
CREATE INDEX IF NOT EXISTS idx_reward_redemptions_status ON reward_redemptions(status);
CREATE INDEX IF NOT EXISTS idx_referrals_referrer ON referrals(referrer_id);
CREATE INDEX IF NOT EXISTS idx_referrals_referred ON referrals(referred_id);
CREATE INDEX IF NOT EXISTS idx_referrals_code ON referrals(referral_code);
CREATE INDEX IF NOT EXISTS idx_campaign_participations_campaign ON campaign_participations(campaign_id);
CREATE INDEX IF NOT EXISTS idx_campaign_participations_user ON campaign_participations(user_id);
CREATE INDEX IF NOT EXISTS idx_daily_checkins_user_date ON daily_checkins(user_id, checkin_date);

-- Generate referral codes
CREATE OR REPLACE FUNCTION generate_referral_code()
RETURNS TEXT AS $$
BEGIN
  RETURN 'REF' || UPPER(SUBSTRING(MD5(RANDOM()::TEXT), 1, 8));
END;
$$ LANGUAGE plpgsql;

-- Tier thresholds (points required for each tier)
CREATE OR REPLACE FUNCTION get_tier_from_points(points INTEGER)
RETURNS TEXT AS $$
BEGIN
  IF points >= 50000 THEN RETURN 'platinum';
  ELSIF points >= 20000 THEN RETURN 'gold';
  ELSIF points >= 5000 THEN RETURN 'silver';
  ELSE RETURN 'bronze';
  END IF;
END;
$$ LANGUAGE plpgsql;

-- Auto-expire points function
CREATE OR REPLACE FUNCTION expire_old_points()
RETURNS void AS $$
BEGIN
  -- Mark points as expired (1 year expiry)
  UPDATE points_transactions 
  SET transaction_type = 'expired'
  WHERE expires_at < NOW() 
  AND transaction_type = 'earned';
  
  -- Update user available points
  UPDATE user_loyalty 
  SET available_points = (
    SELECT COALESCE(SUM(
      CASE 
        WHEN transaction_type = 'earned' THEN points_amount
        WHEN transaction_type = 'redeemed' THEN -points_amount
        WHEN transaction_type = 'expired' THEN -points_amount
        ELSE 0
      END
    ), 0)
    FROM points_transactions 
    WHERE points_transactions.user_id = user_loyalty.user_id
  );
END;
$$ LANGUAGE plpgsql;
