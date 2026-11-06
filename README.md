# PARQUR: Smart Parking Marketplace
> Three-sided mobility marketplace connecting Drivers, Parking Owners, and territory Mediators with TrustGate verification.

## Architecture & Workspaces

The PARQUR repository is organized as a modular monorepo:

- **`supabase/`**: Database migrations, PostGIS geo-queries, edge functions (commissions & verification), and Row Level Security (RLS) policies.
- **`apps/mobile/`**: React Native (Expo) application serving:
  - **Driver Interface**: Nearby discovery, GPS search, instant reservation, UPI/Razorpay payments, QR pass.
  - **Parking Owner Interface**: Space registration, slot availability, hourly/daily pricing, check-in scanner, payout tracking.
  - **Mediator Interface**: Territory selector with polygon mapping, lead onboarding, referral links/QRs, commission dashboard.
- **`apps/admin/`**: Next.js 14 Web Dashboard for marketplace monitoring, KYC document approvals (TrustGate), dispute management, and financial payouts.
- **`packages/shared/`**: Shared TypeScript types, validation schemas (Zod), and pricing/commission formulas.

## Getting Started

### Prerequisites
- Node.js >= 20.x
- npm or pnpm
- Expo Go / EAS CLI

### Local Setup
```bash
# Install dependencies
npm install

# Setup environment variables
cp .env.example .env
```
