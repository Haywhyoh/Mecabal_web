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

  // Load neighborhoods on mount
  useEffect(() => {
    if (locationData?.lgaId) {
      loadNeighborhoods(locationData.lgaId);
    }
  }, [locationData?.lgaId]);

  const loadNeighborhoods = async (lgaId: string, query?: string) => {
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

  const handleNeighborhoodSearch = (query: string) => {
    setNeighborhoodSearchQuery(query);
    if (locationData?.lgaId && query.length >= 2) {
      loadNeighborhoods(locationData.lgaId, query);
    } else if (query.length === 0 && locationData?.lgaId) {
      loadNeighborhoods(locationData.lgaId);
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
            {/* Neighborhood Search */}
            <div>
              <label htmlFor="neighborhood" className="block text-sm font-medium text-gray-700 mb-2">
                Search Neighborhood/Estate
              </label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  id="neighborhood"
                  type="text"
                  value={neighborhoodSearchQuery}
                  onChange={(e) => handleNeighborhoodSearch(e.target.value)}
                  placeholder="Type to search..."
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-600 focus:border-transparent outline-none transition-all text-gray-900"
                  autoFocus
                />
              </div>

              {isLoadingNeighborhoods && (
                <div className="flex items-center gap-2 text-gray-600 mt-3">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span className="text-sm">Searching neighborhoods...</span>
                </div>
              )}

              {/* Neighborhoods List */}
              {!isLoadingNeighborhoods && neighborhoods.length > 0 && (
                <div className="mt-3 max-h-96 overflow-y-auto border border-gray-200 rounded-lg">
                  {neighborhoods.map((neighborhood) => (
                    <button
                      key={neighborhood.id}
                      type="button"
                      onClick={() => handleNeighborhoodSelect(neighborhood)}
                      className={`w-full text-left px-4 py-3 hover:bg-gray-50 transition-colors border-b border-gray-100 last:border-b-0 ${
                        selectedNeighborhood?.id === neighborhood.id ? 'bg-green-50 border-l-4 border-l-green-600' : ''
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="font-medium text-gray-900">{neighborhood.name}</div>
                          <div className="text-sm text-gray-600">{neighborhood.type}</div>
                        </div>
                        {neighborhood.isGated && (
                          <span className="text-xs bg-red-100 text-red-800 px-2 py-1 rounded">Gated</span>
                        )}
                      </div>
                    </button>
                  ))}
                </div>
              )}

              {!isLoadingNeighborhoods && neighborhoodSearchQuery && neighborhoods.length === 0 && (
                <div className="mt-3 p-4 bg-gray-50 border border-gray-200 rounded-lg text-center">
                  <p className="text-sm text-gray-600 mb-2">No neighborhoods found matching "{neighborhoodSearchQuery}"</p>
                  <Link
                    href={`/neighborhoods/create?returnTo=/onboarding&lgaId=${locationData?.lgaId}`}
                    className="text-sm text-green-600 hover:underline"
                  >
                    Create your neighborhood
                  </Link>
                </div>
              )}

              {/* Selected Neighborhood Display */}
              {selectedNeighborhood && (
                <div className="mt-3 p-4 bg-green-50 border border-green-200 rounded-lg">
                  <p className="text-sm text-gray-700 mb-1">Selected:</p>
                  <p className="font-medium text-gray-900">{selectedNeighborhood.name}</p>
                  <p className="text-sm text-gray-600">{selectedNeighborhood.type}</p>
                </div>
              )}
            </div>

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
