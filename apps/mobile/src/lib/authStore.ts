import { create } from 'zustand';
import { UserRole, Profile } from '@parqur/shared';

interface AuthState {
  currentRole: UserRole;
  profile: Profile | null;
  isAuthenticated: boolean;
  setRole: (role: UserRole) => void;
  setProfile: (profile: Profile | null) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  currentRole: 'driver',
  profile: null,
  isAuthenticated: true, // Demo-ready initial state
  setRole: (role: UserRole) => set({ currentRole: role }),
  setProfile: (profile: Profile | null) => set({ profile, isAuthenticated: !!profile }),
  logout: () => set({ profile: null, isAuthenticated: false, currentRole: 'driver' }),
}));
