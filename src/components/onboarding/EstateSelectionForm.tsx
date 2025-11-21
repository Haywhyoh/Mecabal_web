'use client';

import React, { useState, useEffect } from 'react';
import { Loader2, Search, Shield } from 'lucide-react';
import { useOnboarding } from '@/contexts/OnboardingContext';
import { apiClient } from '@/lib/api';
import type { Neighborhood } from '@/types/neighborhood';

export default function EstateSelectionForm() {
  const { locationData, updateLocationData, setCurrentStep } = useOnboarding();
  const [estateSearchQuery, setEstateSearchQuery] = useState('');
  const [selectedEstate, setSelectedEstate] = useState<Neighborhood | null>(null);
  const [estates, setEstates] = useState<Neighborhood[]>([]);
  const [isLoadingEstates, setIsLoadingEstates] = useState(false);
  const [error, setError] = useState<string>();

  // Debounce search - only search after user stops typing for 300ms
  useEffect(() => {
    if (!estateSearchQuery || estateSearchQuery.length < 2) {
      setEstates([]);
      return;
    }

    const timeoutId = setTimeout(() => {
      searchEstates();
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [estateSearchQuery]);

  const searchEstates = async () => {
    if (!estateSearchQuery || estateSearchQuery.length < 2) {
      setEstates([]);
      return;
    }

    try {
      setIsLoadingEstates(true);
      setError(undefined);
      const response = await apiClient.searchEstates({
        query: estateSearchQuery,
        stateId: locationData?.stateId,
        lgaId: locationData?.lgaId,
        limit: 50,
      });

      if (response.success && response.data) {
        setEstates(response.data);
        if (response.data.length === 0) {
          setError('No gated estates found. Please try a different search term.');
        }
      } else {
        setError(response.error || 'Failed to search estates. Please try again.');
      }
    } catch (err) {
      setError('Failed to search estates.');
    } finally {
      setIsLoadingEstates(false);
    }
  };

  const handleEstateSelect = (estate: Neighborhood) => {
    // Validate that it's a gated estate
    if (estate.type !== 'ESTATE' || !estate.isGated) {
      setError('Please select a gated estate. This location is not a gated estate.');
      return;
    }

    setSelectedEstate(estate);
    setEstateSearchQuery(estate.name);
    setError(undefined);
    updateLocationData({ estateId: estate.id });
  };

  const handleContinue = () => {
    if (!selectedEstate) {
      setError('Please select a gated estate to continue.');
      return;
    }

    // Validate estate is gated
    if (selectedEstate.type !== 'ESTATE' || !selectedEstate.isGated) {
      setError('Please select a gated estate. This location is not a gated estate.');
      return;
    }

    setCurrentStep('profile-setup');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-white px-6 py-12">
      <div className="max-w-md w-full">
        <div className="bg-white rounded-2xl shadow-lg p-8">
          <div className="flex items-center gap-2 mb-2">
            <Shield className="w-6 h-6 text-green-600" />
            <h2 className="text-3xl font-bold text-gray-900">Select Your Gated Estate</h2>
          </div>
          <p className="text-gray-600 mb-2">
            Search and select your gated estate (required)
          </p>
          <p className="text-sm text-gray-500 mb-8">
            {locationData?.stateName && locationData?.lgaName && (
              <>📍 {locationData.lgaName}, {locationData.stateName}</>
            )}
          </p>

          <div className="space-y-6">
            {/* Estate Search Input */}
            <div>
              <label htmlFor="search" className="block text-sm font-medium text-gray-700 mb-2">
                Search for your gated estate
              </label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  id="search"
                  type="text"
                  value={estateSearchQuery}
                  onChange={(e) => setEstateSearchQuery(e.target.value)}
                  placeholder="Type at least 2 characters to search..."
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-600 focus:border-transparent outline-none transition-all text-gray-900"
                  autoFocus
                />
              </div>

              {!estateSearchQuery && (
                <p className="text-sm text-gray-600 mt-2">
                  Type at least 2 characters to search for your gated estate
                </p>
              )}

              {estateSearchQuery && estateSearchQuery.length < 2 && (
                <p className="text-sm text-gray-600 mt-2">
                  Type {2 - estateSearchQuery.length} more character{2 - estateSearchQuery.length > 1 ? 's' : ''} to search...
                </p>
              )}

              {isLoadingEstates && (
                <div className="flex items-center gap-2 text-gray-600 mt-2">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span className="text-sm">Searching gated estates...</span>
                </div>
              )}
            </div>

            {/* Estate Dropdown - only show when results are available */}
            {!isLoadingEstates && estates.length > 0 && (
              <div>
                <label htmlFor="estate" className="block text-sm font-medium text-gray-700 mb-2">
                  Select Gated Estate *
                </label>
                <select
                  id="estate"
                  value={selectedEstate?.id || ''}
                  onChange={(e) => {
                    const selected = estates.find(n => n.id === e.target.value);
                    if (selected) {
                      handleEstateSelect(selected);
                    }
                  }}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-600 focus:border-transparent outline-none transition-all text-gray-900"
                  required
                >
                  <option value="">Select a gated estate</option>
                  {estates.map((estate) => (
                    <option key={estate.id} value={estate.id}>
                      {estate.name} - {estate.type} {estate.isGated ? '🔒 Gated' : ''}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Selected Estate Display */}
            {selectedEstate && (
              <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                <div className="flex items-start gap-3">
                  <Shield className="w-5 h-5 text-green-600 mt-0.5" />
                  <div className="flex-1">
                    <p className="font-semibold text-gray-900">{selectedEstate.name}</p>
                    <p className="text-sm text-gray-600">
                      {selectedEstate.type} • {selectedEstate.isGated ? 'Gated Estate' : 'Not Gated'}
                    </p>
                    {selectedEstate.description && (
                      <p className="text-xs text-gray-500 mt-1">{selectedEstate.description}</p>
                    )}
                  </div>
                </div>
              </div>
            )}

            {!isLoadingEstates && estateSearchQuery && estateSearchQuery.length >= 2 && estates.length === 0 && !error && (
              <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg text-center">
                <p className="text-sm text-gray-600 mb-2">No gated estates found matching "{estateSearchQuery}"</p>
                <p className="text-xs text-gray-500">Try a different search term or check your location settings</p>
              </div>
            )}

            {error && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-sm text-red-600">{error}</p>
              </div>
            )}

            {/* Action Button */}
            <button
              onClick={handleContinue}
              disabled={!selectedEstate || isLoadingEstates}
              className="w-full py-3 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
            >
              Continue to Profile Setup
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

