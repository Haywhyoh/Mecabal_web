'use client';

import React from 'react';
import Link from 'next/link';
import { MapPin, CheckCircle, Clock } from 'lucide-react';
import StarRating from '@/components/business/StarRating';
import type { BusinessProfile } from '@/types/business';

interface BusinessCardProps {
  business: BusinessProfile;
  showDetails?: boolean;
}

export default function BusinessCard({ business, showDetails = true }: BusinessCardProps) {
  return (
    <Link href={`/business/${business.id}`}>
      <div className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer">
        <div className="flex items-start gap-4">
          {/* Business Image */}
          <div className="flex-shrink-0">
            {business.profileImageUrl ? (
              <img
                src={business.profileImageUrl}
                alt={business.businessName}
                className="w-16 h-16 rounded-lg object-cover"
              />
            ) : (
              <div className="w-16 h-16 rounded-lg bg-gray-200 flex items-center justify-center">
                <span className="text-2xl font-bold text-gray-400">
                  {business.businessName.charAt(0).toUpperCase()}
                </span>
              </div>
            )}
          </div>

          {/* Business Info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="text-lg font-semibold text-gray-900 truncate">
                    {business.businessName}
                  </h3>
                  {business.isVerified && (
                    <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
                  )}
                </div>
                <p className="text-sm text-gray-600 mb-2">{business.category}</p>
              </div>
            </div>

            {showDetails && (
              <>
                {business.description && (
                  <p className="text-sm text-gray-700 mb-3 line-clamp-2">
                    {business.description}
                  </p>
                )}

                <div className="flex items-center gap-4 text-sm text-gray-600">
                  <StarRating
                    rating={business.rating}
                    size="small"
                    showValue={true}
                    className="items-center"
                  />
                  <span className="text-gray-600">({business.reviewCount ?? 0})</span>
                  {business.serviceArea && (
                    <div className="flex items-center gap-1">
                      <MapPin className="w-4 h-4" />
                      <span className="capitalize">{business.serviceArea.replace('-', ' ')}</span>
                    </div>
                  )}
                  {business.completedJobs > 0 && (
                    <div className="flex items-center gap-1">
                      <CheckCircle className="w-4 h-4 text-green-600" />
                      <span>{business.completedJobs} jobs</span>
                    </div>
                  )}
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
}

