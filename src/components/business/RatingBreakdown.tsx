'use client';

import React from 'react';
import { Star } from 'lucide-react';

export interface ReviewStats {
  averageRating: number;
  totalReviews: number;
  ratingBreakdown: {
    5: number;
    4: number;
    3: number;
    2: number;
    1: number;
  };
  averageServiceQuality?: number;
  averageProfessionalism?: number;
  averageValueForMoney?: number;
}

interface RatingBreakdownProps {
  stats: ReviewStats;
  selectedRating?: number;
  onRatingFilter?: (rating: number | undefined) => void;
  className?: string;
}

export const RatingBreakdown: React.FC<RatingBreakdownProps> = ({
  stats,
  selectedRating,
  onRatingFilter,
  className = '',
}) => {
  const renderStars = (rating: number, size: number = 16) => {
    return Array.from({ length: 5 }, (_, index) => (
      <Star
        key={index}
        size={size}
        className={`${
          index < rating ? 'text-yellow-500 fill-yellow-500' : 'text-gray-300 fill-gray-300'
        }`}
      />
    ));
  };

  const renderRatingBar = (rating: number) => {
    const count = stats.ratingBreakdown[rating as keyof typeof stats.ratingBreakdown];
    const percentage = stats.totalReviews > 0
      ? (count / stats.totalReviews) * 100
      : 0;

    const isSelected = selectedRating === rating;

    return (
      <button
        key={rating}
        onClick={() => onRatingFilter?.(isSelected ? undefined : rating)}
        className={`
          flex items-center gap-3 p-2 rounded-lg transition-colors
          ${isSelected ? 'bg-green-50 border border-green-200' : 'hover:bg-gray-50'}
          ${onRatingFilter ? 'cursor-pointer' : 'cursor-default'}
        `}
        disabled={!onRatingFilter}
      >
        <div className="flex items-center gap-1 w-12">
          <span className="text-sm font-semibold text-gray-700">{rating}</span>
          <Star size={14} className="text-yellow-500 fill-yellow-500" />
        </div>
        
        <div className="flex-1">
          <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
            <div
              className="h-full bg-yellow-500 transition-all duration-300"
              style={{ width: `${percentage}%` }}
            />
          </div>
        </div>
        
        <div className="w-8 text-right">
          <span className={`text-sm font-medium ${
            isSelected ? 'text-green-700' : 'text-gray-600'
          }`}>
            {count}
          </span>
        </div>
      </button>
    );
  };

  const renderOverallRating = () => {
    const roundedRating = Math.round(stats.averageRating * 10) / 10;
    
    return (
      <div className="text-center py-6 border-b border-gray-200 mb-6">
        <div className="flex items-baseline justify-center gap-1 mb-2">
          <span className="text-5xl font-bold text-gray-900">{roundedRating}</span>
          <span className="text-xl text-gray-500">/5</span>
        </div>
        
        <div className="flex items-center justify-center gap-1 mb-2">
          {renderStars(Math.round(stats.averageRating), 20)}
        </div>
        
        <p className="text-sm text-gray-600">
          Based on {stats.totalReviews} review{stats.totalReviews !== 1 ? 's' : ''}
        </p>
      </div>
    );
  };

  const renderDetailedAverages = () => {
    const averages = [
      { label: 'Service Quality', value: stats.averageServiceQuality },
      { label: 'Professionalism', value: stats.averageProfessionalism },
      { label: 'Value for Money', value: stats.averageValueForMoney },
    ].filter(avg => avg.value && avg.value > 0);

    if (averages.length === 0) return null;

    return (
      <div className="border-t border-gray-200 pt-6 mt-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Detailed Averages</h3>
        {averages.map((avg, index) => (
          <div key={index} className="flex items-center justify-between py-2">
            <span className="text-sm text-gray-600">{avg.label}</span>
            <div className="flex items-center gap-2">
              <span className="text-sm font-semibold text-gray-700">
                {avg.value!.toFixed(1)}
              </span>
              <div className="flex items-center gap-0.5">
                {renderStars(Math.round(avg.value!), 12)}
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className={`bg-white rounded-lg p-6 ${className}`}>
      {/* Overall Rating */}
      {renderOverallRating()}

      {/* Rating Breakdown */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Rating Breakdown</h3>
          {selectedRating && onRatingFilter && (
            <button
              onClick={() => onRatingFilter(undefined)}
              className="px-3 py-1 text-sm font-medium text-green-700 bg-green-50 rounded-lg hover:bg-green-100 transition-colors"
            >
              Clear Filter
            </button>
          )}
        </div>
        
        <div className="space-y-2">
          {[5, 4, 3, 2, 1].map(renderRatingBar)}
        </div>
      </div>

      {/* Detailed Averages */}
      {renderDetailedAverages()}
    </div>
  );
};

export default RatingBreakdown;

