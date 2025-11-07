'use client';

import { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { AlertCircle, MapPin, Loader2 } from 'lucide-react';
import ImprovedCreateWizard from '@/components/neighborhoods/ImprovedCreateWizard';
import { apiClient } from '@/lib/api';

interface State {
  id: string;
  name: string;
  code: string;
}

interface LGA {
  id: string;
  name: string;
  code: string;
  type: 'LGA' | 'LCDA';
}

function CreateNeighborhoodPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);

  useEffect(() => {
    // Check authentication
    const token = localStorage.getItem('accessToken');
    if (!token) {
      setIsAuthenticated(false);
      setIsLoading(false);
      return;
    }

    setIsAuthenticated(true);
    setIsLoading(false);
  }, [searchParams]);

  const handleComplete = (neighborhood: any) => {
    const returnTo = searchParams.get('returnTo');
    if (returnTo) {
      // If coming from onboarding, return there (neighborhood will be auto-selected)
      router.push(returnTo);
    } else {
      // Otherwise, go to neighborhood details
      router.push(`/neighborhoods/${neighborhood.id}`);
    }
  };

  const handleCancel = () => {
    const returnTo = searchParams.get('returnTo');
    router.push(returnTo || '/neighborhoods/browse');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-green-600" />
      </div>
    );
  }

  // Show login prompt if not authenticated
  if (isAuthenticated === false) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
        <div className="max-w-md w-full bg-white rounded-lg border border-gray-200 p-8 text-center">
          <AlertCircle className="w-12 h-12 text-amber-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Please Log In
          </h2>
          <p className="text-gray-600 mb-6">
            You need to be logged in to create a neighborhood.
          </p>
          <Link
            href="/onboarding"
            className="inline-block px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-semibold"
          >
            Go to Login
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-6">
      <ImprovedCreateWizard
        onComplete={handleComplete}
        onCancel={handleCancel}
      />
    </div>
  );
}

export default function CreateNeighborhoodPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-green-600" />
      </div>
    }>
      <CreateNeighborhoodPageContent />
    </Suspense>
  );
}

