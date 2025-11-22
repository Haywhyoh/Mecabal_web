'use client';

import React from 'react';
import { Star } from 'lucide-react';

interface StarRatingProps {
  rating?: number | null;
  maxRating?: number;
  size?: 'small' | 'medium' | 'large';
  interactive?: boolean;
  onRatingChange?: (rating: number) => void;
  showLabel?: boolean;
  label?: string;
  showValue?: boolean;
  disabled?: boolean;
  className?: string;
}

const STAR_SIZES = {
  small: 16,
  medium: 20,
  large: 24,
};

export const StarRating: React.FC<StarRatingProps> = ({
  rating = 0,
  maxRating = 5,
  size = 'medium',
  interactive = false,
  onRatingChange,
  showLabel = false,
  label = 'Rating',
  showValue = false,
  disabled = false,
  className = '',
}) => {
  // Ensure rating is a number and within valid range
  const normalizedRating = typeof rating === 'number' && !isNaN(rating) 
    ? Math.max(0, Math.min(rating, maxRating)) 
    : 0;
  
  const starSize = STAR_SIZES[size];

  const handleClick = (starIndex: number) => {
    if (interactive && onRatingChange && !disabled) {
      const newRating = starIndex + 1;
      onRatingChange(newRating);
    }
  };

  const renderStars = () => {
    return Array.from({ length: maxRating }, (_, index) => {
      const isFilled = index < Math.floor(normalizedRating);
      const isHalfFilled = index < normalizedRating && index >= Math.floor(normalizedRating);

      const starProps = {
        key: index,
        size: starSize,
        className: `${
          isFilled || isHalfFilled
            ? 'text-yellow-500 fill-yellow-500'
            : 'text-gray-300 fill-gray-300'
        } ${interactive && !disabled ? 'cursor-pointer hover:opacity-80 transition-opacity' : ''}`,
        ...(interactive && !disabled && {
          onClick: () => handleClick(index),
          role: 'button',
          'aria-label': `Rate ${index + 1} star${index + 1 !== 1 ? 's' : ''}`,
        }),
      };

      return <Star {...starProps} />;
    });
  };

  const getRatingText = () => {
    if (normalizedRating === 0) return 'Not rated';
    if (normalizedRating === 1) return 'Poor';
    if (normalizedRating === 2) return 'Fair';
    if (normalizedRating === 3) return 'Good';
    if (normalizedRating === 4) return 'Very Good';
    if (normalizedRating === 5) return 'Excellent';
    return `${normalizedRating.toFixed(1)} stars`;
  };

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      {showLabel && (
        <div className="flex items-center justify-between w-full mb-1">
          <span className={`text-sm font-medium ${disabled ? 'text-gray-400' : 'text-gray-700'}`}>
            {label}
          </span>
          {interactive && (
            <span className={`text-xs ${disabled ? 'text-gray-400' : 'text-gray-500'}`}>
              {getRatingText()}
            </span>
          )}
        </div>
      )}
      
      <div className="flex items-center gap-1">
        {renderStars()}
        {showValue && (
          <span className="ml-1 text-sm font-semibold text-gray-700">
            {normalizedRating > 0 ? normalizedRating.toFixed(1) : '0.0'}
          </span>
        )}
      </div>
    </div>
  );
};

export default StarRating;

