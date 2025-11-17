'use client';

import React, { useState, useEffect } from 'react';
import { Loader2, MapPin, Navigation } from 'lucide-react';
import { useOnboarding } from '@/contexts/OnboardingContext';
import { apiClient } from '@/lib/api';
import { useRouter } from 'next/navigation';
import type { State, LGA } from '@/types/location';

export default function LocationSetupForm() {
  const { user, setCurrentStep, updateUser, setTokens, resetOnboarding, setLocationData } = useOnboarding();
  const router = useRouter();

  const [formData, setFormData] = useState({
    stateId: '',
    stateName: '',
    lgaId: '',
    lgaName: '',
    cityTown: '',
    address: '',
    formattedAddress: '', // Human-readable address from GPS
  });

  const [locationMethod, setLocationMethod] = useState<'gps' | 'manual'>('manual');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string>();
  const [coordinates, setCoordinates] = useState<{ latitude?: number; longitude?: number }>({});

  // Data lists
  const [states, setStates] = useState<State[]>([]);
  const [lgas, setLGAs] = useState<LGA[]>([]);

  // Loading states
  const [isLoadingStates, setIsLoadingStates] = useState(false);
  const [isLoadingLGAs, setIsLoadingLGAs] = useState(false);


  // Load states on mount
  useEffect(() => {
    loadStates();
  }, []);

  // Load LGAs when state changes
  useEffect(() => {
    if (formData.stateId) {
      loadLGAs(formData.stateId);
    } else {
      setLGAs([]);
      setFormData(prev => ({ ...prev, lgaId: '', lgaName: '' }));
    }
  }, [formData.stateId]);

  // Reverse geocode function (defined before useEffect that uses it)
  const reverseGeocode = async (latitude: number, longitude: number) => {
    try {
      // Use backend Google Maps reverse geocoding service
      const response = await apiClient.reverseGeocode(latitude, longitude);

      if (response.success && response.data) {
        const { state, lga, city, formattedAddress } = response.data;

        // Format address in Nigerian style (e.g., "Alimosho, Lagos")
        const displayAddress = [city, lga, state].filter(Boolean).join(', ');

        // Set formatted address and city
        setFormData(prev => ({
          ...prev,
          cityTown: city || '',
          formattedAddress: displayAddress || formattedAddress || `${latitude.toFixed(4)}, ${longitude.toFixed(4)}`
        }));

        // Auto-select state if we got one
        if (state) {
          const matchingState = states.find(s =>
            s.name.toLowerCase() === state.toLowerCase() ||
            state.toLowerCase().includes(s.name.toLowerCase())
          );

          if (matchingState) {
            setFormData(prev => ({
              ...prev,
              stateId: matchingState.id,
              stateName: matchingState.name,
              cityTown: city || '',
            }));

            // Load LGAs and auto-select if we have LGA data
            if (lga) {
              const lgasResponse = await apiClient.getLGAsByState(matchingState.id);
              if (lgasResponse.success && lgasResponse.data) {
                setLGAs(lgasResponse.data);

                // Try to find matching LGA
                const matchingLGA = lgasResponse.data.find((l: LGA) =>
                  l.name.toLowerCase().includes(lga.toLowerCase()) ||
                  lga.toLowerCase().includes(l.name.toLowerCase())
                );

                if (matchingLGA) {
                  setFormData(prev => ({
                    ...prev,
                    lgaId: matchingLGA.id,
                    lgaName: matchingLGA.name,
                  }));
                }
              }
            }
          }
        }
      } else {
        // Fallback to coordinates if backend geocoding fails
        setFormData(prev => ({
          ...prev,
          formattedAddress: `${latitude.toFixed(4)}, ${longitude.toFixed(4)}`
        }));
      }
    } catch (err) {
      console.error('Reverse geocoding failed:', err);
      // Fallback to coordinates
      setFormData(prev => ({
        ...prev,
        formattedAddress: `${latitude.toFixed(4)}, ${longitude.toFixed(4)}`
      }));
    }
  };

  // Handle GPS location
  useEffect(() => {
    if (locationMethod === 'gps' && 'geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const lat = position.coords.latitude;
          const lng = position.coords.longitude;

          setCoordinates({
            latitude: lat,
            longitude: lng,
          });

          // Reverse geocode to get human-readable address
          await reverseGeocode(lat, lng);
        },
        () => {
          setError('Unable to get your location. Please select manually.');
          setLocationMethod('manual');
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 0
        }
      );
    }
  }, [locationMethod, states]); // Added states to dependency array

  const loadStates = async () => {
    try {
      setIsLoadingStates(true);
      const response = await apiClient.getStates();

      if (response.success && response.data) {
        setStates(response.data);
      } else {
        setError('Failed to load states. Please try again.');
      }
    } catch (err) {
      setError('Failed to load states.');
    } finally {
      setIsLoadingStates(false);
    }
  };

  const loadLGAs = async (stateId: string) => {
    try {
      setIsLoadingLGAs(true);
      const response = await apiClient.getLGAsByState(stateId);

      if (response.success && response.data) {
        setLGAs(response.data);
      } else {
        setError('Failed to load LGAs. Please try again.');
      }
    } catch (err) {
      setError('Failed to load LGAs.');
    } finally {
      setIsLoadingLGAs(false);
    }
  };

  // Note: Neighborhood loading is handled in the NeighborhoodSelectionForm component
  // These functions are kept for potential future use but are not currently used in this form

  const handleStateChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedState = states.find(s => s.id === e.target.value);
    setFormData(prev => ({
      ...prev,
      stateId: e.target.value,
      stateName: selectedState?.name || '',
      lgaId: '',
      lgaName: '',
    }));
  };

  const handleLGAChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedLGA = lgas.find(l => l.id === e.target.value);
    setFormData(prev => ({
      ...prev,
      lgaId: e.target.value,
      lgaName: selectedLGA?.name || '',
    }));
  };

  // Note: Neighborhood selection is handled in the NeighborhoodSelectionForm component
  // These handlers are kept for potential future use but are not currently used in this form


  const handleContinueToNeighborhood = () => {
    if (!formData.stateId || !formData.lgaId) {
      setError('Please select at least state and LGA');
      return;
    }

    // Save location data to context
    setLocationData({
      stateId: formData.stateId,
      stateName: formData.stateName,
      lgaId: formData.lgaId,
      lgaName: formData.lgaName,
      cityTown: formData.cityTown,
      address: formData.address,
      coordinates: {
        latitude: coordinates.latitude,
        longitude: coordinates.longitude,
      },
    });

    // Navigate to neighborhood selection step
    setCurrentStep('neighborhood-selection');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    handleContinueToNeighborhood();
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-white px-6 py-12">
      <div className="max-w-md w-full">
        <div className="bg-white rounded-2xl shadow-lg p-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">Set Your Location</h2>
          <p className="text-gray-600 mb-8">Let's find your neighborhood</p>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Location Method Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                How would you like to set your location?
              </label>
              <div className="space-y-2">
                <button
                  type="button"
                  onClick={() => setLocationMethod('gps')}
                  className={`w-full flex items-center gap-3 p-4 border-2 rounded-lg transition-all ${
                    locationMethod === 'gps'
                      ? 'border-green-600 bg-green-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <Navigation className="w-5 h-5 text-gray-600" />
                  <div className="flex-1 text-left">
                    <div className="font-medium text-gray-900">Use GPS</div>
                    <div className="text-sm text-gray-600">Automatically detect your location</div>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => setLocationMethod('manual')}
                  className={`w-full flex items-center gap-3 p-4 border-2 rounded-lg transition-all ${
                    locationMethod === 'manual'
                      ? 'border-green-600 bg-green-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <MapPin className="w-5 h-5 text-gray-600" />
                  <div className="flex-1 text-left">
                    <div className="font-medium text-gray-900">Select Manually</div>
                    <div className="text-sm text-gray-600">Choose your state, LGA, and area</div>
                  </div>
                </button>
              </div>
            </div>

            {/* Manual Location Form */}
            {locationMethod === 'manual' && (
              <>
                {/* State Selection */}
                <div>
                  <label htmlFor="state" className="block text-sm font-medium text-gray-700 mb-2">
                    State *
                  </label>
                  {isLoadingStates ? (
                    <div className="flex items-center gap-2 text-gray-600">
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span className="text-sm">Loading states...</span>
                    </div>
                  ) : (
                    <select
                      id="state"
                      value={formData.stateId}
                      onChange={handleStateChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-600 focus:border-transparent outline-none transition-all text-gray-900"
                      required
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

                {/* LGA Selection */}
                {formData.stateId && (
                  <div>
                    <label htmlFor="lga" className="block text-sm font-medium text-gray-700 mb-2">
                      LGA (Local Government Area) *
                    </label>
                    {isLoadingLGAs ? (
                      <div className="flex items-center gap-2 text-gray-600">
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span className="text-sm">Loading LGAs...</span>
                      </div>
                    ) : (
                      <select
                        id="lga"
                        value={formData.lgaId}
                        onChange={handleLGAChange}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-600 focus:border-transparent outline-none transition-all text-gray-900"
                        required
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

              </>
            )}

            {/* GPS Location Display */}
            {locationMethod === 'gps' && coordinates.latitude && (
              <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                <p className="text-sm text-gray-700 mb-2">
                  <strong>Location detected:</strong>
                </p>
                {formData.formattedAddress ? (
                  <p className="text-base font-medium text-gray-900 mb-2">
                    📍 {formData.formattedAddress}
                  </p>
                ) : (
                  <p className="text-xs text-gray-600 mb-2">
                    Getting address...
                  </p>
                )}
                <p className="text-xs text-gray-500 mb-4">
                  Coordinates: {coordinates.latitude.toFixed(6)}, {coordinates.longitude?.toFixed(6)}
                </p>

                <p className="text-sm text-gray-600">
                  Please confirm your state and LGA below:
                </p>

                {/* State Selection for GPS */}
                <div className="mt-3">
                  <label htmlFor="gps-state" className="block text-sm font-medium text-gray-700 mb-2">
                    State *
                  </label>
                  <select
                    id="gps-state"
                    value={formData.stateId}
                    onChange={handleStateChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-600 focus:border-transparent outline-none transition-all text-gray-900"
                    required
                  >
                    <option value="">Select State</option>
                    {states.map((state) => (
                      <option key={state.id} value={state.id}>
                        {state.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* LGA Selection for GPS */}
                {formData.stateId && (
                  <div className="mt-3">
                    <label htmlFor="gps-lga" className="block text-sm font-medium text-gray-700 mb-2">
                      LGA *
                    </label>
                    <select
                      id="gps-lga"
                      value={formData.lgaId}
                      onChange={handleLGAChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-600 focus:border-transparent outline-none transition-all text-gray-900"
                      required
                    >
                      <option value="">Select LGA</option>
                      {lgas.map((lga) => (
                        <option key={lga.id} value={lga.id}>
                          {lga.name} {lga.type === 'LCDA' ? '(LCDA)' : ''}
                        </option>
                      ))}
                    </select>
                  </div>
                )}
              </div>
            )}

            {error && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-sm text-red-600">{error}</p>
              </div>
            )}

            {/* Submit button - Continue to next step */}
            <button
              type="submit"
              disabled={!formData.stateId || !formData.lgaId || isLoading}
              className="w-full py-3 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Processing...
                </>
              ) : (
                'Continue to Neighborhood Selection'
              )}
            </button>
          </form>

        </div>
      </div>
    </div>
  );
}
