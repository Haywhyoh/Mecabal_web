'use client';

import React from 'react';
import { Star, Reply } from 'lucide-react';
import type { BusinessReview } from '@/types/business';

interface ReviewCardProps {
  review: BusinessReview;
  onRespond?: (review: BusinessReview) => void;
  showRespondButton?: boolean;
}

export default function ReviewCard({ review, onRespond, showRespondButton = false }: ReviewCardProps) {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }).map((_, index) => (
      <Star
        key={index}
        className={`w-4 h-4 ${
          index < rating
            ? 'text-yellow-500 fill-yellow-500'
            : 'text-gray-300'
        }`}
      />
    ));
  };

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4">
      <div className="flex items-start gap-4 mb-3">
        <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center flex-shrink-0">
          {review.userAvatar ? (
            <img
              src={review.userAvatar}
              alt={review.userName || 'User'}
              className="w-10 h-10 rounded-full object-cover"
            />
          ) : (
            <span className="text-lg font-semibold text-gray-600">
              {(review.userName || 'U').charAt(0).toUpperCase()}
            </span>
          )}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-1">
            <p className="font-medium text-gray-900">{review.userName || 'Anonymous'}</p>
            <span className="text-sm text-gray-500">{formatDate(review.createdAt)}</span>
          </div>
          <div className="flex items-center gap-2 mb-2">
            <div className="flex items-center gap-1">
              {renderStars(review.rating)}
            </div>
            {review.serviceType && (
              <span className="text-xs text-gray-500">• {review.serviceType}</span>
            )}
          </div>
        </div>
      </div>

      <p className="text-sm text-gray-700 mb-3">{review.comment}</p>

      {review.response && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-3 mb-3">
          <div className="flex items-center gap-2 mb-1">
            <Reply className="w-4 h-4 text-green-600" />
            <span className="text-xs font-medium text-green-800">Business Response</span>
          </div>
          <p className="text-sm text-gray-700">{review.response}</p>
        </div>
      )}

      {showRespondButton && !review.response && onRespond && (
        <button
          onClick={() => onRespond(review)}
          className="text-sm text-green-600 hover:text-green-700 font-medium flex items-center gap-1"
        >
          <Reply className="w-4 h-4" />
          Respond to review
        </button>
      )}
    </div>
  );
}

