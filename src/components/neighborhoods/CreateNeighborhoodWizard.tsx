'use client';

import { useState } from 'react';
import { Loader2, ChevronLeft, ChevronRight, Check } from 'lucide-react';
import dynamic from 'next/dynamic';
import { apiClient } from '@/lib/api';

const NeighborhoodMapDrawer = dynamic(
  () => import('@/components/neighborhoods/NeighborhoodMapDrawer'),
  { ssr: false }
);

interface CreateNeighborhoodWizardProps {
  lgaId: string;
  lgaName?: string;
  userCoordinates?: { latitude: number; longitude: number };
  onComplete: (neighborhood: any) => void;
  onCancel: () => void;
}

export default function CreateNeighborhoodWizard({
  lgaId,
  lgaName,
  userCoordinates,
  onComplete,
  onCancel,
}: CreateNeighborhoodWizardProps) {
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string>();

  const [formData, setFormData] = useState({
    name: '',
    type: 'AREA' as 'AREA' | 'ESTATE' | 'COMMUNITY',
    isGated: false,
    description: '',
    boundaries: null as { type: 'Polygon'; coordinates: number[][][] } | null,
  });

  const handleNext = () => {
    if (step === 1 && !formData.name) {
      setError('Please enter a neighborhood name');
      return;
    }
    setError(undefined);
    setStep(step + 1);
  };

  const handleBack = () => {
    setError(undefined);
    setStep(step - 1);
  };

  const handleSubmit = async () => {
    if (!formData.name) {
      setError('Please enter a neighborhood name');
      return;
    }

    setIsSubmitting(true);
    setError(undefined);

    try {
      // Validate lgaId is provided and not empty
      if (!lgaId || lgaId.trim() === '') {
        setError('Please select a Local Government Area (LGA) before creating a neighborhood.');
        setIsSubmitting(false);
        return;
      }

      // Prepare boundaries - ensure it's in the correct format
      let boundaries = formData.boundaries;
      if (boundaries) {
        // Ensure coordinates are properly formatted
        // GeoJSON Polygon format: coordinates[0] is the outer ring
        if (boundaries.coordinates && boundaries.coordinates[0]) {
          // Ensure the polygon is closed (first and last points are the same)
          const ring = boundaries.coordinates[0];
          if (ring.length > 0) {
            const first = ring[0];
            const last = ring[ring.length - 1];
            if (first[0] !== last[0] || first[1] !== last[1]) {
              // Close the polygon
              boundaries = {
                ...boundaries,
                coordinates: [[...ring, [first[0], first[1]]]],
              };
            }
          }
        }
      }

      const result = await apiClient.createNeighborhood({
        name: formData.name,
        type: formData.type,
        lgaId,
        centerLatitude: userCoordinates?.latitude,
        centerLongitude: userCoordinates?.longitude,
        isGated: formData.isGated,
        boundaries: boundaries || undefined,
      });

      if (result.success && result.data) {
        onComplete(result.data);
      } else {
        const errorMsg = result.error || 'Failed to create neighborhood';
        console.error('Create neighborhood error:', errorMsg, result);
        setError(errorMsg);
      }
    } catch (err: any) {
      console.error('Create neighborhood exception:', err);
      const errorMsg = err?.message || err?.response?.data?.error || 'Failed to create neighborhood. Please try again.';
      setError(errorMsg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto">
      {/* Progress Indicator */}
      <div className="mb-8">
        <div className="flex items-center justify-center gap-4">
          {[1, 2, 3].map((s) => (
            <div key={s} className="flex items-center">
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold ${
                  s < step
                    ? 'bg-green-600 text-white'
                    : s === step
                    ? 'bg-green-600 text-white ring-4 ring-green-200'
                    : 'bg-gray-200 text-gray-600'
                }`}
              >
                {s < step ? <Check className="w-5 h-5" /> : s}
              </div>
              {s < 3 && (
                <div
                  className={`w-16 h-1 ${
                    s < step ? 'bg-green-600' : 'bg-gray-200'
                  }`}
                />
              )}
            </div>
          ))}
        </div>
        <div className="flex justify-center gap-20 mt-2">
          <span className={`text-sm ${step >= 1 ? 'text-green-600 font-medium' : 'text-gray-500'}`}>
            Basic Info
          </span>
          <span className={`text-sm ${step >= 2 ? 'text-green-600 font-medium' : 'text-gray-500'}`}>
            Draw Boundary
          </span>
          <span className={`text-sm ${step >= 3 ? 'text-green-600 font-medium' : 'text-gray-500'}`}>
            Review
          </span>
        </div>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-sm text-red-600">{error}</p>
        </div>
      )}

      {/* Step 1: Basic Information */}
      {step === 1 && (
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Basic Information</h2>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Neighborhood Name *
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g., Allen Avenue, Ikeja GRA"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-600 focus:border-transparent outline-none text-gray-900"
                autoFocus
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Type *
              </label>
              <select
                value={formData.type}
                onChange={(e) =>
                  setFormData({ ...formData, type: e.target.value as any })
                }
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-600 focus:border-transparent outline-none text-gray-900"
              >
                <option value="AREA">Area</option>
                <option value="ESTATE">Estate</option>
                <option value="COMMUNITY">Community</option>
              </select>
              <p className="mt-1 text-xs text-gray-500">
                • Area: General neighborhood area
                <br />
                • Estate: Residential estate or housing development
                <br />• Community: Organized community group
              </p>
            </div>

            <div>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.isGated}
                  onChange={(e) =>
                    setFormData({ ...formData, isGated: e.target.checked })
                  }
                  className="w-4 h-4 text-green-600 rounded"
                />
                <span className="text-sm font-medium text-gray-700">
                  This is a gated community
                </span>
              </label>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description (Optional)
              </label>
              <textarea
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                placeholder="Brief description of the neighborhood..."
                rows={3}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-600 focus:border-transparent outline-none text-gray-900"
              />
            </div>

            {lgaName && (
              <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="text-sm text-blue-800">
                  <strong>Location:</strong> {lgaName} LGA
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Step 2: Draw Boundary */}
      {step === 2 && (
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Draw Boundary</h2>
          <p className="text-gray-600 mb-4">
            Draw the boundary of your neighborhood on the map. You can skip this step to use a default circular boundary.
          </p>
          
          <div className="mb-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-sm text-blue-800 font-medium mb-2">
              📍 Drawing Tools Location:
            </p>
            <p className="text-xs text-blue-700">
              Look for the <strong>drawing toolbar in the top-right corner</strong> of the map. 
              You'll see icons for drawing polygons, rectangles, and circles. 
              Click any tool to start drawing on the map.
            </p>
          </div>

          <NeighborhoodMapDrawer
            center={
              userCoordinates
                ? [userCoordinates.latitude, userCoordinates.longitude]
                : undefined
            }
            initialBoundary={formData.boundaries || undefined}
            onBoundaryDrawn={(boundary) => {
              setFormData({ ...formData, boundaries: boundary });
            }}
            readOnly={false}
          />

          {formData.boundaries && (
            <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg">
              <p className="text-sm text-green-800">
                ✓ Custom boundary drawn ({formData.boundaries.coordinates[0].length} points)
              </p>
            </div>
          )}
          
          {!formData.boundaries && (
            <div className="mt-4 p-3 bg-amber-50 border border-amber-200 rounded-lg">
              <p className="text-xs text-amber-700">
                💡 <strong>Can't see the drawing tools?</strong> They should appear as icon buttons in the top-right corner of the map. 
                If they're not visible, try refreshing the page or check your browser console for errors.
              </p>
            </div>
          )}
        </div>
      )}

      {/* Step 3: Review */}
      {step === 3 && (
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Review & Create</h2>

          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-600">Name</p>
                <p className="font-medium text-gray-900">{formData.name}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Type</p>
                <p className="font-medium text-gray-900">{formData.type}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Gated</p>
                <p className="font-medium text-gray-900">
                  {formData.isGated ? 'Yes' : 'No'}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Boundary</p>
                <p className="font-medium text-gray-900">
                  {formData.boundaries ? 'Custom polygon' : 'GPS circle (default)'}
                </p>
              </div>
            </div>

            {formData.description && (
              <div>
                <p className="text-sm text-gray-600">Description</p>
                <p className="text-gray-900">{formData.description}</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Navigation Buttons */}
      <div className="flex justify-between mt-6">
        <button
          onClick={step === 1 ? onCancel : handleBack}
          disabled={isSubmitting}
          className="px-6 py-3 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
        >
          <ChevronLeft className="w-4 h-4" />
          {step === 1 ? 'Cancel' : 'Back'}
        </button>

        {step < 3 ? (
          <button
            onClick={handleNext}
            className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center gap-2"
          >
            {step === 2 ? 'Skip to Review' : 'Next'}
            <ChevronRight className="w-4 h-4" />
          </button>
        ) : (
          <button
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Creating...
              </>
            ) : (
              <>
                <Check className="w-4 h-4" />
                Create Neighborhood
              </>
            )}
          </button>
        )}
      </div>
    </div>
  );
}
