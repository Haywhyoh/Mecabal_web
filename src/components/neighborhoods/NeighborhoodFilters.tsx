'use client';

import { useState } from 'react';
import { Search } from 'lucide-react';

export interface NeighborhoodFilters {
  type?: 'AREA' | 'ESTATE' | 'COMMUNITY' | 'ALL';
  isGated?: boolean;
  search?: string;
  sortBy?: 'name' | 'created' | 'members';
}

interface NeighborhoodFiltersProps {
  onFilterChange: (filters: NeighborhoodFilters) => void;
  currentFilters: NeighborhoodFilters;
}

export default function NeighborhoodFiltersComponent({
  onFilterChange,
  currentFilters,
}: NeighborhoodFiltersProps) {
  const [localSearch, setLocalSearch] = useState(currentFilters.search || '');

  const handleTypeChange = (type: string) => {
    onFilterChange({ ...currentFilters, type: type as any });
  };

  const handleGatedChange = (checked: boolean) => {
    onFilterChange({ ...currentFilters, isGated: checked ? true : undefined });
  };

  const handleSearchChange = (value: string) => {
    setLocalSearch(value);
    // Debounce search
    const timeoutId = setTimeout(() => {
      onFilterChange({ ...currentFilters, search: value || undefined });
    }, 300);
    return () => clearTimeout(timeoutId);
  };

  const handleSortChange = (sortBy: string) => {
    onFilterChange({ ...currentFilters, sortBy: sortBy as any });
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4 space-y-6">
      <div>
        <h3 className="font-semibold text-gray-900 mb-3">Filters</h3>

        {/* Search */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Search
          </label>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              value={localSearch}
              onChange={(e) => handleSearchChange(e.target.value)}
              placeholder="Search neighborhoods..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-600 focus:border-transparent outline-none text-gray-900"
            />
          </div>
        </div>

        {/* Type Filter */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Type
          </label>
          <div className="space-y-2">
            {['ALL', 'AREA', 'ESTATE', 'COMMUNITY'].map((type) => (
              <label key={type} className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="type"
                  value={type}
                  checked={currentFilters.type === type || (type === 'ALL' && !currentFilters.type)}
                  onChange={() => handleTypeChange(type)}
                  className="w-4 h-4 text-green-600"
                />
                <span className="text-sm text-gray-700">
                  {type.charAt(0) + type.slice(1).toLowerCase()}
                </span>
              </label>
            ))}
          </div>
        </div>

        {/* Gated Filter */}
        <div className="mb-4">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={currentFilters.isGated === true}
              onChange={(e) => handleGatedChange(e.target.checked)}
              className="w-4 h-4 text-green-600 rounded"
            />
            <span className="text-sm text-gray-700">Gated communities only</span>
          </label>
        </div>

        {/* Sort By */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Sort By
          </label>
          <select
            value={currentFilters.sortBy || 'name'}
            onChange={(e) => handleSortChange(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-600 focus:border-transparent outline-none text-gray-900"
          >
            <option value="name">Name (A-Z)</option>
            <option value="created">Recently Created</option>
            <option value="members">Most Members</option>
          </select>
        </div>
      </div>

      {/* Clear Filters */}
      <button
        onClick={() => {
          setLocalSearch('');
          onFilterChange({ type: 'ALL', sortBy: 'name' });
        }}
        className="w-full px-4 py-2 text-sm text-gray-600 hover:text-gray-900 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
      >
        Clear All Filters
      </button>
    </div>
  );
}
