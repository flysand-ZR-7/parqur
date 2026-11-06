export type UserRole = 'driver' | 'owner' | 'mediator' | 'admin';

export type VerificationTier = 'unverified' | 'verified' | 'secure' | 'premium_secure';

export type BookingStatus = 'created' | 'confirmed' | 'active' | 'completed' | 'cancelled' | 'disputed';

export type VehicleCategory = 'two_wheeler' | 'hatchback' | 'sedan' | 'suv' | 'luxury_ev';

export interface Profile {
  id: string;
  email: string;
  phone: string;
  fullName: string;
  role: UserRole;
  avatarUrl?: string;
  trustgateStatus: VerificationTier;
  createdAt: string;
}

export interface Vehicle {
  id: string;
  driverId: string;
  registrationNumber: string;
  category: VehicleCategory;
  make: string;
  model: string;
  isHighValue: boolean;
  estimatedValueInr: number;
  isVerified: boolean;
}

export interface ParkingSpace {
  id: string;
  ownerId: string;
  mediatorId?: string;
  title: string;
  description?: string;
  address: string;
  city: string;
  latitude: number;
  longitude: number;
  capacityTotal: number;
  capacityAvailable: number;
  hourlyRateInr: number;
  dailyRateInr?: number;
  tier: VerificationTier;
  isCovered: boolean;
  hasCctv: boolean;
  hasGuard: boolean;
  hasGatedEntry: boolean;
  hasEvCharging: boolean;
  photos: string[];
  isActive: boolean;
}

export interface Booking {
  id: string;
  bookingCode: string;
  driverId: string;
  parkingSpaceId: string;
  vehicleId: string;
  startTime: string;
  endTime: string;
  status: BookingStatus;
  baseAmountInr: number;
  platformFeeInr: number;
  taxesInr: number;
  totalAmountInr: number;
  qrPassPayload?: string;
}

export interface CommissionBreakdown {
  grossBookingAmountInr: number;
  platformCommissionInr: number; // e.g. 15%
  mediatorCommissionInr: number; // e.g. 5%
  ownerPayoutInr: number;        // e.g. 80%
}

/**
 * Calculates marketplace distribution per PARQUR financial model:
 * Platform standard cut: 15%
 * Mediator attribution recurring cut: 5%
 * Owner standard payout: 80%
 */
export function calculateMarketplaceSplit(
  bookingAmountInr: number,
  hasMediator: boolean = true
): CommissionBreakdown {
  const mediatorCut = hasMediator ? +(bookingAmountInr * 0.05).toFixed(2) : 0;
  const platformCut = +(bookingAmountInr * 0.15).toFixed(2);
  const ownerCut = +(bookingAmountInr - platformCut - mediatorCut).toFixed(2);

  return {
    grossBookingAmountInr: bookingAmountInr,
    platformCommissionInr: platformCut,
    mediatorCommissionInr: mediatorCut,
    ownerPayoutInr: ownerCut,
  };
}
