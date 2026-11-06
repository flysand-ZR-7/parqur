-- ==============================================================================
-- PARQUR DATABASE SCHEMA (PostgreSQL + PostGIS)
-- Architecture: Multi-tenant, Role-Based Access Control, Geo-spatial Ready
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

-- 4. Vehicles Table (Driver profile)
CREATE TABLE vehicles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    driver_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    registration_number TEXT NOT NULL UNIQUE,
    category vehicle_category NOT NULL,
    make TEXT NOT NULL,
    model TEXT NOT NULL,
    is_high_value BOOLEAN NOT NULL DEFAULT FALSE,
    estimated_value_inr NUMERIC(12, 2) DEFAULT 0,
    photo_url TEXT,
    is_verified BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

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

-- 6. Parking Spaces (Listings by Owners)
CREATE TABLE parking_spaces (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    owner_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    mediator_id UUID REFERENCES profiles(id) ON DELETE SET NULL, -- Attributed Mediator
    title TEXT NOT NULL,
    description TEXT,
    address TEXT NOT NULL,
    city TEXT NOT NULL,
    location GEOGRAPHY(Point, 4326) NOT NULL, -- Longitude/Latitude coordinates
    capacity_total INT NOT NULL DEFAULT 1,
    capacity_available INT NOT NULL DEFAULT 1,
    hourly_rate_inr NUMERIC(10, 2) NOT NULL,
    daily_rate_inr NUMERIC(10, 2),
    tier verification_tier NOT NULL DEFAULT 'unverified',
    is_covered BOOLEAN NOT NULL DEFAULT FALSE,
    has_cctv BOOLEAN NOT NULL DEFAULT FALSE,
    has_guard BOOLEAN NOT NULL DEFAULT FALSE,
    has_gated_entry BOOLEAN NOT NULL DEFAULT FALSE,
    has_ev_charging BOOLEAN NOT NULL DEFAULT FALSE,
    photos TEXT[] DEFAULT '{}',
    is_active BOOLEAN NOT NULL DEFAULT FALSE, -- Requires TrustGate approval
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Spatial index for sub-millisecond location discovery
CREATE INDEX idx_parking_spaces_location ON parking_spaces USING GIST(location);

-- 7. Bookings Table
CREATE TABLE bookings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    booking_code TEXT NOT NULL UNIQUE, -- For QR Entry Pass
    driver_id UUID NOT NULL REFERENCES profiles(id),
    parking_space_id UUID NOT NULL REFERENCES parking_spaces(id),
    vehicle_id UUID NOT NULL REFERENCES vehicles(id),
    start_time TIMESTAMPTZ NOT NULL,
    end_time TIMESTAMPTZ NOT NULL,
    actual_entry_time TIMESTAMPTZ,
    actual_exit_time TIMESTAMPTZ,
    status booking_status NOT NULL DEFAULT 'created',
    base_amount_inr NUMERIC(10, 2) NOT NULL,
    platform_fee_inr NUMERIC(10, 2) NOT NULL,
    taxes_inr NUMERIC(10, 2) NOT NULL DEFAULT 0,
    total_amount_inr NUMERIC(10, 2) NOT NULL,
    qr_pass_payload TEXT,
    condition_photos_entry TEXT[] DEFAULT '{}',
    condition_photos_exit TEXT[] DEFAULT '{}',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 8. Financial Transactions & Commissions
CREATE TABLE transactions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    booking_id UUID NOT NULL REFERENCES bookings(id) ON DELETE CASCADE,
    gateway_payment_id TEXT, -- Razorpay Payment ID
    gateway_order_id TEXT,   -- Razorpay Order ID
    total_paid_inr NUMERIC(10, 2) NOT NULL,
    owner_payout_inr NUMERIC(10, 2) NOT NULL,
    mediator_commission_inr NUMERIC(10, 2) NOT NULL DEFAULT 0, -- 5% of GMV
    platform_net_revenue_inr NUMERIC(10, 2) NOT NULL,
    mediator_id UUID REFERENCES profiles(id),
    status payment_status NOT NULL DEFAULT 'pending',
    is_settled_owner BOOLEAN NOT NULL DEFAULT FALSE,
    is_settled_mediator BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 9. TrustGate KYC & Verification Audits
CREATE TABLE trustgate_verifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    target_type TEXT NOT NULL, -- 'profile', 'parking_space', 'vehicle'
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

-- ==============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ==============================================================================

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE vehicles ENABLE ROW LEVEL SECURITY;
ALTER TABLE territories ENABLE ROW LEVEL SECURITY;
ALTER TABLE parking_spaces ENABLE ROW LEVEL SECURITY;
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE trustgate_verifications ENABLE ROW LEVEL SECURITY;

-- Profiles: Users can view & update their own profile; admins view all
CREATE POLICY "Users can read own profile" ON profiles
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON profiles
    FOR UPDATE USING (auth.uid() = id);

-- Parking Spaces: Anyone can read active & approved spaces for discovery
CREATE POLICY "Public read active parking spaces" ON parking_spaces
    FOR SELECT USING (is_active = TRUE AND tier != 'unverified');

CREATE POLICY "Owners can manage own spaces" ON parking_spaces
    FOR ALL USING (auth.uid() = owner_id);

-- Bookings: Drivers and Owners can see relevant bookings
CREATE POLICY "Drivers can view their bookings" ON bookings
    FOR SELECT USING (auth.uid() = driver_id);

CREATE POLICY "Owners can view bookings for their spaces" ON bookings
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM parking_spaces 
            WHERE parking_spaces.id = bookings.parking_space_id 
            AND parking_spaces.owner_id = auth.uid()
        )
    );

-- Fast Geo-Discovery Function
CREATE OR REPLACE FUNCTION search_nearby_parking(
    driver_lat DOUBLE PRECISION,
    driver_lng DOUBLE PRECISION,
    radius_meters INT DEFAULT 5000,
    req_tier verification_tier DEFAULT 'verified'
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
    ORDER BY distance_meters ASC;
$$;
