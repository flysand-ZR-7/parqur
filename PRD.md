# PARQUR Product Requirements Document & Task Breakdown
**Tracking autonomous spec-driven delivery (Ralph Loop & GSD Compatible)**

## Milestone 1: Core Foundation & Data Architecture (MVP P0)
- [x] Task 1.1: Initialize workspace monorepo & git architecture
- [ ] Task 1.2: Design PostGIS-enabled relational schema (Users, Spots, Bookings, Mediators, TrustGate KYC)
- [ ] Task 1.3: Create SQL migration scripts with Row Level Security (RLS) policies
- [ ] Task 1.4: Implement shared TypeScript definitions and business validation rules (`packages/shared`)

## Milestone 2: Mobile App Scaffolding (Expo React Native)
- [x] Task 2.1: Initialize Expo cross-platform mobile structure with Expo Router
- [x] Task 2.2: Setup Auth and Role routing (Driver / Owner / Mediator)
- [x] Task 2.3: Build Driver Discovery UI with Map View, Radius Search & Filters
- [x] Task 2.4: Build Driver Booking Flow & Digital QR Pass generation
- [x] Task 2.5: Build Parking Owner Space Listing & Check-in QR Scanner
- [x] Task 2.6: Build Mediator Territory Mapping & Referral Onboarding UI

## Milestone 3: TrustGate & Verification Engine
- [ ] Task 3.1: KYC submission pipeline for Owners & Mediators
- [ ] Task 3.2: Automated & manual listing approval workflow
- [ ] Task 3.3: High-value vehicle entry logging & condition photos

## Milestone 4: Financial & Commission Engine
- [ ] Task 4.1: Razorpay payment gateway integration
- [ ] Task 4.2: Automated 5% Mediator recurring commission engine & payout tracker
- [ ] Task 4.3: Owner settlement calculation engine

## Milestone 5: Web Admin Dashboard (Next.js)
- [ ] Task 5.1: Next.js 14 Web Admin dashboard setup
- [ ] Task 5.2: Verification Queue for TrustGate inspections and KYC approvals
- [ ] Task 5.3: Territory management map and mediator assignment visualizer
- [ ] Task 5.4: Transaction monitor, fraud alerts & payout approval console
