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
  isInitialized: boolean;
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
      isInitialized: false,
      authProvider: null,

      setUser: (user) => {
        set({ user });
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
          } else {
            // If user fetch fails, try refreshing token
            const refreshResponse = await apiClient.refreshToken();
            if (refreshResponse.success && refreshResponse.data) {
              const { accessToken: newAccessToken, refreshToken: newRefreshToken } = refreshResponse.data;
              get().setTokens(newAccessToken, newRefreshToken);
              // Retry getting user
              const retryResponse = await apiClient.getCurrentUserProfile();
              if (retryResponse.success && retryResponse.data) {
                get().setUser(retryResponse.data);
              }
            }
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
          set({ isLoading: true, isInitialized: false });
          
          // Check for tokens in localStorage (for API client compatibility)
          if (typeof window !== 'undefined') {
            const storedAccessToken = localStorage.getItem('accessToken');
            const storedRefreshToken = localStorage.getItem('refreshToken');

            if (storedAccessToken && storedRefreshToken) {
              // Update store with tokens immediately - this sets isAuthenticated to true
              set({ 
                accessToken: storedAccessToken, 
                refreshToken: storedRefreshToken 
              });

              // Try to fetch current user
              let response = await apiClient.getCurrentUserProfile();
              
              // If user fetch fails with 401, try refreshing token
              if (!response.success && (response.error?.includes('401') || response.error?.includes('Unauthorized') || response.error?.includes('expired'))) {
                console.log('🔄 Access token expired, attempting refresh...');
                // refreshToken() reads from localStorage, which we just set
                const refreshResponse = await apiClient.refreshToken();
                
                if (refreshResponse.success && refreshResponse.data) {
                  const { accessToken: newAccessToken, refreshToken: newRefreshToken } = refreshResponse.data;
                  get().setTokens(newAccessToken, newRefreshToken);
                  
                  // Retry getting user with new token
                  response = await apiClient.getCurrentUserProfile();
                } else {
                  // Refresh failed, clear auth
                  console.log('❌ Token refresh failed, clearing auth');
                  get().clearAuth();
                  set({ isInitialized: true });
                  return;
                }
              }

              if (response.success && response.data) {
                get().setUser(response.data);
                // Try to determine auth provider from storage
                const storedProvider = localStorage.getItem('authProvider') as 'local' | 'google' | 'phone' | null;
                if (storedProvider) {
                  set({ authProvider: storedProvider });
                }
              } else {
                // Token might be invalid, but keep tokens if refresh token exists
                // Only clear if we can't refresh
                if (!storedRefreshToken) {
                  get().clearAuth();
                }
              }
            }
          }
        } catch (error) {
          console.error('Initialize auth error:', error);
          // Don't clear auth on network errors, only on auth errors
          const errorMessage = error instanceof Error ? error.message : String(error);
          if (errorMessage.includes('401') || errorMessage.includes('Unauthorized')) {
            get().clearAuth();
          }
        } finally {
          set({ isLoading: false, isInitialized: true });
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

// Selector for isAuthenticated - computed from accessToken
export const useIsAuthenticated = () => {
  return useAuthStore((state) => !!state.accessToken);
};

