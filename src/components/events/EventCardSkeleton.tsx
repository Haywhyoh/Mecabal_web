'use client';

import React from 'react';

export default function EventCardSkeleton() {
  return (
    <div className="bg-white rounded-lg border border-gray-200 overflow-hidden animate-pulse">
      {/* Cover Image Skeleton */}
      <div className="w-full h-48 bg-gray-200" />

      {/* Content Skeleton */}
      <div className="p-4">
        {/* Title Skeleton */}
        <div className="h-6 bg-gray-200 rounded mb-3 w-3/4" />

        {/* Date & Time Skeleton */}
        <div className="flex items-center gap-2 mb-2">
          <div className="h-4 w-4 bg-gray-200 rounded" />
          <div className="h-4 bg-gray-200 rounded w-24" />
          <div className="h-4 w-4 bg-gray-200 rounded ml-2" />
          <div className="h-4 bg-gray-200 rounded w-20" />
        </div>

        {/* Location Skeleton */}
        <div className="flex items-center gap-2 mb-3">
          <div className="h-4 w-4 bg-gray-200 rounded" />
          <div className="h-4 bg-gray-200 rounded w-32" />
        </div>

        {/* Organizer Skeleton */}
        <div className="flex items-center gap-2 mb-3">
          <div className="w-6 h-6 bg-gray-200 rounded-full" />
          <div className="h-4 bg-gray-200 rounded w-24" />
        </div>

        {/* Footer Skeleton */}
        <div className="flex items-center justify-between pt-3 border-t border-gray-100">
          <div className="h-4 bg-gray-200 rounded w-28" />
          <div className="h-6 bg-gray-200 rounded w-16" />
        </div>
      </div>
    </div>
  );
}

