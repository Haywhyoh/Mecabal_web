'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { ChevronLeft, Save, Trash2, AlertTriangle, Loader2 } from 'lucide-react';
import dynamic from 'next/dynamic';
import { apiClient } from '@/lib/api';

const NeighborhoodBoundaryEditor = dynamic(
  () => import('@/components/neighborhoods/NeighborhoodBoundaryEditor'),
  { ssr: false }
);

export default function EditNeighborhoodPage() {
  const router = useRouter();
  const params = useParams();
  const neighborhoodId = params.id as string;

  const [neighborhood, setNeighborhood] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [currentUserId, setCurrentUserId] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const [saveError, setSaveError] = useState<string | null>(null);

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    type: 'AREA' as 'AREA' | 'ESTATE' | 'COMMUNITY',
    description: '',
    isGated: false,
  });

  useEffect(() => {
    // Check authentication
    const token = localStorage.getItem('accessToken');
    if (!token) {
      router.push('/onboarding');
      return;
    }

    loadCurrentUser();
    loadNeighborhoodDetails();
  }, [neighborhoodId, router]);

  const loadCurrentUser = async () => {
    try {
      const response = await apiClient.getCurrentUser();
      if (response.success && response.data) {
        setCurrentUserId(response.data.id);
      }
    } catch (error) {
      console.error('Error loading user:', error);
    }
  };

  const loadNeighborhoodDetails = async () => {
    setIsLoading(true);
    try {
      const response = await apiClient.getNeighborhoodById(neighborhoodId);
      if (response.success && response.data) {
        const data = response.data;
        setNeighborhood(data);
        setFormData({
          name: data.name || '',
          type: data.type || 'AREA',
          description: data.description || '',
          isGated: data.isGated || false,
        });
      } else {
        // Neighborhood not found
        router.push('/neighborhoods/browse');
      }
    } catch (error) {
      console.error('Error loading neighborhood:', error);
      setError('Failed to load neighborhood details');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    if (!neighborhood) return;

    setIsSaving(true);
    setSaveError(null);

    try {
      const response = await apiClient.updateNeighborhood(neighborhoodId, {
        name: formData.name,
        type: formData.type,
        description: formData.description,
        isGated: formData.isGated,
      });

      if (response.success) {
        // Redirect to details page
        router.push(`/neighborhoods/${neighborhoodId}`);
      } else {
        setSaveError(response.error || 'Failed to update neighborhood');
      }
    } catch (error) {
      console.error('Error updating neighborhood:', error);
      setSaveError('Failed to update neighborhood. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleBoundarySave = () => {
    // Boundary is saved by NeighborhoodBoundaryEditor component
    // Just reload the neighborhood data to show updated boundary
    loadNeighborhoodDetails();
  };

  const handleDelete = async () => {
    if (!neighborhood) return;

    setIsDeleting(true);
    try {
      const response = await apiClient.deleteNeighborhood(neighborhoodId);

      if (response.success) {
        // Redirect to browse page
        router.push('/neighborhoods/browse');
      } else {
        setError(response.error || 'Failed to delete neighborhood');
        setShowDeleteConfirm(false);
      }
    } catch (error) {
      console.error('Error deleting neighborhood:', error);
      setError('Failed to delete neighborhood. Please try again.');
      setShowDeleteConfirm(false);
    } finally {
      setIsDeleting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-green-600 mx-auto mb-4" />
          <p className="text-gray-600">Loading neighborhood...</p>
        </div>
      </div>
    );
  }

  if (!neighborhood) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <AlertTriangle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <p className="text-gray-600 mb-4">Neighborhood not found</p>
          <Link
            href="/neighborhoods/browse"
            className="text-green-600 hover:text-green-700"
          >
            Back to Browse
          </Link>
        </div>
      </div>
    );
  }

  // Check authorization
  const isCreator = currentUserId === neighborhood.createdBy;
  if (!isCreator && currentUserId) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center max-w-md">
          <AlertTriangle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            Access Denied
          </h2>
          <p className="text-gray-600 mb-4">
            You can only edit neighborhoods that you created.
          </p>
          <Link
            href={`/neighborhoods/${neighborhoodId}`}
            className="text-green-600 hover:text-green-700"
          >
            View Neighborhood
          </Link>
        </div>
      </div>
    );
  }

  const TYPE_COLORS = {
    AREA: 'bg-blue-100 text-blue-800 border-blue-200',
    ESTATE: 'bg-green-100 text-green-800 border-green-200',
    COMMUNITY: 'bg-amber-100 text-amber-800 border-amber-200',
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-6xl mx-auto px-6 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link
                href={`/neighborhoods/${neighborhoodId}`}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <ChevronLeft className="w-5 h-5 text-gray-600" />
              </Link>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Edit Neighborhood</h1>
                <p className="text-sm text-gray-600 mt-1">{neighborhood.name}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={() => setShowDeleteConfirm(true)}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 flex items-center gap-2"
              >
                <Trash2 className="w-4 h-4" />
                Delete
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-6 py-8">
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-sm text-red-600">{error}</p>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Form Section */}
          <div className="lg:col-span-2 space-y-6">
            {/* Basic Information Card */}
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">
                Basic Information
              </h2>

              {saveError && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-sm text-red-600">{saveError}</p>
                </div>
              )}

              <div className="space-y-4">
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
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-gray-900"
                    placeholder="Enter neighborhood name"
                    required
                  />
                </div>

                {/* Type */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Type *
                  </label>
                  <select
                    value={formData.type}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        type: e.target.value as 'AREA' | 'ESTATE' | 'COMMUNITY',
                      }))
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-gray-900"
                  >
                    <option value="AREA" className="text-gray-900">Area</option>
                    <option value="ESTATE" className="text-gray-900">Estate</option>
                    <option value="COMMUNITY" className="text-gray-900">Community</option>
                  </select>
                </div>

                {/* Description */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Description
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, description: e.target.value }))
                    }
                    rows={4}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-gray-900"
                    placeholder="Describe this neighborhood..."
                  />
                </div>

                {/* Gated Status */}
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
                    This is a gated neighborhood
                  </label>
                </div>

                {/* Save Button */}
                <div className="pt-4 border-t border-gray-200">
                  <button
                    onClick={handleSave}
                    disabled={isSaving || !formData.name.trim()}
                    className="w-full px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center justify-center gap-2 font-semibold"
                  >
                    {isSaving ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      <>
                        <Save className="w-5 h-5" />
                        Save Changes
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>

            {/* Boundary Editor Card */}
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                Edit Boundary
              </h2>
              <p className="text-sm text-gray-600 mb-6">
                Draw or modify the boundary for this neighborhood on the map below.
              </p>

              <NeighborhoodBoundaryEditor
                neighborhoodId={neighborhoodId}
                neighborhoodName={formData.name || neighborhood.name}
                currentBoundary={neighborhood.boundaries}
                center={
                  neighborhood.centerLatitude && neighborhood.centerLongitude
                    ? [neighborhood.centerLatitude, neighborhood.centerLongitude]
                    : undefined
                }
                onSave={handleBoundarySave}
                onCancel={() => {}}
              />
            </div>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1 space-y-6">
            {/* Info Card */}
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Current Information
              </h3>
              <div className="space-y-3">
                <div>
                  <p className="text-sm text-gray-600">Type</p>
                  <span
                    className={`inline-block mt-1 px-3 py-1 rounded-full text-sm font-medium border ${
                      TYPE_COLORS[(neighborhood.type || 'AREA') as keyof typeof TYPE_COLORS]
                    }`}
                  >
                    {neighborhood.type || 'AREA'}
                  </span>
                </div>

                {neighborhood.lga && (
                  <div>
                    <p className="text-sm text-gray-600">LGA</p>
                    <p className="font-medium text-gray-900 mt-1">
                      {neighborhood.lga.name}
                    </p>
                  </div>
                )}

                <div>
                  <p className="text-sm text-gray-600">Boundary Type</p>
                  <p className="font-medium text-gray-900 mt-1">
                    {neighborhood.boundaries
                      ? 'Custom polygon'
                      : `GPS circle (${neighborhood.radiusMeters || 1000}m)`}
                  </p>
                </div>

                {neighborhood.memberCount !== undefined && (
                  <div>
                    <p className="text-sm text-gray-600">Members</p>
                    <p className="font-medium text-gray-900 mt-1">
                      {neighborhood.memberCount} residents
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Actions Card */}
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Actions</h3>
              <div className="space-y-2">
                <Link
                  href={`/neighborhoods/${neighborhoodId}`}
                  className="block w-full px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-center"
                >
                  View Neighborhood
                </Link>
                <Link
                  href="/neighborhoods/browse"
                  className="block w-full px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-center"
                >
                  Browse All
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <div className="flex items-center gap-3 mb-4">
              <AlertTriangle className="w-6 h-6 text-red-500" />
              <h3 className="text-lg font-semibold text-gray-900">
                Delete Neighborhood
              </h3>
            </div>
            <p className="text-gray-600 mb-6">
              Are you sure you want to delete <strong>{neighborhood.name}</strong>? This
              action cannot be undone and will remove all associated data.
            </p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                disabled={isDeleting}
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                disabled={isDeleting}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 flex items-center gap-2"
              >
                {isDeleting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Deleting...
                  </>
                ) : (
                  <>
                    <Trash2 className="w-4 h-4" />
                    Delete
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

