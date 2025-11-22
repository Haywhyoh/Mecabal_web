/**
 * Authentication Store using Zustand
 * Manages user authentication state, tokens, and auth methods
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { User } from '@/types/user';
import { apiClient } from '@/lib/api';

interface AuthState {
  user: User | null;
  accessToken: string | null;
  refreshToken: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  authProvider: 'local' | 'google' | 'phone' | null;
  
  // Actions
  setUser: (user: User | null) => void;
  setTokens: (accessToken: string, refreshToken: string) => void;
  clearAuth: () => void;
  
  // Auth methods
  loginWithEmail: (email: string, otpCode: string) => Promise<boolean>;
  loginWithPhone: (phoneNumber: string, otpCode: string) => Promise<boolean>;
  signInWithGoogle: (idToken: string) => Promise<boolean>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
  updateUser: (updates: Partial<User>) => void;
  initializeAuth: () => Promise<void>;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      accessToken: null,
      refreshToken: null,
      isLoading: false,
      isAuthenticated: false,
      authProvider: null,

      setUser: (user) => {
        set({ 
          user, 
          isAuthenticated: !!user 
        });
      },

      setTokens: (accessToken, refreshToken) => {
        set({ accessToken, refreshToken });
        // Store in localStorage for API client compatibility
        if (typeof window !== 'undefined') {
          localStorage.setItem('accessToken', accessToken);
          localStorage.setItem('refreshToken', refreshToken);
        }
      },

      clearAuth: () => {
        set({
          user: null,
          accessToken: null,
          refreshToken: null,
          isAuthenticated: false,
          authProvider: null,
        });
        if (typeof window !== 'undefined') {
          localStorage.removeItem('accessToken');
          localStorage.removeItem('refreshToken');
          localStorage.removeItem('authProvider');
        }
      },

      loginWithEmail: async (email: string, otpCode: string) => {
        try {
          set({ isLoading: true });
          const response = await apiClient.completeEmailLogin(email, otpCode);

          if (response.success && response.data) {
            const { accessToken, refreshToken, user } = response.data;
            
            if (accessToken && refreshToken) {
              get().setTokens(accessToken, refreshToken);
            }

            if (user) {
              get().setUser(user);
              set({ authProvider: 'local' });
              // Store auth provider in localStorage for persistence
              if (typeof window !== 'undefined') {
                localStorage.setItem('authProvider', 'local');
              }
            }

            return true;
          }

          return false;
        } catch (error) {
          console.error('Email login error:', error);
          return false;
        } finally {
          set({ isLoading: false });
        }
      },

      loginWithPhone: async (phoneNumber: string, otpCode: string) => {
        try {
          set({ isLoading: true });
          const response = await apiClient.verifyPhoneOTP(phoneNumber, otpCode, 'login');

          if (response.success && response.data) {
            const { accessToken, refreshToken, user } = response.data;
            
            if (accessToken && refreshToken) {
              get().setTokens(accessToken, refreshToken);
            }

            if (user) {
              get().setUser(user);
              set({ authProvider: 'phone' });
              // Store auth provider in localStorage for persistence
              if (typeof window !== 'undefined') {
                localStorage.setItem('authProvider', 'phone');
              }
            }

            return true;
          }

          return false;
        } catch (error) {
          console.error('Phone login error:', error);
          return false;
        } finally {
          set({ isLoading: false });
        }
      },

      signInWithGoogle: async (idToken: string) => {
        try {
          set({ isLoading: true });
          const response = await apiClient.googleAuthWeb(idToken);

          if (response.success && response.data) {
            const { accessToken, refreshToken, user } = response.data;
            
            if (accessToken && refreshToken) {
              get().setTokens(accessToken, refreshToken);
            }

            if (user) {
              get().setUser(user);
              set({ authProvider: 'google' });
              // Store auth provider in localStorage for persistence
              if (typeof window !== 'undefined') {
                localStorage.setItem('authProvider', 'google');
              }
            }

            return true;
          }

          return false;
        } catch (error) {
          console.error('Google sign-in error:', error);
          return false;
        } finally {
          set({ isLoading: false });
        }
      },

      logout: async () => {
        try {
          // Call logout endpoint if we have a token
          const { accessToken } = get();
          if (accessToken) {
            try {
              await apiClient.logout();
            } catch (error) {
              console.error('Logout API error:', error);
              // Continue with local logout even if API fails
            }
          }
        } catch (error) {
          console.error('Logout error:', error);
        } finally {
          get().clearAuth();
        }
      },

      refreshUser: async () => {
        try {
          const { accessToken } = get();
          if (!accessToken) {
            return;
          }

          const response = await apiClient.getCurrentUserProfile();
          if (response.success && response.data) {
            get().setUser(response.data);
          }
        } catch (error) {
          console.error('Refresh user error:', error);
        }
      },

      updateUser: (updates) => {
        const { user } = get();
        if (user) {
          get().setUser({ ...user, ...updates });
        }
      },

      initializeAuth: async () => {
        try {
          set({ isLoading: true });
          
          // Check for tokens in localStorage (for API client compatibility)
          if (typeof window !== 'undefined') {
            const storedAccessToken = localStorage.getItem('accessToken');
            const storedRefreshToken = localStorage.getItem('refreshToken');

            if (storedAccessToken && storedRefreshToken) {
              // Update store with tokens
              set({ 
                accessToken: storedAccessToken, 
                refreshToken: storedRefreshToken 
              });

              // Try to fetch current user
              const response = await apiClient.getCurrentUserProfile();
              if (response.success && response.data) {
                get().setUser(response.data);
                // Try to determine auth provider from storage or user data
                const storedProvider = localStorage.getItem('authProvider') as 'local' | 'google' | 'phone' | null;
                if (storedProvider) {
                  set({ authProvider: storedProvider });
                }
              } else {
                // Token might be invalid, clear auth
                get().clearAuth();
              }
            }
          }
        } catch (error) {
          console.error('Initialize auth error:', error);
          get().clearAuth();
        } finally {
          set({ isLoading: false });
        }
      },
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        accessToken: state.accessToken,
        refreshToken: state.refreshToken,
        authProvider: state.authProvider,
        // Don't persist user - fetch fresh on mount
      }),
    }
  )
);

