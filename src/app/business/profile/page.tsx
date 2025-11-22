'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import { apiClient } from '@/lib/api';
import type { BusinessProfile } from '@/types/business';
import StarRating from '@/components/business/StarRating';
import {
  Edit,
  Settings,
  MessageSquare,
  Star,
  BarChart3,
  CheckCircle,
  Clock,
  MapPin,
  Phone,
  Mail,
  Shield,
  Store,
  ToggleLeft,
  ToggleRight,
} from 'lucide-react';

export default function BusinessProfilePage() {
  const router = useRouter();
  const [business, setBusiness] = useState<BusinessProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadBusiness();
  }, []);

  const loadBusiness = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await apiClient.getMyBusiness();
      
      // Handle null business (user has no business profile)
      if (response.success && response.data === null) {
        // No business profile - redirect to registration
        router.push('/business/register');
        return;
      }
      
      if (response.success && response.data) {
        setBusiness(response.data);
      } else {
        // Handle service unavailable (503) - show user-friendly message
        if (response.statusCode === 503) {
          setError('Business service is temporarily unavailable. Please try again in a moment.');
        } else if (response.statusCode === 404) {
          // 404 means no business found - redirect to registration
          router.push('/business/register');
          return;
        } else {
          // Handle other errors
          const errorMessage = response.error || 'Failed to load business profile';
          setError(errorMessage);
          console.error('Error loading business:', errorMessage);
        }
      }
    } catch (err: any) {
      console.error('Error loading business:', err);
      const errorMessage = err.message || 'Failed to load business profile';
      // Check if it's a service unavailable error
      if (errorMessage.includes('unavailable') || errorMessage.includes('Cannot connect')) {
        setError('Business service is temporarily unavailable. Please try again in a moment.');
      } else {
        setError(errorMessage);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleToggleStatus = async () => {
    if (!business || updatingStatus) return;

    const confirmMessage = business.isActive
      ? 'Go offline? Your business will be hidden from neighbor searches.'
      : 'Go online? Your business will be visible to neighbors in your service area.';

    if (!confirm(confirmMessage)) return;

    try {
      setUpdatingStatus(true);
      const response = await apiClient.updateBusinessStatus(business.id, !business.isActive);
      if (response.success && response.data) {
        setBusiness(response.data);
      } else {
        alert(response.error || 'Failed to update status');
      }
    } catch (err: any) {
      console.error('Error updating status:', err);
      alert('Failed to update status. Please try again.');
    } finally {
      setUpdatingStatus(false);
    }
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="w-12 h-12 border-4 border-green-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-600">Loading business profile...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  if (error && !business) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="text-red-600 mb-4">⚠️</div>
            <h2 className="text-xl font-bold text-gray-900 mb-2">Failed to Load</h2>
            <p className="text-gray-600 mb-4">{error}</p>
            <button
              onClick={loadBusiness}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
            >
              Try Again
            </button>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  if (!business) {
    return null;
  }

  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto">
        {/* Cover & Profile Section */}
        <div className="bg-white rounded-lg shadow-sm mb-6 overflow-hidden">
          <div className="h-32 bg-gradient-to-r from-green-500 to-green-600 relative">
            {business.coverImageUrl && (
              <img
                src={business.coverImageUrl}
                alt="Cover"
                className="w-full h-full object-cover"
              />
            )}
          </div>

          <div className="px-6 pb-6">
            <div className="flex items-start gap-6 -mt-12">
              <div className="relative">
                {business.profileImageUrl ? (
                  <img
                    src={business.profileImageUrl}
                    alt={business.businessName}
                    className="w-24 h-24 rounded-lg border-4 border-white object-cover"
                  />
                ) : (
                  <div className="w-24 h-24 rounded-lg border-4 border-white bg-gray-200 flex items-center justify-center">
                    <Store className="w-12 h-12 text-gray-400" />
                  </div>
                )}
              </div>

              <div className="flex-1 pt-4">
                <div className="flex items-center gap-3 mb-2">
                  <h1 className="text-2xl font-bold text-gray-900">{business.businessName}</h1>
                  {business.isVerified && (
                    <div className="flex items-center gap-1 px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs font-medium">
                      <Shield className="w-3 h-3" />
                      Verified
                    </div>
                  )}
                </div>
                <p className="text-gray-600 mb-2">{business.subcategory || business.category}</p>
                <p className="text-sm text-gray-500 mb-3">
                  {business.yearsOfExperience} years experience
                </p>
                <div className="flex items-center gap-4">
                  <StarRating
                    rating={business.rating}
                    size="medium"
                    showValue={true}
                    className="items-center"
                  />
                  <span className="text-gray-500">({business.reviewCount ?? 0} reviews)</span>
                </div>
              </div>

              <Link
                href="/business/profile/edit"
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center gap-2"
              >
                <Edit className="w-4 h-4" />
                Edit
              </Link>
            </div>
          </div>
        </div>

        {/* Status Toggle */}
        <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div
                className={`w-3 h-3 rounded-full ${
                  business.isActive ? 'bg-green-500' : 'bg-gray-400'
                }`}
              />
              <span className="text-gray-700">
                {business.isActive ? 'Available for bookings' : 'Currently offline'}
              </span>
            </div>
            <button
              onClick={handleToggleStatus}
              disabled={updatingStatus}
              className={`px-4 py-2 rounded-lg font-medium flex items-center gap-2 ${
                business.isActive
                  ? 'bg-green-50 text-green-700 border border-green-200'
                  : 'bg-gray-100 text-gray-700 border border-gray-300'
              } disabled:opacity-50`}
            >
              {business.isActive ? (
                <>
                  <ToggleRight className="w-5 h-5" />
                  Go Offline
                </>
              ) : (
                <>
                  <ToggleLeft className="w-5 h-5" />
                  Go Online
                </>
              )}
            </button>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="grid grid-cols-3 gap-6">
            <div className="text-center">
              <CheckCircle className="w-6 h-6 text-green-600 mx-auto mb-2" />
              <p className="text-2xl font-bold text-gray-900">{business.completedJobs}</p>
              <p className="text-sm text-gray-600">Jobs Completed</p>
            </div>
            <div className="text-center border-x">
              <Clock className="w-6 h-6 text-blue-600 mx-auto mb-2" />
              <p className="text-2xl font-bold text-gray-900">
                {business.responseTime || 'N/A'}
              </p>
              <p className="text-sm text-gray-600">Response Time</p>
            </div>
            <div className="text-center">
              <StarRating
                rating={business.rating}
                size="large"
                showValue={true}
                className="justify-center mb-2"
              />
              <p className="text-sm text-gray-600 mt-2">Average Rating</p>
            </div>
          </div>
        </div>

        {/* Business Description */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">About This Business</h2>
          <p className="text-gray-700 mb-4">{business.description || 'No description available'}</p>
          <div className="space-y-2 text-sm">
            {business.serviceArea && (
              <div className="flex items-center gap-2 text-gray-600">
                <MapPin className="w-4 h-4" />
                <span>Service Area: {business.serviceArea.replace('-', ' ')}</span>
              </div>
            )}
            {business.pricingModel && (
              <div className="flex items-center gap-2 text-gray-600">
                <span>💰</span>
                <span>Pricing: {business.pricingModel.replace('-', ' ')}</span>
              </div>
            )}
            {business.availability && (
              <div className="flex items-center gap-2 text-gray-600">
                <Clock className="w-4 h-4" />
                <span>Availability: {business.availability.replace('-', ' ')}</span>
              </div>
            )}
          </div>
        </div>

        {/* Credentials */}
        {business.hasInsurance && (
          <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Credentials & Verification
            </h2>
            <div className="flex items-center gap-2 text-gray-700">
              <Shield className="w-5 h-5 text-blue-600" />
              <span>Business Insurance Coverage</span>
            </div>
          </div>
        )}

        {/* Management Actions */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Manage Your Business</h2>
          <div className="space-y-3">
            <Link
              href="/business/services"
              className="flex items-center gap-3 p-4 border border-gray-200 rounded-lg hover:bg-gray-50"
            >
              <Settings className="w-5 h-5 text-green-600" />
              <div className="flex-1">
                <p className="font-medium text-gray-900">Manage Services</p>
                <p className="text-sm text-gray-600">Add, edit, or remove services</p>
              </div>
            </Link>
            <Link
              href="/business/inquiries"
              className="flex items-center gap-3 p-4 border border-gray-200 rounded-lg hover:bg-gray-50"
            >
              <MessageSquare className="w-5 h-5 text-green-600" />
              <div className="flex-1">
                <p className="font-medium text-gray-900">Customer Inquiries</p>
                <p className="text-sm text-gray-600">View and respond to customer inquiries</p>
              </div>
            </Link>
            <Link
              href="/business/reviews"
              className="flex items-center gap-3 p-4 border border-gray-200 rounded-lg hover:bg-gray-50"
            >
              <Star className="w-5 h-5 text-green-600" />
              <div className="flex-1">
                <p className="font-medium text-gray-900">Reviews & Ratings</p>
                <p className="text-sm text-gray-600">View customer feedback and respond to reviews</p>
              </div>
            </Link>
            <Link
              href="/business/analytics"
              className="flex items-center gap-3 p-4 border border-gray-200 rounded-lg hover:bg-gray-50"
            >
              <BarChart3 className="w-5 h-5 text-green-600" />
              <div className="flex-1">
                <p className="font-medium text-gray-900">Analytics</p>
                <p className="text-sm text-gray-600">View business performance and insights</p>
              </div>
            </Link>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}

