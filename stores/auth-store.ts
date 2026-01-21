// stores/auth-store.ts
// Authentication state management with Zustand

import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { Profile, Driver } from '@/types/database'

interface AuthState {
  // User data
  user: {
    id: string
    email: string
  } | null
  profile: Profile | null
  drivers: Driver[]
  activeDriver: Driver | null
  
  // Loading states
  isLoading: boolean
  isInitialized: boolean
  
  // Actions
  setUser: (user: AuthState['user']) => void
  setProfile: (profile: Profile | null) => void
  setDrivers: (drivers: Driver[]) => void
  setActiveDriver: (driver: Driver | null) => void
  setLoading: (isLoading: boolean) => void
  setInitialized: (isInitialized: boolean) => void
  
  // Reset
  logout: () => void
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      // Initial state
      user: null,
      profile: null,
      drivers: [],
      activeDriver: null,
      isLoading: true,
      isInitialized: false,

      // Actions
      setUser: (user) => set({ user }),
      setProfile: (profile) => set({ profile }),
      setDrivers: (drivers) => set({ 
        drivers,
        // Auto-select default driver
        activeDriver: drivers.find(d => d.is_default) || drivers[0] || null
      }),
      setActiveDriver: (activeDriver) => set({ activeDriver }),
      setLoading: (isLoading) => set({ isLoading }),
      setInitialized: (isInitialized) => set({ isInitialized }),

      // Logout - clear all state
      logout: () => set({
        user: null,
        profile: null,
        drivers: [],
        activeDriver: null,
        isLoading: false,
        isInitialized: true,
      }),
    }),
    {
      name: 'ira-auth-storage',
      partialize: (state) => ({
        // Only persist these fields
        activeDriver: state.activeDriver,
      }),
    }
  )
)

// Selectors for common operations
export const useUser = () => useAuthStore((state) => state.user)
export const useProfile = () => useAuthStore((state) => state.profile)
export const useDrivers = () => useAuthStore((state) => state.drivers)
export const useActiveDriver = () => useAuthStore((state) => state.activeDriver)
export const useIsAuthenticated = () => useAuthStore((state) => !!state.user)
