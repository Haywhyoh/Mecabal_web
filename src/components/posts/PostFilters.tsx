'use client';

import React from 'react';
import { Filter, X } from 'lucide-react';
import type { PostType, PrivacyLevel, PostFilter } from '@/types/social';

interface PostFiltersProps {
  filters: PostFilter;
  onFiltersChange: (filters: PostFilter) => void;
  categories?: Array<{ id: number; name: string }>;
}

export default function PostFilters({
  filters,
  onFiltersChange,
  categories = [],
}: PostFiltersProps) {
  // Ensure categories is always an array
  const safeCategories = Array.isArray(categories) ? categories : [];

  const hasActiveFilters =
    filters.postType ||
    filters.privacyLevel ||
    filters.categoryId ||
    filters.search ||
    filters.helpCategory ||
    filters.urgency;

  const updateFilter = (key: keyof PostFilter, value: any) => {
    onFiltersChange({
      ...filters,
      [key]: value,
      page: 1, // Reset to first page when filters change
    });
  };

  const clearFilters = () => {
    onFiltersChange({
      page: 1,
      limit: 20,
      sortBy: 'createdAt',
      sortOrder: 'DESC',
      isApproved: true,
    });
  };

  return (
    <div className="bg-white border-b border-gray-200 px-4 py-3">
      <div className="flex items-center gap-4 flex-wrap">
        {/* Filter Icon */}
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-gray-500" />
          <span className="text-sm font-medium text-gray-700">Filters:</span>
        </div>

        {/* Post Type Filter */}
        <select
          value={filters.postType || ''}
          onChange={(e) => updateFilter('postType', e.target.value || undefined)}
          className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm text-gray-900 bg-white focus:ring-2 focus:ring-green-600 focus:border-green-600"
        >
          <option value="">All Types</option>
          {(['general', 'event', 'alert', 'marketplace', 'lost_found', 'help'] as PostType[]).map((type) => (
            <option key={type} value={type}>
              {type.charAt(0).toUpperCase() + type.slice(1).replace('_', ' ')}
            </option>
          ))}
        </select>

        {/* Privacy Level Filter */}
        <select
          value={filters.privacyLevel || ''}
          onChange={(e) => updateFilter('privacyLevel', e.target.value || undefined)}
          className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm text-gray-900 bg-white focus:ring-2 focus:ring-green-600 focus:border-green-600"
        >
          <option value="">All Privacy Levels</option>
          {(['neighborhood', 'group', 'public'] as PrivacyLevel[]).map((level) => (
            <option key={level} value={level}>
              {level.charAt(0).toUpperCase() + level.slice(1)}
            </option>
          ))}
        </select>

        {/* Category Filter */}
        {safeCategories.length > 0 && (
          <select
            value={filters.categoryId || ''}
            onChange={(e) => updateFilter('categoryId', e.target.value ? parseInt(e.target.value) : undefined)}
            className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm text-gray-900 bg-white focus:ring-2 focus:ring-green-600 focus:border-green-600"
          >
            <option value="">All Categories</option>
            {safeCategories.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.name}
              </option>
            ))}
          </select>
        )}

        {/* Sort By */}
        <select
          value={`${filters.sortBy || 'createdAt'}-${filters.sortOrder || 'DESC'}`}
          onChange={(e) => {
            const [sortBy, sortOrder] = e.target.value.split('-');
            updateFilter('sortBy', sortBy);
            updateFilter('sortOrder', sortOrder);
          }}
          className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm text-gray-900 bg-white focus:ring-2 focus:ring-green-600 focus:border-green-600"
        >
          <option value="createdAt-DESC">Newest First</option>
          <option value="createdAt-ASC">Oldest First</option>
          <option value="updatedAt-DESC">Recently Updated</option>
          <option value="title-ASC">Title (A-Z)</option>
        </select>

        {/* Clear Filters */}
        {hasActiveFilters && (
          <button
            onClick={clearFilters}
            className="flex items-center gap-1 px-3 py-1.5 text-sm text-gray-600 hover:text-gray-900 transition-colors"
          >
            <X className="w-4 h-4" />
            Clear Filters
          </button>
        )}
      </div>
    </div>
  );
}

