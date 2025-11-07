'use client';

import { useState, useEffect } from 'react';
import { Loader2, ChevronRight, Check, MapPin, Edit3, Save } from 'lucide-react';
import dynamic from 'next/dynamic';
import { apiClient } from '@/lib/api';

const EnhancedMapDrawer = dynamic(
  () => import('@/components/neighborhoods/EnhancedMapDrawer'),
  { ssr: false }
);

interface LocationData {
  state?: string;
  lga?: string;
  city?: string;
  formattedAddress?: string;
}

interface ImprovedCreateWizardProps {
  onComplete: (neighborhood: any) => void;
  onCancel: () => void;
}

export default function ImprovedCreateWizard({
  onComplete,
  onCancel,
}: ImprovedCreateWizardProps) {
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string>();

  const [states, setStates] = useState<any[]>([]);
  const [lgas, setLgas] = useState<any[]>([]);
  const [loadingLgas, setLoadingLgas] = useState(false);

  const [drawnBoundary, setDrawnBoundary] = useState<{
    type: 'Polygon';
    coordinates: number[][][];
  } | null>(null);

  const [detectedLocation, setDetectedLocation] = useState<LocationData | null>(null);

  const [formData, setFormData] = useState({
    name: '',
    type: 'AREA' as 'AREA' | 'ESTATE' | 'COMMUNITY',
    isGated: false,
    description: '',
    stateId: '',
    lgaId: '',
  });

  // Load states
  useEffect(() => {
    const loadStates = async () => {
      try {
        const response = await apiClient.getStates();
        if (response.success && response.data) {
          setStates(response.data);
        }
      } catch (error) {
        console.error('Failed to load states:', error);
      }
    };
    loadStates();
  }, []);

  // Load LGAs when state changes
  useEffect(() => {
    if (!formData.stateId) {
      setLgas([]);
      return;
    }

    const loadLgas = async () => {
      setLoadingLgas(true);
      try {
        const response = await apiClient.getLGAsByState(formData.stateId);
        if (response.success && response.data) {
          setLgas(response.data);
        }
      } catch (error) {
        console.error('Failed to load LGAs:', error);
      } finally {
        setLoadingLgas(false);
      }
    };
    loadLgas();
  }, [formData.stateId]);

  // Auto-select state/LGA from detected location
  useEffect(() => {
    if (!detectedLocation) return;

    // Try to match detected state
    if (detectedLocation.state && states.length > 0) {
      const matchedState = states.find(
        (s) => s.name.toLowerCase() === detectedLocation.state?.toLowerCase()
      );
      if (matchedState && !formData.stateId) {
        setFormData((prev) => ({ ...prev, stateId: matchedState.id.toString() }));
      }
    }
  }, [detectedLocation, states]);

  // Auto-select LGA from detected location
  useEffect(() => {
    if (!detectedLocation || !detectedLocation.lga || lgas.length === 0) return;

    const matchedLga = lgas.find(
      (lga) => lga.name.toLowerCase().includes(detectedLocation.lga?.toLowerCase() || '')
    );

    if (matchedLga && !formData.lgaId) {
      setFormData((prev) => ({ ...prev, lgaId: matchedLga.id.toString() }));
    }
  }, [detectedLocation, lgas]);

  const handleBoundaryDrawn = (
    boundary: { type: 'Polygon'; coordinates: number[][][] },
    location: LocationData
  ) => {
    setDrawnBoundary(boundary);
    setDetectedLocation(location);
  };

  const handleNext = () => {
    if (step === 1 && !drawnBoundary) {
      setError('Please draw your neighborhood boundary on the map');
      return;
    }
    if (step === 2 && (!formData.stateId || !formData.lgaId)) {
      setError('Please select both State and LGA');
      return;
    }
    if (step === 3 && !formData.name.trim()) {
      setError('Please enter a neighborhood name');
      return;
    }
    setError(undefined);
    setStep(step + 1);
  };

  const handleSubmit = async () => {
    if (!formData.name.trim()) {
      setError('Please enter a neighborhood name');
      return;
    }

    if (!formData.lgaId) {
      setError('Please select a Local Government Area');
      return;
    }

    if (!drawnBoundary) {
      setError('Please draw a boundary for your neighborhood');
      return;
    }

    setIsSubmitting(true);
    setError(undefined);

    try {
      // Calculate center from boundary
      const points = drawnBoundary.coordinates[0];
      let latSum = 0;
      let lngSum = 0;
      points.forEach(([lng, lat]) => {
        latSum += lat;
        lngSum += lng;
      });
      const centerLat = latSum / points.length;
      const centerLng = lngSum / points.length;

      // Ensure polygon is closed
      let boundaries = drawnBoundary;
      const ring = boundaries.coordinates[0];
      if (ring.length > 0) {
        const first = ring[0];
        const last = ring[ring.length - 1];
        if (first[0] !== last[0] || first[1] !== last[1]) {
          boundaries = {
            ...boundaries,
            coordinates: [[...ring, [first[0], first[1]]]],
          };
        }
      }

      const result = await apiClient.createNeighborhood({
        name: formData.name,
        type: formData.type,
        lgaId: formData.lgaId,
        centerLatitude: centerLat,
        centerLongitude: centerLng,
        isGated: formData.isGated,
        description: formData.description,
        boundaries,
      });

      if (result.success) {
        onComplete(result.data);
      } else {
        setError(result.error || 'Failed to create neighborhood');
      }
    } catch (err: any) {
      console.error('Error creating neighborhood:', err);
      setError(err.message || 'Failed to create neighborhood. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Step indicators
  const steps = [
    { number: 1, title: 'Draw Boundary', icon: MapPin },
    { number: 2, title: 'Confirm Location', icon: Check },
    { number: 3, title: 'Add Details', icon: Edit3 },
  ];

  return (
    <div className="max-w-5xl mx-auto">
      {/* Progress Steps */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          {steps.map((s, index) => {
            const Icon = s.icon;
            const isActive = step === s.number;
            const isCompleted = step > s.number;

            return (
              <div key={s.number} className="flex items-center flex-1">
                <div className="flex flex-col items-center flex-1">
                  <div
                    className={`w-12 h-12 rounded-full flex items-center justify-center border-2 transition-colors ${
                      isCompleted
                        ? 'bg-green-600 border-green-600'
                        : isActive
                        ? 'bg-green-100 border-green-600'
                        : 'bg-white border-gray-300'
                    }`}
                  >
                    {isCompleted ? (
                      <Check className="w-6 h-6 text-white" />
                    ) : (
                      <Icon
                        className={`w-6 h-6 ${
                          isActive ? 'text-green-600' : 'text-gray-400'
                        }`}
                      />
                    )}
                  </div>
                  <p
                    className={`text-sm mt-2 font-medium ${
                      isActive || isCompleted ? 'text-gray-900' : 'text-gray-500'
                    }`}
                  >
                    {s.title}
                  </p>
                </div>
                {index < steps.length - 1 && (
                  <div
                    className={`flex-1 h-0.5 mx-4 ${
                      step > s.number ? 'bg-green-600' : 'bg-gray-300'
                    }`}
                  />
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-sm text-red-600">{error}</p>
        </div>
      )}

      {/* Step Content */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        {/* Step 1: Draw Boundary */}
        {step === 1 && (
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Draw Your Neighborhood Boundary
            </h2>
            <p className="text-gray-600 mb-6">
              Use the search box to find your location, then draw the boundary of your
              neighborhood. We'll automatically detect the State and LGA for you.
            </p>

            <EnhancedMapDrawer
              onBoundaryDrawn={handleBoundaryDrawn}
              onLocationDetected={setDetectedLocation}
              showPlacesSearch={true}
            />
          </div>
        )}

        {/* Step 2: Confirm Location */}
        {step === 2 && (
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Confirm Location Details
            </h2>
            <p className="text-gray-600 mb-6">
              We detected your location. Please confirm or adjust if needed.
            </p>

            <div className="space-y-4 max-w-2xl">
              {/* State */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  State *
                </label>
                <select
                  value={formData.stateId}
                  onChange={(e) => {
                    setFormData((prev) => ({
                      ...prev,
                      stateId: e.target.value,
                      lgaId: '', // Reset LGA when state changes
                    }));
                  }}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-600 focus:border-transparent text-gray-900"
                  required
                >
                  <option value="">Select State</option>
                  {states.map((state) => (
                    <option key={state.id} value={state.id} className="text-gray-900">
                      {state.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* LGA */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Local Government Area *
                </label>
                <select
                  value={formData.lgaId}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, lgaId: e.target.value }))
                  }
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-600 focus:border-transparent text-gray-900"
                  disabled={!formData.stateId || loadingLgas}
                  required
                >
                  <option value="">
                    {loadingLgas
                      ? 'Loading LGAs...'
                      : !formData.stateId
                      ? 'Select a state first'
                      : 'Select LGA'}
                  </option>
                  {lgas.map((lga) => (
                    <option key={lga.id} value={lga.id} className="text-gray-900">
                      {lga.name}
                    </option>
                  ))}
                </select>
              </div>

              {detectedLocation && (
                <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <p className="text-sm font-medium text-blue-900 mb-1">
                    🗺️ Detected from your boundary:
                  </p>
                  {detectedLocation.city && (
                    <p className="text-sm text-blue-700">City: {detectedLocation.city}</p>
                  )}
                  {detectedLocation.formattedAddress && (
                    <p className="text-xs text-blue-600 mt-1">
                      {detectedLocation.formattedAddress}
                    </p>
                  )}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Step 3: Add Details */}
        {step === 3 && (
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Add Neighborhood Details
            </h2>
            <p className="text-gray-600 mb-6">
              Finally, give your neighborhood a name and add any additional details.
            </p>

            <div className="space-y-4 max-w-2xl">
              {/* Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Neighborhood Name *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, name: e.target.value }))
                  }
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-600 focus:border-transparent text-gray-900"
                  placeholder="e.g., Lekki Phase 1, Victoria Island"
                  required
                />
              </div>

              {/* Type */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Type *
                </label>
                <div className="grid grid-cols-3 gap-3">
                  {['AREA', 'ESTATE', 'COMMUNITY'].map((type) => (
                    <button
                      key={type}
                      type="button"
                      onClick={() =>
                        setFormData((prev) => ({
                          ...prev,
                          type: type as 'AREA' | 'ESTATE' | 'COMMUNITY',
                        }))
                      }
                      className={`px-4 py-3 rounded-lg border-2 font-medium transition-all ${
                        formData.type === type
                          ? 'border-green-600 bg-green-50 text-green-900'
                          : 'border-gray-200 bg-white text-gray-700 hover:border-gray-300'
                      }`}
                    >
                      {type.charAt(0) + type.slice(1).toLowerCase()}
                    </button>
                  ))}
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description (Optional)
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, description: e.target.value }))
                  }
                  rows={4}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-600 focus:border-transparent text-gray-900"
                  placeholder="Describe your neighborhood..."
                />
              </div>

              {/* Gated */}
              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  id="isGated"
                  checked={formData.isGated}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, isGated: e.target.checked }))
                  }
                  className="w-4 h-4 text-green-600 border-gray-300 rounded focus:ring-green-500"
                />
                <label htmlFor="isGated" className="text-sm font-medium text-gray-700">
                  This is a gated neighborhood/estate
                </label>
              </div>
            </div>
          </div>
        )}

        {/* Navigation Buttons */}
        <div className="flex justify-between mt-8 pt-6 border-t border-gray-200">
          <button
            onClick={step === 1 ? onCancel : () => setStep(step - 1)}
            className="px-6 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 font-medium"
          >
            {step === 1 ? 'Cancel' : 'Back'}
          </button>

          {step < 3 ? (
            <button
              onClick={handleNext}
              disabled={step === 1 && !drawnBoundary}
              className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center gap-2 font-medium"
            >
              Next
              <ChevronRight className="w-5 h-5" />
            </button>
          ) : (
            <button
              onClick={handleSubmit}
              disabled={isSubmitting || !formData.name.trim()}
              className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center gap-2 font-medium"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Creating...
                </>
              ) : (
                <>
                  <Save className="w-5 h-5" />
                  Create Neighborhood
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
