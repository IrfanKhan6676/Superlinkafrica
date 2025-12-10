-- Delivery partners (bikers and bus companies)
CREATE TABLE IF NOT EXISTS delivery_partners (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  partner_type VARCHAR(20) NOT NULL, -- 'biker', 'bus_company'
  business_name VARCHAR(255),
  license_number VARCHAR(100),
  vehicle_details JSONB, -- Store vehicle info, capacity, etc.
  service_areas JSONB, -- Array of areas they serve
  base_rate DECIMAL(8,2), -- Base delivery rate
  per_km_rate DECIMAL(8,2), -- Rate per kilometer
  availability_schedule JSONB, -- Working hours and days
  is_active BOOLEAN DEFAULT true,
  is_verified BOOLEAN DEFAULT false,
  rating DECIMAL(3,2) DEFAULT 0,
  total_deliveries INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Bus routes for intercity delivery
CREATE TABLE IF NOT EXISTS bus_routes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  partner_id UUID REFERENCES delivery_partners(id) ON DELETE CASCADE,
  route_name VARCHAR(255) NOT NULL,
  origin_city VARCHAR(100) NOT NULL,
  destination_city VARCHAR(100) NOT NULL,
  departure_times JSONB, -- Array of departure times
  journey_duration INTEGER, -- Duration in minutes
  parcel_capacity INTEGER DEFAULT 50,
  rate_per_parcel DECIMAL(8,2),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Shipments and deliveries
CREATE TABLE IF NOT EXISTS shipments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
  delivery_partner_id UUID REFERENCES delivery_partners(id),
  shipment_type VARCHAR(20) NOT NULL, -- 'biker', 'bus'
  pickup_address JSONB NOT NULL,
  delivery_address JSONB NOT NULL,
  pickup_scheduled_at TIMESTAMPTZ,
  pickup_completed_at TIMESTAMPTZ,
  delivery_scheduled_at TIMESTAMPTZ,
  delivery_completed_at TIMESTAMPTZ,
  status VARCHAR(30) DEFAULT 'pending', -- 'pending', 'assigned', 'picked_up', 'in_transit', 'delivered', 'failed'
  tracking_number VARCHAR(50) UNIQUE,
  estimated_delivery TIMESTAMPTZ,
  delivery_cost DECIMAL(8,2),
  special_instructions TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Real-time tracking data
CREATE TABLE IF NOT EXISTS shipment_tracking (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  shipment_id UUID REFERENCES shipments(id) ON DELETE CASCADE,
  location_lat DECIMAL(10,8),
  location_lng DECIMAL(11,8),
  location_name VARCHAR(255),
  status_update VARCHAR(100),
  notes TEXT,
  recorded_at TIMESTAMPTZ DEFAULT NOW(),
  recorded_by UUID REFERENCES auth.users(id)
);

-- Delivery requests from customers
CREATE TABLE IF NOT EXISTS delivery_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  shipment_id UUID REFERENCES shipments(id) ON DELETE CASCADE,
  requested_pickup_time TIMESTAMPTZ,
  preferred_delivery_time TIMESTAMPTZ,
  delivery_type VARCHAR(20), -- 'standard', 'express', 'scheduled'
  customer_notes TEXT,
  status VARCHAR(20) DEFAULT 'open', -- 'open', 'accepted', 'declined'
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Partner earnings and payments
CREATE TABLE IF NOT EXISTS partner_earnings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  partner_id UUID REFERENCES delivery_partners(id) ON DELETE CASCADE,
  shipment_id UUID REFERENCES shipments(id) ON DELETE CASCADE,
  base_amount DECIMAL(8,2),
  distance_amount DECIMAL(8,2),
  bonus_amount DECIMAL(8,2) DEFAULT 0,
  total_amount DECIMAL(8,2),
  payment_status VARCHAR(20) DEFAULT 'pending', -- 'pending', 'paid', 'disputed'
  paid_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_delivery_partners_type ON delivery_partners(partner_type);
CREATE INDEX IF NOT EXISTS idx_delivery_partners_active ON delivery_partners(is_active);
CREATE INDEX IF NOT EXISTS idx_bus_routes_cities ON bus_routes(origin_city, destination_city);
CREATE INDEX IF NOT EXISTS idx_shipments_status ON shipments(status);
CREATE INDEX IF NOT EXISTS idx_shipments_partner ON shipments(delivery_partner_id);
CREATE INDEX IF NOT EXISTS idx_shipment_tracking_shipment ON shipment_tracking(shipment_id);
CREATE INDEX IF NOT EXISTS idx_partner_earnings_partner ON partner_earnings(partner_id);

-- Generate tracking numbers
CREATE OR REPLACE FUNCTION generate_tracking_number()
RETURNS TEXT AS $$
BEGIN
  RETURN 'SL' || TO_CHAR(NOW(), 'YYYYMMDD') || LPAD(FLOOR(RANDOM() * 10000)::TEXT, 4, '0');
END;
$$ LANGUAGE plpgsql;

-- Trigger to auto-generate tracking numbers
CREATE OR REPLACE FUNCTION set_tracking_number()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.tracking_number IS NULL THEN
    NEW.tracking_number := generate_tracking_number();
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_set_tracking_number
  BEFORE INSERT ON shipments
  FOR EACH ROW
  EXECUTE FUNCTION set_tracking_number();
