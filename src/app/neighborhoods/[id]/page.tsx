'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { ChevronLeft, Edit, MapPin, Lock, Users, Calendar, User } from 'lucide-react';
import dynamic from 'next/dynamic';
import { apiClient } from '@/lib/api';

const NeighborhoodMapDrawer = dynamic(
  () => import('@/components/neighborhoods/NeighborhoodMapDrawer'),
  { ssr: false }
);

export default function NeighborhoodDetailsPage() {
  const router = useRouter();
  const params = useParams();
  const neighborhoodId = params.id as string;

  const [neighborhood, setNeighborhood] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [currentUserId, setCurrentUserId] = useState<string>('');

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
        setNeighborhood(response.data);
      } else {
        // Neighborhood not found
        router.push('/neighborhoods/browse');
      }
    } catch (error) {
      console.error('Error loading neighborhood:', error);
      router.push('/neighborhoods/browse');
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-gray-600">Loading neighborhood...</p>
      </div>
    );
  }

  if (!neighborhood) {
    return null;
  }

  const isCreator = currentUserId === neighborhood.createdBy;

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
                href="/neighborhoods/browse"
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <ChevronLeft className="w-5 h-5 text-gray-600" />
              </Link>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">
                  {neighborhood.name}
                </h1>
                <div className="flex items-center gap-3 mt-2">
                  <span
                    className={`px-3 py-1 rounded-full text-sm font-medium border ${
                      TYPE_COLORS[(neighborhood.type || 'AREA') as keyof typeof TYPE_COLORS]
                    }`}
                  >
                    {neighborhood.type || 'AREA'}
                  </span>
                  {neighborhood.isGated && (
                    <span className="px-3 py-1 rounded-full text-sm font-medium bg-red-100 text-red-800 border border-red-200 flex items-center gap-1">
                      <Lock className="w-3 h-3" />
                      Gated
                    </span>
                  )}
                  {neighborhood.lga && (
                    <span className="text-sm text-gray-600 flex items-center gap-1">
                      <MapPin className="w-4 h-4" />
                      {neighborhood.lga.name} LGA
                    </span>
                  )}
                </div>
              </div>
            </div>
            {isCreator && (
              <Link
                href={`/neighborhoods/${neighborhoodId}/edit`}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center gap-2"
              >
                <Edit className="w-4 h-4" />
                Edit Boundary
              </Link>
            )}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Map View */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
              <div className="p-4 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-gray-900">
                  Neighborhood Boundary
                </h2>
              </div>
              <NeighborhoodMapDrawer
                center={
                  neighborhood.centerLatitude && neighborhood.centerLongitude
                    ? [neighborhood.centerLatitude, neighborhood.centerLongitude]
                    : undefined
                }
                initialBoundary={neighborhood.boundaries}
                readOnly={true}
              />
            </div>
          </div>

          {/* Info Panel */}
          <div className="lg:col-span-1 space-y-6">
            {/* Basic Info Card */}
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Information
              </h3>
              <div className="space-y-3">
                {neighborhood.creator && (
                  <div className="flex items-start gap-3">
                    <User className="w-5 h-5 text-gray-400 mt-0.5" />
                    <div>
                      <p className="text-sm text-gray-600">Created by</p>
                      <p className="font-medium text-gray-900">
                        {neighborhood.creator.firstName} {neighborhood.creator.lastName}
                      </p>
                    </div>
                  </div>
                )}

                <div className="flex items-start gap-3">
                  <Calendar className="w-5 h-5 text-gray-400 mt-0.5" />
                  <div>
                    <p className="text-sm text-gray-600">Created</p>
                    <p className="font-medium text-gray-900">
                      {new Date(neighborhood.createdAt).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                      })}
                    </p>
                  </div>
                </div>

                {neighborhood.memberCount !== undefined && (
                  <div className="flex items-start gap-3">
                    <Users className="w-5 h-5 text-gray-400 mt-0.5" />
                    <div>
                      <p className="text-sm text-gray-600">Members</p>
                      <p className="font-medium text-gray-900">
                        {neighborhood.memberCount} residents
                      </p>
                    </div>
                  </div>
                )}

                <div className="pt-3 border-t border-gray-100">
                  <p className="text-sm text-gray-600 mb-1">Boundary Type</p>
                  <p className="font-medium text-gray-900">
                    {neighborhood.boundaries
                      ? 'Custom polygon'
                      : `GPS circle (${neighborhood.radiusMeters || 1000}m radius)`}
                  </p>
                </div>

                {neighborhood.boundaries && (
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Area</p>
                    <p className="font-medium text-gray-900">
                      ~{calculateArea(neighborhood.boundaries)} km²
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Description Card */}
            {neighborhood.description && (
              <div className="bg-white rounded-lg border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-3">
                  Description
                </h3>
                <p className="text-gray-700">{neighborhood.description}</p>
              </div>
            )}

            {/* Actions Card */}
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Actions
              </h3>
              <div className="space-y-2">
                <button className="w-full px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors">
                  Join Neighborhood
                </button>
                <button className="w-full px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors">
                  Share
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Helper function to calculate approximate area (simple estimation)
function calculateArea(boundaries: any): string {
  if (!boundaries || !boundaries.coordinates || !boundaries.coordinates[0]) {
    return '0';
  }

  const coords = boundaries.coordinates[0];
  // Very rough estimation - for display purposes only
  const latRange = Math.abs(
    Math.max(...coords.map((c: number[]) => c[1])) -
      Math.min(...coords.map((c: number[]) => c[1]))
  );
  const lngRange = Math.abs(
    Math.max(...coords.map((c: number[]) => c[0])) -
      Math.min(...coords.map((c: number[]) => c[0]))
  );
  const area = (latRange * lngRange * 111 * 111).toFixed(2); // Very rough km² estimate
  return area;
}
