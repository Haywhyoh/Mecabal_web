'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore, useIsAuthenticated } from '@/store/authStore';
import EstateManagementSidebar from '@/components/estate-management/EstateManagementSidebar';

export default function EstateManagementLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const isAuthenticated = useIsAuthenticated();
  const { isLoading, isInitialized } = useAuthStore();

  React.useEffect(() => {
    if (isInitialized && !isLoading && !isAuthenticated) {
      router.push('/onboarding');
    }
  }, [isAuthenticated, isLoading, isInitialized, router]);

  if (isLoading || !isInitialized || !isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-green-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading estate management...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="flex">
        <EstateManagementSidebar />
        <main className="flex-1 ml-64 p-6">
          {children}
        </main>
      </div>
    </div>
  );
}

