'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { AlertCircle, MapPin, Loader2 } from 'lucide-react';
import CreateNeighborhoodWizard from '@/components/neighborhoods/CreateNeighborhoodWizard';
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

export default function CreateNeighborhoodPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [lgaId, setLgaId] = useState<string>('');
  const [lgaName, setLgaName] = useState<string>('');
  const [userCoordinates, setUserCoordinates] = useState<{
    latitude: number;
    longitude: number;
  }>();
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  
  // Location selection
  const [states, setStates] = useState<State[]>([]);
  const [lgas, setLGAs] = useState<LGA[]>([]);
  const [selectedStateId, setSelectedStateId] = useState<string>('');
  const [isLoadingStates, setIsLoadingStates] = useState(false);
  const [isLoadingLGAs, setIsLoadingLGAs] = useState(false);

  useEffect(() => {
    // Check authentication
    const token = localStorage.getItem('accessToken');
    if (!token) {
      setIsAuthenticated(false);
      setIsLoading(false);
      return;
    }

    setIsAuthenticated(true);
    
    // Get LGA from query params
    const queryLgaId = searchParams.get('lgaId');
    if (queryLgaId) {
      setLgaId(queryLgaId);
      loadLGADetails(queryLgaId);
    }

    // Load states for location selection
    loadStates();

    // Get user's GPS coordinates
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserCoordinates({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          });
        },
        (error) => {
          console.error('Error getting location:', error);
        }
      );
    }

    setIsLoading(false);
  }, [searchParams]);

  useEffect(() => {
    if (selectedStateId) {
      loadLGAs(selectedStateId);
    } else {
      setLGAs([]);
    }
  }, [selectedStateId]);

  const loadStates = async () => {
    setIsLoadingStates(true);
    try {
      const response = await apiClient.getStates();
      if (response.success && response.data) {
        const statesData = Array.isArray(response.data) ? response.data : [];
        setStates(statesData as State[]);
      }
    } catch (error) {
      console.error('Error loading states:', error);
    } finally {
      setIsLoadingStates(false);
    }
  };

  const loadLGAs = async (stateId: string) => {
    setIsLoadingLGAs(true);
    try {
      const response = await apiClient.getLGAsByState(stateId);
      if (response.success && response.data) {
        const lgasData = Array.isArray(response.data) ? response.data : [];
        setLGAs(lgasData as LGA[]);
      }
    } catch (error) {
      console.error('Error loading LGAs:', error);
    } finally {
      setIsLoadingLGAs(false);
    }
  };

  const loadLGADetails = async (id: string) => {
    // LGA name will be set when user selects from dropdown
    // If we have the lgaId from query params, we can try to find it in the states/LGAs
    // For now, we'll just keep it empty and let the wizard handle it
    setLgaName('');
  };

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

  // Show location selector if no LGA is provided
  if (!lgaId) {
    return (
      <div className="min-h-screen bg-gray-50 py-12 px-6">
        <div className="max-w-2xl mx-auto">
          <div className="bg-white rounded-lg border border-gray-200 p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Select Location
            </h2>
            <p className="text-gray-600 mb-6">
              Please select a State and LGA to create a neighborhood in that area.
            </p>

            <div className="space-y-4">
              {/* State Selector */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  State *
                </label>
                {isLoadingStates ? (
                  <div className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg bg-gray-50">
                    <Loader2 className="w-4 h-4 animate-spin text-gray-600" />
                    <span className="text-sm text-gray-600">Loading states...</span>
                  </div>
                ) : (
                  <select
                    value={selectedStateId}
                    onChange={(e) => setSelectedStateId(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-gray-900"
                  >
                    <option value="">Select State</option>
                    {states.map((state) => (
                      <option key={state.id} value={state.id}>
                        {state.name}
                      </option>
                    ))}
                  </select>
                )}
              </div>

              {/* LGA Selector */}
              {selectedStateId && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    LGA (Local Government Area) *
                  </label>
                  {isLoadingLGAs ? (
                    <div className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg bg-gray-50">
                      <Loader2 className="w-4 h-4 animate-spin text-gray-600" />
                      <span className="text-sm text-gray-600">Loading LGAs...</span>
                    </div>
                  ) : (
                    <select
                      value={lgaId}
                      onChange={(e) => {
                        const selectedLGA = lgas.find(l => l.id === e.target.value);
                        setLgaId(e.target.value);
                        setLgaName(selectedLGA?.name || '');
                      }}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-gray-900"
                    >
                      <option value="">Select LGA</option>
                      {lgas.map((lga) => (
                        <option key={lga.id} value={lga.id}>
                          {lga.name} {lga.type === 'LCDA' ? '(LCDA)' : ''}
                        </option>
                      ))}
                    </select>
                  )}
                </div>
              )}

              {/* Continue Button */}
              {lgaId && (
                <div className="pt-4">
                  <button
                    onClick={() => {
                      // Validate that a valid LGA was selected (not just the placeholder)
                      if (!lgaId || lgaId === '') {
                        alert('Please select a valid LGA');
                        return;
                      }
                      // Reload page with lgaId in query params
                      const returnTo = searchParams.get('returnTo');
                      const newUrl = `/neighborhoods/create?lgaId=${encodeURIComponent(lgaId)}${returnTo ? `&returnTo=${encodeURIComponent(returnTo)}` : ''}`;
                      router.push(newUrl);
                    }}
                    className="w-full px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-semibold"
                  >
                    Continue to Create Neighborhood
                  </button>
                </div>
              )}

              {/* Cancel/Back Button */}
              <div className="pt-2">
                <Link
                  href="/neighborhoods/browse"
                  className="block w-full text-center px-6 py-2 text-gray-600 hover:text-gray-900"
                >
                  Cancel
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-6">
      <CreateNeighborhoodWizard
        lgaId={lgaId}
        lgaName={lgaName}
        userCoordinates={userCoordinates}
        onComplete={handleComplete}
        onCancel={handleCancel}
      />
    </div>
  );
}

