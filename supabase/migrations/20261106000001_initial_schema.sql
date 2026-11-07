-- ==============================================================================
-- PARQUR DATABASE SCHEMA (PostgreSQL + PostGIS) - V2 (Hardened)
-- Fixed: Full RLS coverage (Admin, Mediator, Inserts), DB Constraints,
-- Auto-generated booking_code, Performance Indexes, Updated_at Trigger
-- ==============================================================================

-- 1. Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "postgis";

-- 2. Enumerated Types
CREATE TYPE user_role AS ENUM ('driver', 'owner', 'mediator', 'admin');
CREATE TYPE verification_tier AS ENUM ('unverified', 'verified', 'secure', 'premium_secure');
CREATE TYPE verification_status AS ENUM ('pending', 'under_review', 'approved', 'rejected');
CREATE TYPE booking_status AS ENUM ('created', 'confirmed', 'active', 'completed', 'cancelled', 'disputed');
CREATE TYPE payment_status AS ENUM ('pending', 'captured', 'failed', 'refunded', 'settled');
CREATE TYPE vehicle_category AS ENUM ('two_wheeler', 'hatchback', 'sedan', 'suv', 'luxury_ev');

-- Helper function to generate unique human-readable booking codes
CREATE OR REPLACE FUNCTION generate_booking_code()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.booking_code IS NULL OR NEW.booking_code = '' THEN
        NEW.booking_code := 'PQ-' || TO_CHAR(NOW(), 'YYYY') || '-' || UPPER(SUBSTRING(MD5(RANDOM()::TEXT || CLOCK_TIMESTAMP()::TEXT) FROM 1 FOR 6));
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Helper function to auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 3. Profiles / Users Table
CREATE TABLE profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT UNIQUE NOT NULL,
    phone TEXT UNIQUE NOT NULL,
    full_name TEXT NOT NULL,
    role user_role NOT NULL DEFAULT 'driver',
    avatar_url TEXT,
    trustgate_status verification_tier NOT NULL DEFAULT 'unverified',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON profiles
FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

-- 4. Vehicles Table (Driver profile)
CREATE TABLE vehicles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    driver_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    registration_number TEXT NOT NULL UNIQUE,
    category vehicle_category NOT NULL,
    make TEXT NOT NULL,
    model TEXT NOT NULL,
    is_high_value BOOLEAN NOT NULL DEFAULT FALSE,
    estimated_value_inr NUMERIC(12, 2) DEFAULT 0 CHECK (estimated_value_inr >= 0),
    photo_url TEXT,
    is_verified BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_vehicles_driver_id ON vehicles(driver_id);

-- 5. Mediator Territories (Polygonal Geofence)
CREATE TABLE territories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    city TEXT NOT NULL,
    locality TEXT NOT NULL,
    assigned_mediator_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
    boundary GEOMETRY(Polygon, 4326),
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_territories_mediator_id ON territories(assigned_mediator_id);

CREATE TRIGGER update_territories_updated_at BEFORE UPDATE ON territories
FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

-- 6. Parking Spaces (Listings by Owners)
CREATE TABLE parking_spaces (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    owner_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    mediator_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
    title TEXT NOT NULL,
    description TEXT,
    address TEXT NOT NULL,
    city TEXT NOT NULL,
    location GEOGRAPHY(Point, 4326) NOT NULL,
    capacity_total INT NOT NULL DEFAULT 1 CHECK (capacity_total > 0),
    capacity_available INT NOT NULL DEFAULT 1 CHECK (capacity_available >= 0),
    hourly_rate_inr NUMERIC(10, 2) NOT NULL CHECK (hourly_rate_inr >= 0),
    daily_rate_inr NUMERIC(10, 2) CHECK (daily_rate_inr IS NULL OR daily_rate_inr >= 0),
    tier verification_tier NOT NULL DEFAULT 'unverified',
    is_covered BOOLEAN NOT NULL DEFAULT FALSE,
    has_cctv BOOLEAN NOT NULL DEFAULT FALSE,
    has_guard BOOLEAN NOT NULL DEFAULT FALSE,
    has_gated_entry BOOLEAN NOT NULL DEFAULT FALSE,
    has_ev_charging BOOLEAN NOT NULL DEFAULT FALSE,
    photos TEXT[] DEFAULT '{}',
    is_active BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT chk_capacity CHECK (capacity_available <= capacity_total)
);

CREATE INDEX idx_parking_spaces_location ON parking_spaces USING GIST(location);
CREATE INDEX idx_parking_spaces_owner_id ON parking_spaces(owner_id);
CREATE INDEX idx_parking_spaces_mediator_id ON parking_spaces(mediator_id);

CREATE TRIGGER update_parking_spaces_updated_at BEFORE UPDATE ON parking_spaces
FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

-- 7. Bookings Table
CREATE TABLE bookings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    booking_code TEXT NOT NULL UNIQUE,
    driver_id UUID NOT NULL REFERENCES profiles(id),
    parking_space_id UUID NOT NULL REFERENCES parking_spaces(id),
    vehicle_id UUID NOT NULL REFERENCES vehicles(id),
    start_time TIMESTAMPTZ NOT NULL,
    end_time TIMESTAMPTZ NOT NULL,
    actual_entry_time TIMESTAMPTZ,
    actual_exit_time TIMESTAMPTZ,
    status booking_status NOT NULL DEFAULT 'created',
    base_amount_inr NUMERIC(10, 2) NOT NULL CHECK (base_amount_inr >= 0),
    platform_fee_inr NUMERIC(10, 2) NOT NULL CHECK (platform_fee_inr >= 0),
    taxes_inr NUMERIC(10, 2) NOT NULL DEFAULT 0 CHECK (taxes_inr >= 0),
    total_amount_inr NUMERIC(10, 2) NOT NULL CHECK (total_amount_inr >= 0),
    qr_pass_payload TEXT,
    condition_photos_entry TEXT[] DEFAULT '{}',
    condition_photos_exit TEXT[] DEFAULT '{}',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT chk_booking_time CHECK (end_time > start_time)
);

CREATE TRIGGER trigger_set_booking_code BEFORE INSERT ON bookings
FOR EACH ROW EXECUTE PROCEDURE generate_booking_code();

CREATE TRIGGER update_bookings_updated_at BEFORE UPDATE ON bookings
FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

CREATE INDEX idx_bookings_driver_id ON bookings(driver_id);
CREATE INDEX idx_bookings_space_id ON bookings(parking_space_id);
CREATE INDEX idx_bookings_status ON bookings(status);

-- 8. Financial Transactions & Commissions
CREATE TABLE transactions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    booking_id UUID NOT NULL REFERENCES bookings(id) ON DELETE CASCADE,
    gateway_payment_id TEXT,
    gateway_order_id TEXT,
    total_paid_inr NUMERIC(10, 2) NOT NULL CHECK (total_paid_inr >= 0),
    owner_payout_inr NUMERIC(10, 2) NOT NULL CHECK (owner_payout_inr >= 0),
    mediator_commission_inr NUMERIC(10, 2) NOT NULL DEFAULT 0 CHECK (mediator_commission_inr >= 0),
    platform_net_revenue_inr NUMERIC(10, 2) NOT NULL CHECK (platform_net_revenue_inr >= 0),
    mediator_id UUID REFERENCES profiles(id),
    status payment_status NOT NULL DEFAULT 'pending',
    is_settled_owner BOOLEAN NOT NULL DEFAULT FALSE,
    is_settled_mediator BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT chk_split_sum CHECK (
        ROUND((owner_payout_inr + mediator_commission_inr + platform_net_revenue_inr)::NUMERIC, 2) = ROUND(total_paid_inr::NUMERIC, 2)
    )
);

CREATE TRIGGER update_transactions_updated_at BEFORE UPDATE ON transactions
FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

CREATE INDEX idx_transactions_booking_id ON transactions(booking_id);
CREATE INDEX idx_transactions_mediator_id ON transactions(mediator_id);

-- 9. TrustGate KYC & Verification Audits
CREATE TABLE trustgate_verifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    target_type TEXT NOT NULL CHECK (target_type IN ('profile', 'parking_space', 'vehicle')),
    target_id UUID NOT NULL,
    pan_number TEXT,
    id_doc_url TEXT,
    property_proof_url TEXT,
    video_intro_url TEXT,
    inspector_id UUID REFERENCES profiles(id),
    status verification_status NOT NULL DEFAULT 'pending',
    rejection_reason TEXT,
    verified_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_trustgate_user_id ON trustgate_verifications(user_id);
CREATE INDEX idx_trustgate_status ON trustgate_verifications(status);

-- ==============================================================================
-- HARDENED ROW LEVEL SECURITY (RLS) POLICIES
-- ==============================================================================

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE vehicles ENABLE ROW LEVEL SECURITY;
ALTER TABLE territories ENABLE ROW LEVEL SECURITY;
ALTER TABLE parking_spaces ENABLE ROW LEVEL SECURITY;
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE trustgate_verifications ENABLE ROW LEVEL SECURITY;

-- Helper function: is current user an admin?
CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN AS $$
    SELECT EXISTS (
        SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'
    );
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- Profiles Policies
CREATE POLICY "Admins have full access to profiles" ON profiles FOR ALL USING (is_admin());
CREATE POLICY "Users can insert own profile" ON profiles FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "Users can read own profile" ON profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON profiles FOR UPDATE USING (auth.uid() = id);

-- Vehicles Policies
CREATE POLICY "Admins have full access to vehicles" ON vehicles FOR ALL USING (is_admin());
CREATE POLICY "Drivers can manage own vehicles" ON vehicles FOR ALL USING (auth.uid() = driver_id);
CREATE POLICY "Owners can view vehicles with active bookings" ON vehicles FOR SELECT USING (
    EXISTS (
        SELECT 1 FROM bookings b
        JOIN parking_spaces ps ON ps.id = b.parking_space_id
        WHERE b.vehicle_id = vehicles.id AND ps.owner_id = auth.uid()
    )
);

-- Territories Policies
CREATE POLICY "Admins have full access to territories" ON territories FOR ALL USING (is_admin());
CREATE POLICY "Mediators can view assigned territory" ON territories FOR SELECT USING (assigned_mediator_id = auth.uid());

-- Parking Spaces Policies
CREATE POLICY "Admins have full access to spaces" ON parking_spaces FOR ALL USING (is_admin());
CREATE POLICY "Public read active parking spaces" ON parking_spaces FOR SELECT USING (is_active = TRUE AND tier != 'unverified');
CREATE POLICY "Owners can manage own spaces" ON parking_spaces FOR ALL USING (auth.uid() = owner_id);
CREATE POLICY "Mediators can view their attributed spaces" ON parking_spaces FOR SELECT USING (mediator_id = auth.uid());

-- Bookings Policies
CREATE POLICY "Admins have full access to bookings" ON bookings FOR ALL USING (is_admin());
CREATE POLICY "Drivers can create bookings" ON bookings FOR INSERT WITH CHECK (auth.uid() = driver_id);
CREATE POLICY "Drivers can view their bookings" ON bookings FOR SELECT USING (auth.uid() = driver_id);
CREATE POLICY "Owners can view bookings for their spaces" ON bookings FOR SELECT USING (
    EXISTS (SELECT 1 FROM parking_spaces ps WHERE ps.id = bookings.parking_space_id AND ps.owner_id = auth.uid())
);
CREATE POLICY "Owners can update booking status for check-in" ON bookings FOR UPDATE USING (
    EXISTS (SELECT 1 FROM parking_spaces ps WHERE ps.id = bookings.parking_space_id AND ps.owner_id = auth.uid())
);
CREATE POLICY "Mediators can view bookings for attributed spaces" ON bookings FOR SELECT USING (
    EXISTS (SELECT 1 FROM parking_spaces ps WHERE ps.id = bookings.parking_space_id AND ps.mediator_id = auth.uid())
);

-- Transactions Policies
CREATE POLICY "Admins have full access to transactions" ON transactions FOR ALL USING (is_admin());
CREATE POLICY "Mediators can view their commission transactions" ON transactions FOR SELECT USING (mediator_id = auth.uid());
CREATE POLICY "Owners can view transactions for their spaces" ON transactions FOR SELECT USING (
    EXISTS (
        SELECT 1 FROM bookings b
        JOIN parking_spaces ps ON ps.id = b.parking_space_id
        WHERE b.id = transactions.booking_id AND ps.owner_id = auth.uid()
    )
);

-- TrustGate Verifications Policies
CREATE POLICY "Admins have full access to verifications" ON trustgate_verifications FOR ALL USING (is_admin());
CREATE POLICY "Users can submit verifications" ON trustgate_verifications FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can view own verifications" ON trustgate_verifications FOR SELECT USING (auth.uid() = user_id);

-- Geospatial Discovery Function
CREATE OR REPLACE FUNCTION search_nearby_parking(
    driver_lat DOUBLE PRECISION,
    driver_lng DOUBLE PRECISION,
    radius_meters INT DEFAULT 5000,
    min_tier verification_tier DEFAULT 'verified'
)
RETURNS TABLE (
    id UUID,
    title TEXT,
    address TEXT,
    hourly_rate_inr NUMERIC,
    tier verification_tier,
    is_covered BOOLEAN,
    has_cctv BOOLEAN,
    has_guard BOOLEAN,
    distance_meters DOUBLE PRECISION
)
LANGUAGE sql
STABLE
AS $$
    SELECT 
        p.id,
        p.title,
        p.address,
        p.hourly_rate_inr,
        p.tier,
        p.is_covered,
        p.has_cctv,
        p.has_guard,
        ST_Distance(p.location, ST_SetSRID(ST_MakePoint(driver_lng, driver_lat), 4326)::geography) AS distance_meters
    FROM parking_spaces p
    WHERE p.is_active = TRUE
      AND p.capacity_available > 0
      AND ST_DWithin(p.location, ST_SetSRID(ST_MakePoint(driver_lng, driver_lat), 4326)::geography, radius_meters)
      AND (
          min_tier = 'unverified'
          OR (min_tier = 'verified' AND p.tier IN ('verified', 'secure', 'premium_secure'))
          OR (min_tier = 'secure' AND p.tier IN ('secure', 'premium_secure'))
          OR (min_tier = 'premium_secure' AND p.tier = 'premium_secure')
      )
    ORDER BY distance_meters ASC;
$$;
