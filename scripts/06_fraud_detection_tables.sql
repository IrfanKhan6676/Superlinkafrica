-- Adding fraud detection and ID verification tables
-- National ID verification table
CREATE TABLE IF NOT EXISTS national_id_verifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  id_number_hash TEXT UNIQUE NOT NULL, -- Hashed ID number for privacy
  id_type VARCHAR(50) NOT NULL, -- 'nrc', 'passport', etc.
  verification_status VARCHAR(20) DEFAULT 'pending', -- 'pending', 'verified', 'rejected'
  verification_date TIMESTAMPTZ,
  verification_notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Fraud detection alerts table
CREATE TABLE IF NOT EXISTS fraud_alerts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  alert_type VARCHAR(50) NOT NULL, -- 'fake_name', 'duplicate_id', 'suspicious_behavior'
  severity VARCHAR(20) DEFAULT 'medium', -- 'low', 'medium', 'high', 'critical'
  description TEXT NOT NULL,
  evidence JSONB, -- Store evidence data
  status VARCHAR(20) DEFAULT 'open', -- 'open', 'investigating', 'resolved', 'false_positive'
  assigned_admin UUID,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  resolved_at TIMESTAMPTZ
);

-- User behavior tracking for anomaly detection
CREATE TABLE IF NOT EXISTS user_behavior_patterns (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  behavior_type VARCHAR(50) NOT NULL, -- 'listing_frequency', 'login_pattern', 'message_pattern'
  pattern_data JSONB NOT NULL, -- Store behavior metrics
  anomaly_score DECIMAL(5,2) DEFAULT 0, -- 0-100 anomaly score
  last_updated TIMESTAMPTZ DEFAULT NOW()
);

-- Account suspension tracking
CREATE TABLE IF NOT EXISTS account_suspensions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  reason TEXT NOT NULL,
  suspension_type VARCHAR(20) DEFAULT 'temporary', -- 'temporary', 'permanent'
  suspended_by UUID,
  suspended_at TIMESTAMPTZ DEFAULT NOW(),
  expires_at TIMESTAMPTZ,
  lifted_at TIMESTAMPTZ,
  status VARCHAR(20) DEFAULT 'active' -- 'active', 'lifted', 'expired'
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_fraud_alerts_user_id ON fraud_alerts(user_id);
CREATE INDEX IF NOT EXISTS idx_fraud_alerts_status ON fraud_alerts(status);
CREATE INDEX IF NOT EXISTS idx_behavior_patterns_user_id ON user_behavior_patterns(user_id);
CREATE INDEX IF NOT EXISTS idx_suspensions_user_id ON account_suspensions(user_id);
CREATE INDEX IF NOT EXISTS idx_suspensions_status ON account_suspensions(status);
