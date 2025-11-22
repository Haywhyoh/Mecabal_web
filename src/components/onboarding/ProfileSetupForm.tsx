'use client';

import React, { useState, useEffect } from 'react';
import { Loader2 } from 'lucide-react';
import { useOnboarding } from '@/contexts/OnboardingContext';
import { apiClient } from '@/lib/api';
import { useRouter } from 'next/navigation';
import type { State } from '@/types/location';
import type { CulturalBackground, ProfessionalCategory } from '@/types/profile';

export default function ProfileSetupForm() {
  const { user, locationData, updateUser, setTokens, resetOnboarding } = useOnboarding();
  const router = useRouter();

  const [formData, setFormData] = useState({
    stateOfOriginId: user.stateOfOriginId || '',
    culturalBackgroundId: user.culturalBackgroundId || '',
    professionalCategoryId: user.professionalCategoryId || '',
    professionalTitle: user.professionalTitle || '',
    occupation: user.occupation || '',
  });

  const [states, setStates] = useState<State[]>([]);
  const [culturalBackgrounds, setCulturalBackgrounds] = useState<CulturalBackground[]>([]);
  const [professionalCategories, setProfessionalCategories] = useState<ProfessionalCategory[]>([]);
  const [selectedCategoryTitles, setSelectedCategoryTitles] = useState<string[]>([]);

  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingData, setIsLoadingData] = useState(true);
  const [error, setError] = useState<string>();

  // Load reference data on mount
  useEffect(() => {
    loadReferenceData();
  }, []);

  // Update titles when professional category changes
  useEffect(() => {
    if (formData.professionalCategoryId) {
      const category = professionalCategories.find(c => c.id === formData.professionalCategoryId);
      if (category) {
        setSelectedCategoryTitles(category.titles || []);
        // Clear professional title if it's not in the new category's titles
        if (formData.professionalTitle && !category.titles.includes(formData.professionalTitle)) {
          setFormData(prev => ({ ...prev, professionalTitle: '' }));
        }
      }
    } else {
      setSelectedCategoryTitles([]);
    }
  }, [formData.professionalCategoryId, professionalCategories]);

  const loadReferenceData = async () => {
    try {
      setIsLoadingData(true);
      const [statesResponse, referenceDataResponse] = await Promise.all([
        apiClient.getStates(),
        apiClient.getReferenceData(),
      ]);

      if (statesResponse.success && statesResponse.data) {
        setStates(statesResponse.data);
      }

      if (referenceDataResponse.success && referenceDataResponse.data) {
        setCulturalBackgrounds(referenceDataResponse.data.culturalBackgrounds || []);
        setProfessionalCategories(referenceDataResponse.data.professionalCategories || []);
      } else {
        // Fallback: try individual endpoints
        const [culturalResponse, professionalResponse] = await Promise.all([
          apiClient.getCulturalBackgrounds(),
          apiClient.getProfessionalCategories(),
        ]);

        if (culturalResponse.success && culturalResponse.data) {
          const data = culturalResponse.data;
          setCulturalBackgrounds(Array.isArray(data) ? data : (data as any).culturalBackgrounds || []);
        }

        if (professionalResponse.success && professionalResponse.data) {
          const data = professionalResponse.data;
          setProfessionalCategories(Array.isArray(data) ? data : (data as any).professionalCategories || []);
        }
      }
    } catch (err) {
      setError('Failed to load profile options. Please refresh the page.');
    } finally {
      setIsLoadingData(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(undefined);

    // Validate required fields
    if (!formData.stateOfOriginId || !formData.culturalBackgroundId || !formData.professionalCategoryId) {
      setError('Please fill in all required fields (State of Origin, Cultural Background, and Professional Category).');
      return;
    }

    if (!locationData?.estateId) {
      setError('Estate selection is missing. Please go back and select your estate.');
      return;
    }

    setIsLoading(true);

    try {
      // Update user context with profile data
      updateUser({
        stateOfOriginId: formData.stateOfOriginId,
        culturalBackgroundId: formData.culturalBackgroundId,
        professionalCategoryId: formData.professionalCategoryId,
        professionalTitle: formData.professionalTitle || undefined,
        occupation: formData.occupation || undefined,
      });

      // Complete registration with all data
      // Note: estateId is stored as neighborhoodId in the backend
      const response = await apiClient.setupLocation({
        stateId: locationData.stateId!,
        lgaId: locationData.lgaId!,
        neighborhoodId: locationData.estateId, // estateId is the neighborhoodId for the estate
        cityTown: locationData.cityTown,
        address: locationData.address,
        latitude: locationData.coordinates?.latitude,
        longitude: locationData.coordinates?.longitude,
        completeRegistration: true,
        stateOfOriginId: formData.stateOfOriginId,
        culturalBackgroundId: formData.culturalBackgroundId,
        professionalCategoryId: formData.professionalCategoryId,
        professionalTitle: formData.professionalTitle || undefined,
        occupation: formData.occupation || undefined,
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
      setIsLoading(false);
    }
  };

  const isFormValid = 
    formData.stateOfOriginId && 
    formData.culturalBackgroundId && 
    formData.professionalCategoryId;

  if (isLoadingData) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-white px-6 py-12">
        <div className="max-w-md w-full">
          <div className="bg-white rounded-2xl shadow-lg p-8 text-center">
            <Loader2 className="w-8 h-8 animate-spin text-green-600 mx-auto mb-4" />
            <p className="text-gray-600">Loading profile options...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-white px-6 py-12">
      <div className="max-w-md w-full">
        <div className="bg-white rounded-2xl shadow-lg p-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">Complete Your Profile</h2>
          <p className="text-gray-600 mb-8">Tell us a bit about yourself</p>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* State of Origin */}
            <div>
              <label htmlFor="stateOfOrigin" className="block text-sm font-medium text-gray-700 mb-2">
                State of Origin *
              </label>
              {states.length === 0 ? (
                <div className="flex items-center gap-2 text-gray-600">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span className="text-sm">Loading states...</span>
                </div>
              ) : (
                <select
                  id="stateOfOrigin"
                  value={formData.stateOfOriginId}
                  onChange={(e) => setFormData({ ...formData, stateOfOriginId: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-600 focus:border-transparent outline-none transition-all text-gray-900"
                  required
                >
                  <option value="">Select your state of origin</option>
                  {states.map((state) => (
                    <option key={state.id} value={state.id}>
                      {state.name}
                    </option>
                  ))}
                </select>
              )}
            </div>

            {/* Cultural Background */}
            <div>
              <label htmlFor="culturalBackground" className="block text-sm font-medium text-gray-700 mb-2">
                Cultural Background *
              </label>
              {culturalBackgrounds.length === 0 ? (
                <div className="flex items-center gap-2 text-gray-600">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span className="text-sm">Loading cultural backgrounds...</span>
                </div>
              ) : (
                <select
                  id="culturalBackground"
                  value={formData.culturalBackgroundId}
                  onChange={(e) => setFormData({ ...formData, culturalBackgroundId: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-600 focus:border-transparent outline-none transition-all text-gray-900"
                  required
                >
                  <option value="">Select your cultural background</option>
                  {culturalBackgrounds.map((culture) => (
                    <option key={culture.id} value={culture.id}>
                      {culture.name} {culture.region ? `(${culture.region})` : ''}
                    </option>
                  ))}
                </select>
              )}
            </div>

            {/* Professional Category */}
            <div>
              <label htmlFor="professionalCategory" className="block text-sm font-medium text-gray-700 mb-2">
                Professional Category *
              </label>
              {professionalCategories.length === 0 ? (
                <div className="flex items-center gap-2 text-gray-600">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span className="text-sm">Loading professional categories...</span>
                </div>
              ) : (
                <select
                  id="professionalCategory"
                  value={formData.professionalCategoryId}
                  onChange={(e) => setFormData({ ...formData, professionalCategoryId: e.target.value, professionalTitle: '' })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-600 focus:border-transparent outline-none transition-all text-gray-900"
                  required
                >
                  <option value="">Select your professional category</option>
                  {professionalCategories.map((category) => (
                    <option key={category.id} value={category.id}>
                      {category.category}
                    </option>
                  ))}
                </select>
              )}
            </div>

            {/* Professional Title */}
            {formData.professionalCategoryId && selectedCategoryTitles.length > 0 && (
              <div>
                <label htmlFor="professionalTitle" className="block text-sm font-medium text-gray-700 mb-2">
                  Professional Title (Optional)
                </label>
                <select
                  id="professionalTitle"
                  value={formData.professionalTitle}
                  onChange={(e) => setFormData({ ...formData, professionalTitle: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-600 focus:border-transparent outline-none transition-all text-gray-900"
                >
                  <option value="">Select your professional title (optional)</option>
                  {selectedCategoryTitles.map((title) => (
                    <option key={title} value={title}>
                      {title}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Occupation */}
            <div>
              <label htmlFor="occupation" className="block text-sm font-medium text-gray-700 mb-2">
                Occupation (Optional)
              </label>
              <input
                id="occupation"
                type="text"
                value={formData.occupation}
                onChange={(e) => setFormData({ ...formData, occupation: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-600 focus:border-transparent outline-none transition-all text-gray-900"
                placeholder="e.g., Software Engineer, Doctor, Teacher"
              />
            </div>

            {error && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-sm text-red-600">{error}</p>
              </div>
            )}

            <button
              type="submit"
              disabled={!isFormValid || isLoading}
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

