'use client';

import React, { useState, useEffect } from 'react';
import { Loader2, Search } from 'lucide-react';
import Link from 'next/link';
import { useOnboarding } from '@/contexts/OnboardingContext';
import { apiClient } from '@/lib/api';
import { useRouter } from 'next/navigation';
import type { Neighborhood } from '@/types/neighborhood';

export default function NeighborhoodSelectionForm() {
  const { user, updateUser, setTokens, resetOnboarding, locationData } = useOnboarding();
  const router = useRouter();

  const [neighborhoodSearchQuery, setNeighborhoodSearchQuery] = useState('');
  const [selectedNeighborhood, setSelectedNeighborhood] = useState<Neighborhood | null>(null);
  const [neighborhoods, setNeighborhoods] = useState<Neighborhood[]>([]);
  const [isLoadingNeighborhoods, setIsLoadingNeighborhoods] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string>();

  // Don't load neighborhoods on mount - only when user searches
  // This prevents loading 100s of neighborhoods at once

  // Debounce search - only search after user stops typing for 300ms
  useEffect(() => {
    if (!neighborhoodSearchQuery || neighborhoodSearchQuery.length < 3) {
      setNeighborhoods([]);
      return;
    }

    const timeoutId = setTimeout(() => {
      loadNeighborhoods(locationData?.lgaId!, neighborhoodSearchQuery);
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [neighborhoodSearchQuery, locationData?.lgaId]);

  const loadNeighborhoods = async (lgaId: string, query: string) => {
    if (!lgaId || query.length < 3) {
      setNeighborhoods([]);
      return;
    }

    try {
      setIsLoadingNeighborhoods(true);
      const response = await apiClient.searchNeighborhoods({
        lgaId,
        query,
        limit: 50,
      });

      if (response.success && response.data) {
        setNeighborhoods(response.data);
      } else {
        setError('Failed to load neighborhoods. Please try again.');
      }
    } catch (err) {
      setError('Failed to load neighborhoods.');
    } finally {
      setIsLoadingNeighborhoods(false);
    }
  };

  const handleNeighborhoodSelect = (neighborhood: Neighborhood) => {
    setSelectedNeighborhood(neighborhood);
    setNeighborhoodSearchQuery(neighborhood.name);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(undefined);

    if (!locationData?.stateId || !locationData?.lgaId) {
      setError('Location data is missing. Please go back and select your state and LGA.');
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await apiClient.setupLocation({
        stateId: locationData.stateId,
        lgaId: locationData.lgaId,
        neighborhoodId: selectedNeighborhood?.id || undefined,
        cityTown: locationData.cityTown || undefined,
        address: locationData.address || undefined,
        latitude: locationData.coordinates?.latitude,
        longitude: locationData.coordinates?.longitude,
        completeRegistration: true,
      });

      if (response.success && response.data) {
        const userData = response.data.user;
        const tokens = response.data;

        if (tokens?.accessToken && tokens?.refreshToken) {
          setTokens(tokens.accessToken, tokens.refreshToken);
        }

        if (userData) {
          updateUser({
            id: userData.id,
            isVerified: userData.isVerified,
          });
        }

        resetOnboarding();
        router.push('/dashboard');
      } else {
        setError(response.error || 'Failed to complete registration');
      }
    } catch (err) {
      setError('Network error. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSkip = async () => {
    // Submit without neighborhood
    setSelectedNeighborhood(null);
    const form = document.querySelector('form');
    if (form) {
      form.dispatchEvent(new Event('submit', { cancelable: true, bubbles: true }));
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-white px-6 py-12">
      <div className="max-w-md w-full">
        <div className="bg-white rounded-2xl shadow-lg p-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">Select Your Neighborhood</h2>
          <p className="text-gray-600 mb-2">
            Search and select your neighborhood or estate
          </p>
          <p className="text-sm text-gray-500 mb-8">
            {locationData?.stateName && locationData?.lgaName && (
              <>📍 {locationData.lgaName}, {locationData.stateName}</>
            )}
          </p>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Neighborhood Search Input */}
            <div>
              <label htmlFor="search" className="block text-sm font-medium text-gray-700 mb-2">
                Search for your neighborhood
              </label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  id="search"
                  type="text"
                  value={neighborhoodSearchQuery}
                  onChange={(e) => setNeighborhoodSearchQuery(e.target.value)}
                  placeholder="Type at least 3 characters to search..."
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-600 focus:border-transparent outline-none transition-all text-gray-900"
                  autoFocus
                />
              </div>

              {!neighborhoodSearchQuery && (
                <p className="text-sm text-gray-600 mt-2">
                  Type at least 3 characters to search for your neighborhood or estate
                </p>
              )}

              {neighborhoodSearchQuery && neighborhoodSearchQuery.length < 3 && (
                <p className="text-sm text-gray-600 mt-2">
                  Type {3 - neighborhoodSearchQuery.length} more character{3 - neighborhoodSearchQuery.length > 1 ? 's' : ''} to search...
                </p>
              )}

              {isLoadingNeighborhoods && (
                <div className="flex items-center gap-2 text-gray-600 mt-2">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span className="text-sm">Searching neighborhoods...</span>
                </div>
              )}
            </div>

            {/* Neighborhood Dropdown - only show when results are available */}
            {!isLoadingNeighborhoods && neighborhoods.length > 0 && (
              <div>
                <label htmlFor="neighborhood" className="block text-sm font-medium text-gray-700 mb-2">
                  Select Neighborhood *
                </label>
                <select
                  id="neighborhood"
                  value={selectedNeighborhood?.id || ''}
                  onChange={(e) => {
                    const selected = neighborhoods.find(n => n.id === e.target.value);
                    if (selected) {
                      handleNeighborhoodSelect(selected);
                    }
                  }}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-600 focus:border-transparent outline-none transition-all text-gray-900"
                  required
                >
                  <option value="">Select a neighborhood</option>
                  {neighborhoods.map((neighborhood) => (
                    <option key={neighborhood.id} value={neighborhood.id}>
                      {neighborhood.name} - {neighborhood.type} {neighborhood.isGated ? '(Gated)' : ''}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {!isLoadingNeighborhoods && neighborhoodSearchQuery && neighborhoodSearchQuery.length >= 3 && neighborhoods.length === 0 && (
              <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg text-center">
                <p className="text-sm text-gray-600 mb-2">No neighborhoods found matching "{neighborhoodSearchQuery}"</p>
                <Link
                  href={`/neighborhoods/create?returnTo=/onboarding&lgaId=${locationData?.lgaId}`}
                  className="text-sm text-green-600 hover:underline"
                >
                  Create your neighborhood
                </Link>
              </div>
            )}

            {/* Can't find your area? */}
            {!neighborhoodSearchQuery && (
              <Link
                href={`/neighborhoods/create?returnTo=/onboarding&lgaId=${locationData?.lgaId}`}
                className="text-sm text-green-600 hover:underline inline-block"
              >
                Can't find your area? Create it
              </Link>
            )}

            {error && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-sm text-red-600">{error}</p>
              </div>
            )}

            {/* Action Buttons */}
            <div className="space-y-3">
              <button
                type="submit"
                disabled={!selectedNeighborhood || isSubmitting}
                className="w-full py-3 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Completing Registration...
                  </>
                ) : (
                  'Complete Registration'
                )}
              </button>

              <button
                type="button"
                onClick={handleSkip}
                disabled={isSubmitting}
                className="w-full py-3 border border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-50 disabled:bg-gray-100 disabled:cursor-not-allowed transition-colors"
              >
                Skip for Now
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
