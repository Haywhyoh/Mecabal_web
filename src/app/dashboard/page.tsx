'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  Map,
  Plus,
  Search,
  Users,
  MapPin,
  Home,
  ArrowRight,
} from 'lucide-react';
import { apiClient } from '@/lib/api';

export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [myNeighborhoods, setMyNeighborhoods] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check if user is authenticated
    const token = localStorage.getItem('accessToken');
    if (!token) {
      router.push('/onboarding');
      return;
    }

    loadUserData();
  }, [router]);

  const loadUserData = async () => {
    try {
      // Load current user
      const userResponse = await apiClient.getCurrentUser();
      if (userResponse.success && userResponse.data) {
        setUser(userResponse.data);
      }

      // Load user's neighborhoods (neighborhoods they created)
      const neighborhoodsResponse = await apiClient.getAllNeighborhoods();
      if (neighborhoodsResponse.success && neighborhoodsResponse.data) {
        const allNeighborhoods = Array.isArray(neighborhoodsResponse.data)
          ? neighborhoodsResponse.data
          : neighborhoodsResponse.data.neighborhoods || [];
        
        // Filter to show only neighborhoods created by current user
        // For now, show all neighborhoods (backend should filter by createdBy)
        setMyNeighborhoods(allNeighborhoods.slice(0, 5)); // Show first 5
      }
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-gray-600">Loading dashboard...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-6 py-12">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Welcome{user?.firstName ? `, ${user.firstName}` : ''}!
          </h1>
          <p className="text-lg text-gray-600">
            Manage your neighborhoods and connect with your community
          </p>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <Link
            href="/neighborhoods/browse"
            className="bg-white rounded-lg border border-gray-200 p-6 hover:border-green-500 hover:shadow-lg transition-all group"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-blue-100 rounded-lg">
                <Search className="w-6 h-6 text-blue-600" />
              </div>
              <ArrowRight className="w-5 h-5 text-gray-400 group-hover:text-green-600 transition-colors" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              Browse Neighborhoods
            </h3>
            <p className="text-gray-600 text-sm">
              Explore and discover neighborhoods in your area
            </p>
          </Link>

          <Link
            href="/neighborhoods/create"
            className="bg-white rounded-lg border border-gray-200 p-6 hover:border-green-500 hover:shadow-lg transition-all group"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-green-100 rounded-lg">
                <Plus className="w-6 h-6 text-green-600" />
              </div>
              <ArrowRight className="w-5 h-5 text-gray-400 group-hover:text-green-600 transition-colors" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              Create Neighborhood
            </h3>
            <p className="text-gray-600 text-sm">
              Add a new neighborhood to the platform
            </p>
          </Link>

          <Link
            href="/neighborhoods/browse"
            className="bg-white rounded-lg border border-gray-200 p-6 hover:border-green-500 hover:shadow-lg transition-all group"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-amber-100 rounded-lg">
                <Map className="w-6 h-6 text-amber-600" />
              </div>
              <ArrowRight className="w-5 h-5 text-gray-400 group-hover:text-green-600 transition-colors" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              View Map
            </h3>
            <p className="text-gray-600 text-sm">
              See all neighborhoods on an interactive map
            </p>
          </Link>
        </div>

        {/* My Neighborhoods Section */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <Home className="w-6 h-6 text-gray-600" />
              <h2 className="text-2xl font-semibold text-gray-900">
                My Neighborhoods
              </h2>
            </div>
            <Link
              href="/neighborhoods/browse"
              className="text-green-600 hover:text-green-700 text-sm font-medium"
            >
              View All
            </Link>
          </div>

          {myNeighborhoods.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {myNeighborhoods.map((neighborhood) => (
                <Link
                  key={neighborhood.id}
                  href={`/neighborhoods/${neighborhood.id}`}
                  className="border border-gray-200 rounded-lg p-4 hover:border-green-500 hover:shadow-md transition-all"
                >
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="font-semibold text-gray-900">
                      {neighborhood.name}
                    </h3>
                    <span
                      className={`px-2 py-1 rounded text-xs font-medium ${
                        neighborhood.type === 'AREA'
                          ? 'bg-blue-100 text-blue-800'
                          : neighborhood.type === 'ESTATE'
                          ? 'bg-green-100 text-green-800'
                          : 'bg-amber-100 text-amber-800'
                      }`}
                    >
                      {neighborhood.type}
                    </span>
                  </div>
                  <div className="flex items-center gap-4 text-sm text-gray-600 mt-3">
                    {neighborhood.lga && (
                      <div className="flex items-center gap-1">
                        <MapPin className="w-4 h-4" />
                        <span>{neighborhood.lga.name}</span>
                      </div>
                    )}
                    {neighborhood.memberCount !== undefined && (
                      <div className="flex items-center gap-1">
                        <Users className="w-4 h-4" />
                        <span>{neighborhood.memberCount}</span>
                      </div>
                    )}
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <MapPin className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600 mb-4">
                You haven't created any neighborhoods yet
              </p>
              <Link
                href="/neighborhoods/create"
                className="inline-flex items-center gap-2 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                <Plus className="w-5 h-5" />
                Create Your First Neighborhood
              </Link>
            </div>
          )}
        </div>

        {/* User Info Section */}
        {user && (
          <div className="mt-6 bg-white rounded-lg border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Your Profile
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-gray-600">Name</p>
                <p className="font-medium text-gray-900 mt-1">
                  {user.firstName} {user.lastName}
                </p>
              </div>
              <div>
                <p className="text-gray-600">Email</p>
                <p className="font-medium text-gray-900 mt-1">{user.email}</p>
              </div>
              {user.phoneNumber && (
                <div>
                  <p className="text-gray-600">Phone</p>
                  <p className="font-medium text-gray-900 mt-1">
                    {user.phoneNumber}
                  </p>
                </div>
              )}
              <div>
                <p className="text-gray-600">Verification Status</p>
                <p className="font-medium text-gray-900 mt-1">
                  {user.isVerified ? (
                    <span className="text-green-600">Verified</span>
                  ) : (
                    <span className="text-amber-600">Pending</span>
                  )}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

