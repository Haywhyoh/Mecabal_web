'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import ReviewCard from '@/components/business/ReviewCard';
import { apiClient } from '@/lib/api';
import type { BusinessProfile, BusinessReview } from '@/types/business';
import { Star } from 'lucide-react';

export default function BusinessReviewsPage() {
  const router = useRouter();
  const [business, setBusiness] = useState<BusinessProfile | null>(null);
  const [reviews, setReviews] = useState<BusinessReview[]>([]);
  const [stats, setStats] = useState<{
    averageRating: number;
    totalReviews: number;
    ratingDistribution: { 5: number; 4: number; 3: number; 2: number; 1: number };
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedRating, setSelectedRating] = useState<number | null>(null);

  useEffect(() => {
    loadData();
  }, [selectedRating]);

  const loadData = async () => {
    try {
      setLoading(true);
      const businessResponse = await apiClient.getMyBusiness();
      if (businessResponse.success && businessResponse.data) {
        setBusiness(businessResponse.data);
        const [reviewsResponse, statsResponse] = await Promise.all([
          apiClient.getBusinessReviews(businessResponse.data.id, {
            rating: selectedRating || undefined,
            limit: 50,
          }),
          apiClient.getReviewStats(businessResponse.data.id),
        ]);

        if (reviewsResponse.success && reviewsResponse.data) {
          setReviews(reviewsResponse.data.reviews || []);
        }
        if (statsResponse.success && statsResponse.data) {
          setStats(statsResponse.data);
        }
      } else {
        router.push('/business/register');
      }
    } catch (error: any) {
      console.error('Error loading data:', error);
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

  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto p-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">Reviews & Ratings</h1>

        {/* Stats */}
        {stats && (
          <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <Star className="w-8 h-8 text-yellow-500 fill-yellow-500" />
                  <span className="text-3xl font-bold text-gray-900">
                    {stats.averageRating.toFixed(1)}
                  </span>
                </div>
                <p className="text-gray-600">{stats.totalReviews} reviews</p>
              </div>
            </div>

            {/* Rating Distribution */}
            <div className="space-y-2">
              {[5, 4, 3, 2, 1].map((rating) => {
                const count = stats.ratingDistribution[rating as keyof typeof stats.ratingDistribution];
                const percentage = stats.totalReviews > 0 ? (count / stats.totalReviews) * 100 : 0;
                return (
                  <div key={rating} className="flex items-center gap-2">
                    <span className="text-sm text-gray-600 w-8">{rating} star</span>
                    <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-yellow-500"
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                    <span className="text-sm text-gray-600 w-12 text-right">{count}</span>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Filter */}
        <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-600">Filter by rating:</span>
            <button
              onClick={() => setSelectedRating(null)}
              className={`px-3 py-1 rounded-lg text-sm ${
                selectedRating === null
                  ? 'bg-green-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              All
            </button>
            {[5, 4, 3, 2, 1].map((rating) => (
              <button
                key={rating}
                onClick={() => setSelectedRating(rating)}
                className={`px-3 py-1 rounded-lg text-sm flex items-center gap-1 ${
                  selectedRating === rating
                    ? 'bg-green-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                <Star className="w-4 h-4" />
                {rating}
              </button>
            ))}
          </div>
        </div>

        {/* Reviews List */}
        {reviews.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm p-12 text-center">
            <p className="text-gray-600">No reviews found</p>
          </div>
        ) : (
          <div className="space-y-4">
            {reviews.map((review) => (
              <ReviewCard key={review.id} review={review} showRespondButton={false} />
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}

