'use client';

import React, { useState } from 'react';
import { X, Filter, Calendar, Tag } from 'lucide-react';
import { EVENT_CATEGORIES } from '@/types/event';
import type { EventFilterDto } from '@/types/event';

interface EventFiltersProps {
  filters: EventFilterDto;
  onFiltersChange: (filters: EventFilterDto) => void;
  onClear: () => void;
}

export default function EventFilters({ filters, onFiltersChange, onClear }: EventFiltersProps) {
  const [showFilters, setShowFilters] = useState(false);
  const [selectedCategories, setSelectedCategories] = useState<number[]>(
    filters.categoryId ? [filters.categoryId] : []
  );

  const hasActiveFilters = selectedCategories.length > 0 || filters.search || filters.dateFrom || filters.dateTo;

  const handleCategoryToggle = (categoryId: number) => {
    const newCategories = selectedCategories.includes(categoryId)
      ? selectedCategories.filter(id => id !== categoryId)
      : [...selectedCategories, categoryId];
    
    setSelectedCategories(newCategories);
    onFiltersChange({
      ...filters,
      categoryId: newCategories.length > 0 ? newCategories[0] : undefined,
    });
  };

  const handleSearchChange = (search: string) => {
    onFiltersChange({
      ...filters,
      search: search || undefined,
    });
  };

  const handleDateFromChange = (dateFrom: string) => {
    onFiltersChange({
      ...filters,
      dateFrom: dateFrom || undefined,
    });
  };

  const handleDateToChange = (dateTo: string) => {
    onFiltersChange({
      ...filters,
      dateTo: dateTo || undefined,
    });
  };

  const handleClear = () => {
    setSelectedCategories([]);
    onClear();
  };

  return (
    <div className="mb-6">
      {/* Filter Toggle Button */}
      <div className="flex items-center gap-3 mb-4">
        <input
          type="text"
          placeholder="Search events..."
          value={filters.search || ''}
          onChange={(e) => handleSearchChange(e.target.value)}
          className="flex-1 px-4 py-2 bg-white border-2 border-gray-400 rounded-lg text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
        />
        <button
          onClick={() => setShowFilters(!showFilters)}
          className={`px-4 py-2 rounded-lg border-2 transition-colors flex items-center gap-2 font-medium ${
            hasActiveFilters
              ? 'bg-green-600 border-green-600 text-white hover:bg-green-700'
              : 'bg-white border-gray-400 text-gray-900 hover:bg-gray-100 hover:border-gray-500'
          }`}
        >
          <Filter className="w-4 h-4" />
          Filters
          {hasActiveFilters && (
            <span className="ml-1 px-2 py-0.5 bg-green-600 text-white text-xs rounded-full">
              {selectedCategories.length + (filters.dateFrom ? 1 : 0) + (filters.dateTo ? 1 : 0)}
            </span>
          )}
        </button>
        {hasActiveFilters && (
          <button
            onClick={handleClear}
            className="px-4 py-2 text-gray-600 hover:text-gray-900 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Filter Panel */}
      {showFilters && (
        <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
          {/* Categories */}
          <div className="mb-4">
            <div className="flex items-center gap-2 mb-3">
              <Tag className="w-4 h-4 text-gray-600" />
              <h3 className="font-semibold text-gray-900">Categories</h3>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-2">
              {EVENT_CATEGORIES.map((category) => {
                const isSelected = selectedCategories.includes(category.id);
                return (
                  <button
                    key={category.id}
                    onClick={() => handleCategoryToggle(category.id)}
                    className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors border ${
                      isSelected
                        ? 'text-white border-transparent'
                        : 'bg-white border-gray-200 text-gray-700 hover:border-gray-300'
                    }`}
                    style={
                      isSelected
                        ? { backgroundColor: category.colorCode }
                        : undefined
                    }
                  >
                    {category.name}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Date Range */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Calendar className="w-4 h-4 text-gray-600" />
              <h3 className="font-semibold text-gray-900">Date Range</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  From Date
                </label>
                <input
                  type="date"
                  value={filters.dateFrom || ''}
                  onChange={(e) => handleDateFromChange(e.target.value)}
                  className="w-full px-3 py-2 bg-white border-2 border-gray-400 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  To Date
                </label>
                <input
                  type="date"
                  value={filters.dateTo || ''}
                  onChange={(e) => handleDateToChange(e.target.value)}
                  min={filters.dateFrom}
                  className="w-full px-3 py-2 bg-white border-2 border-gray-400 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
                />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

