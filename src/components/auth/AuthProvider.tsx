'use client';

import React, { useEffect, ReactNode } from 'react';
import { useAuthStore, useIsAuthenticated } from '@/store/authStore';

interface AuthProviderProps {
  children: ReactNode;
}

/**
 * AuthProvider component
 * Initializes authentication state on mount
 * Checks for existing tokens and validates them
 */
export default function AuthProvider({ children }: AuthProviderProps) {
  const { initializeAuth, isLoading, isInitialized } = useAuthStore();

  useEffect(() => {
    // Initialize auth state on mount (only once)
    if (!isInitialized) {
      initializeAuth();
    }
  }, [initializeAuth, isInitialized]);

  // Show loading state while initializing
  if (isLoading || !isInitialized) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}

