export type UserRole = 'driver' | 'owner' | 'mediator' | 'admin';

export type VerificationTier = 'unverified' | 'verified' | 'secure' | 'premium_secure';

export type VerificationStatus = 'pending' | 'under_review' | 'approved' | 'rejected';

export type BookingStatus = 'created' | 'confirmed' | 'active' | 'completed' | 'cancelled' | 'disputed';

export type PaymentStatus = 'pending' | 'captured' | 'failed' | 'refunded' | 'settled';

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
  updatedAt: string;
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
  photoUrl?: string;
  isVerified: boolean;
  createdAt: string;
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
  createdAt: string;
  updatedAt: string;
}

export interface Booking {
  id: string;
  bookingCode: string;
  driverId: string;
  parkingSpaceId: string;
  vehicleId: string;
  startTime: string;
  endTime: string;
  actualEntryTime?: string;
  actualExitTime?: string;
  status: BookingStatus;
  baseAmountInr: number;
  platformFeeInr: number;
  taxesInr: number;
  totalAmountInr: number;
  qrPassPayload?: string;
  conditionPhotosEntry?: string[];
  conditionPhotosExit?: string[];
  createdAt: string;
  updatedAt: string;
}

export interface Transaction {
  id: string;
  bookingId: string;
  gatewayPaymentId?: string;
  gatewayOrderId?: string;
  totalPaidInr: number;
  ownerPayoutInr: number;
  mediatorCommissionInr: number;
  platformNetRevenueInr: number;
  mediatorId?: string;
  status: PaymentStatus;
  isSettledOwner: boolean;
  isSettledMediator: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface TrustGateVerification {
  id: string;
  userId: string;
  targetType: 'profile' | 'parking_space' | 'vehicle';
  targetId: string;
  panNumber?: string;
  idDocUrl?: string;
  propertyProofUrl?: string;
  videoIntroUrl?: string;
  inspectorId?: string;
  status: VerificationStatus;
  rejectionReason?: string;
  verifiedAt?: string;
  createdAt: string;
}

export interface CommissionBreakdown {
  grossBookingAmountInr: number;
  platformCommissionInr: number; // e.g. 15%
  mediatorCommissionInr: number; // e.g. 5%
  ownerPayoutInr: number;        // e.g. 80%
}

/**
 * Calculates marketplace distribution per PARQUR financial model using precise paise arithmetic:
 * Platform standard cut: 15%
 * Mediator attribution recurring cut: 5%
 * Owner standard payout: 80%
 */
export function calculateMarketplaceSplit(
  bookingAmountInr: number,
  hasMediator: boolean = true
): CommissionBreakdown {
  const totalPaise = Math.round(bookingAmountInr * 100);
  const platformPaise = Math.round(totalPaise * 0.15);
  const mediatorPaise = hasMediator ? Math.round(totalPaise * 0.05) : 0;
  const ownerPaise = totalPaise - platformPaise - mediatorPaise;

  return {
    grossBookingAmountInr: +(totalPaise / 100).toFixed(2),
    platformCommissionInr: +(platformPaise / 100).toFixed(2),
    mediatorCommissionInr: +(mediatorPaise / 100).toFixed(2),
    ownerPayoutInr: +(ownerPaise / 100).toFixed(2),
  };
}
