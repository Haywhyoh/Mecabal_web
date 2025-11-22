'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import { apiClient } from '@/lib/api';
import ServiceCard from '@/components/business/ServiceCard';
import ReviewCard from '@/components/business/ReviewCard';
import type { BusinessProfile, BusinessService, BusinessReview } from '@/types/business';
import { Phone, MessageSquare, MapPin, Star, ArrowLeft } from 'lucide-react';

export default function BusinessDetailPage() {
  const params = useParams();
  const router = useRouter();
  const businessId = params.id as string;

  const [business, setBusiness] = useState<BusinessProfile | null>(null);
  const [services, setServices] = useState<BusinessService[]>([]);
  const [reviews, setReviews] = useState<BusinessReview[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (businessId) {
      loadBusinessData();
    }
  }, [businessId]);

  const loadBusinessData = async () => {
    try {
      setLoading(true);
      const [businessResponse, servicesResponse, reviewsResponse] = await Promise.all([
        apiClient.getBusinessById(businessId),
        apiClient.getBusinessServices(businessId),
        apiClient.getBusinessReviews(businessId, { limit: 10 }),
      ]);

      if (businessResponse.success && businessResponse.data) {
        setBusiness(businessResponse.data);
      }
      if (servicesResponse.success && servicesResponse.data) {
        setServices(servicesResponse.data);
      }
      if (reviewsResponse.success && reviewsResponse.data) {
        setReviews(reviewsResponse.data.reviews || []);
      }
    } catch (error: any) {
      console.error('Error loading business data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="w-12 h-12 border-4 border-green-600 border-t-transparent rounded-full animate-spin"></div>
        </div>
      </DashboardLayout>
    );
  }

  if (!business) {
    return (
      <DashboardLayout>
        <div className="text-center py-12">
          <p className="text-gray-600">Business not found</p>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto">
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6"
        >
          <ArrowLeft className="w-5 h-5" />
          Back
        </button>

        {/* Business Header */}
        <div className="bg-white rounded-lg shadow-sm mb-6 overflow-hidden">
          <div className="h-48 bg-gradient-to-r from-green-500 to-green-600 relative">
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
                    <span className="text-2xl font-bold text-gray-400">
                      {business.businessName.charAt(0).toUpperCase()}
                    </span>
                  </div>
                )}
              </div>

              <div className="flex-1 pt-4">
                <h1 className="text-2xl font-bold text-gray-900 mb-2">{business.businessName}</h1>
                <p className="text-gray-600 mb-3">{business.subcategory || business.category}</p>
                <div className="flex items-center gap-4 mb-4">
                  <div className="flex items-center gap-1">
                    <Star className="w-5 h-5 text-yellow-500 fill-yellow-500" />
                    <span className="font-semibold">{business.rating.toFixed(1)}</span>
                    <span className="text-gray-500">({business.reviewCount} reviews)</span>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  {business.phoneNumber && (
                    <a
                      href={`tel:${business.phoneNumber}`}
                      className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                    >
                      <Phone className="w-4 h-4" />
                      Call
                    </a>
                  )}
                  {business.whatsappNumber && (
                    <a
                      href={`https://wa.me/${business.whatsappNumber.replace(/[^0-9]/g, '')}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600"
                    >
                      <MessageSquare className="w-4 h-4" />
                      WhatsApp
                    </a>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Business Description */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">About</h2>
          <p className="text-gray-700 mb-4">{business.description || 'No description available'}</p>
          <div className="space-y-2 text-sm text-gray-600">
            {business.businessAddress && (
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4" />
                <span>{business.businessAddress}</span>
              </div>
            )}
          </div>
        </div>

        {/* Services */}
        {services.length > 0 && (
          <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Services Offered</h2>
            <div className="space-y-4">
              {services.map((service) => (
                <ServiceCard key={service.id} service={service} showActions={false} />
              ))}
            </div>
          </div>
        )}

        {/* Reviews */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Reviews</h2>
          {reviews.length === 0 ? (
            <p className="text-gray-600">No reviews yet</p>
          ) : (
            <div className="space-y-4">
              {reviews.map((review) => (
                <ReviewCard key={review.id} review={review} />
              ))}
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}

