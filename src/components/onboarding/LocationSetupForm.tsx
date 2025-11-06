'use client';

import React, { useState, useEffect } from 'react';
import { Loader2, MapPin, Navigation } from 'lucide-react';
import { useOnboarding } from '@/contexts/OnboardingContext';
import { apiClient } from '@/lib/api';
import { useRouter } from 'next/navigation';

export default function LocationSetupForm() {
  const { user, setCurrentStep, updateUser, setTokens, resetOnboarding } = useOnboarding();
  const router = useRouter();
  const [formData, setFormData] = useState({
    state: '',
    city: '',
    estate: '',
    address: '',
  });
  const [locationMethod, setLocationMethod] = useState<'gps' | 'manual'>('manual');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string>();
  const [coordinates, setCoordinates] = useState<{ latitude?: number; longitude?: number }>({});

  useEffect(() => {
    if (locationMethod === 'gps' && 'geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setCoordinates({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          });
        },
        () => {
          setError('Unable to get your location. Please select manually.');
          setLocationMethod('manual');
        }
      );
    }
  }, [locationMethod]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(undefined);

    if (!formData.state || !formData.city) {
      setError('Please select at least state and city');
      return;
    }

    setIsLoading(true);

    try {
      const response = await apiClient.setupLocation({
        state: formData.state,
        city: formData.city,
        estate: formData.estate || undefined,
        address: formData.address || undefined,
        latitude: coordinates.latitude,
        longitude: coordinates.longitude,
        completeRegistration: true, // Important: marks registration as complete
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

        // Clear onboarding state
        resetOnboarding();

        // Redirect to dashboard or home
        router.push('/dashboard');
      } else {
        setError(response.error || 'Failed to complete registration');
      }
    } catch (err) {
      setError('Network error. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const nigerianStates = [
    'Abia', 'Adamawa', 'Akwa Ibom', 'Anambra', 'Bauchi', 'Bayelsa', 'Benue', 'Borno',
    'Cross River', 'Delta', 'Ebonyi', 'Edo', 'Ekiti', 'Enugu', 'FCT', 'Gombe',
    'Imo', 'Jigawa', 'Kaduna', 'Kano', 'Katsina', 'Kebbi', 'Kogi', 'Kwara',
    'Lagos', 'Nasarawa', 'Niger', 'Ogun', 'Ondo', 'Osun', 'Oyo', 'Plateau',
    'Rivers', 'Sokoto', 'Taraba', 'Yobe', 'Zamfara'
  ];

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
                    <div className="text-sm text-gray-600">Choose your state, city, and area</div>
                  </div>
                </button>
              </div>
            </div>

            {/* Manual Location Form */}
            {locationMethod === 'manual' && (
              <>
                <div>
                  <label htmlFor="state" className="block text-sm font-medium text-gray-700 mb-2">
                    State *
                  </label>
                  <select
                    id="state"
                    value={formData.state}
                    onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-600 focus:border-transparent outline-none transition-all text-gray-900"
                    required
                  >
                    <option value="">Select State</option>
                    {nigerianStates.map((state) => (
                      <option key={state} value={state}>
                        {state}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label htmlFor="city" className="block text-sm font-medium text-gray-700 mb-2">
                    City *
                  </label>
                  <input
                    id="city"
                    type="text"
                    value={formData.city}
                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-600 focus:border-transparent outline-none transition-all text-gray-900"
                    placeholder="e.g., Ikeja"
                    required
                  />
                </div>

                <div>
                  <label htmlFor="estate" className="block text-sm font-medium text-gray-700 mb-2">
                    Estate/Area (Optional)
                  </label>
                  <input
                    id="estate"
                    type="text"
                    value={formData.estate}
                    onChange={(e) => setFormData({ ...formData, estate: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-600 focus:border-transparent outline-none transition-all text-gray-900"
                    placeholder="e.g., Victoria Island Estate"
                  />
                </div>

                <div>
                  <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-2">
                    Address (Optional)
                  </label>
                  <textarea
                    id="address"
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-600 focus:border-transparent outline-none transition-all text-gray-900"
                    placeholder="Street address or landmark"
                    rows={3}
                  />
                </div>
              </>
            )}

            {/* GPS Location Display */}
            {locationMethod === 'gps' && coordinates.latitude && (
              <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                <p className="text-sm text-gray-700 mb-2">
                  <strong>Location detected:</strong>
                </p>
                <p className="text-xs text-gray-600">
                  Latitude: {coordinates.latitude.toFixed(6)}, Longitude: {coordinates.longitude?.toFixed(6)}
                </p>
                <p className="text-sm text-gray-600 mt-2">
                  Please fill in your state and city below for better accuracy.
                </p>

                <div className="mt-4 space-y-3">
                  <div>
                    <label htmlFor="gps-state" className="block text-sm font-medium text-gray-700 mb-2">
                      State *
                    </label>
                    <select
                      id="gps-state"
                      value={formData.state}
                      onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-600 focus:border-transparent outline-none transition-all text-gray-900"
                      required
                    >
                      <option value="">Select State</option>
                      {nigerianStates.map((state) => (
                        <option key={state} value={state}>
                          {state}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label htmlFor="gps-city" className="block text-sm font-medium text-gray-700 mb-2">
                      City *
                    </label>
                    <input
                      id="gps-city"
                      type="text"
                      value={formData.city}
                      onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-600 focus:border-transparent outline-none transition-all text-gray-900"
                      placeholder="e.g., Ikeja"
                      required
                    />
                  </div>
                </div>
              </div>
            )}

            {error && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-sm text-red-600">{error}</p>
              </div>
            )}

            <button
              type="submit"
              disabled={!formData.state || !formData.city || isLoading}
              className="w-full py-3 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Completing Registration...
                </>
              ) : (
                'Complete Registration'
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

