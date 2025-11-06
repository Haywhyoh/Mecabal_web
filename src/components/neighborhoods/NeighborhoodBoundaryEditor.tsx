'use client';

import { useState } from 'react';
import NeighborhoodMapDrawer from './NeighborhoodMapDrawer';
import { apiClient } from '@/lib/api';

interface NeighborhoodBoundaryEditorProps {
  neighborhoodId: string;
  neighborhoodName: string;
  currentBoundary?: {
    type: 'Polygon';
    coordinates: number[][][];
  };
  center?: [number, number];
  onSave?: () => void;
  onCancel?: () => void;
}

export default function NeighborhoodBoundaryEditor({
  neighborhoodId,
  neighborhoodName,
  currentBoundary,
  center,
  onSave,
  onCancel,
}: NeighborhoodBoundaryEditorProps) {
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string>();
  const [updatedBoundary, setUpdatedBoundary] = useState<{
    type: 'Polygon';
    coordinates: number[][][];
  } | null>(currentBoundary || null);

  const handleSave = async () => {
    if (!updatedBoundary) {
      setError('Please draw a boundary first');
      return;
    }

    setIsSaving(true);
    setError(undefined);

    try {
      const result = await apiClient.updateNeighborhoodBoundaries(neighborhoodId, updatedBoundary);

      if (result.success) {
        onSave?.();
      } else {
        setError(result.error || 'Failed to update boundary');
      }
    } catch (err) {
      setError('Failed to update boundary. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Edit Boundary: {neighborhoodName}</h2>
        <p className="text-gray-600 mt-1">
          Draw or edit the boundary for this neighborhood on the map below.
        </p>
      </div>

      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-sm text-red-600">{error}</p>
        </div>
      )}

      <NeighborhoodMapDrawer
        center={center}
        initialBoundary={updatedBoundary || undefined}
        onBoundaryDrawn={(boundary) => setUpdatedBoundary(boundary)}
        readOnly={false}
      />

      <div className="flex gap-3 justify-end">
        <button
          type="button"
          onClick={onCancel}
          disabled={isSaving}
          className="px-6 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 disabled:opacity-50"
        >
          Cancel
        </button>
        <button
          type="button"
          onClick={handleSave}
          disabled={!updatedBoundary || isSaving}
          className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center gap-2"
        >
          {isSaving ? (
            <>
              <span className="animate-spin">⏳</span>
              Saving...
            </>
          ) : (
            'Save Boundary'
          )}
        </button>
      </div>
    </div>
  );
}
