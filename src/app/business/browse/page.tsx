'use client';

import React, { useState, useEffect } from 'react';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import BusinessCard from '@/components/business/BusinessCard';
import { apiClient } from '@/lib/api';
import type { BusinessProfile, BusinessFilter } from '@/types/business';
import { Search, Filter } from 'lucide-react';

export default function BusinessBrowsePage() {
  const [businesses, setBusinesses] = useState<BusinessProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filter, setFilter] = useState<BusinessFilter>({
    page: 1,
    limit: 20,
  });

  useEffect(() => {
    loadBusinesses();
  }, [searchQuery, filter]);

  const loadBusinesses = async () => {
    try {
      setLoading(true);
      const searchFilter: BusinessFilter = {
        ...filter,
        search: searchQuery || undefined,
      };
      const response = await apiClient.searchBusinesses(searchFilter);
      if (response.success && response.data) {
        setBusinesses(response.data.data || []);
      }
    } catch (error: any) {
      console.error('Error loading businesses:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="max-w-6xl mx-auto p-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">Browse Businesses</h1>

        {/* Search Bar */}
        <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
          <div className="flex items-center gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search services..."
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
              />
            </div>
            <button className="px-4 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center gap-2">
              <Filter className="w-5 h-5" />
              Filters
            </button>
          </div>
        </div>

        {/* Results */}
        {loading ? (
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="w-12 h-12 border-4 border-green-600 border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : businesses.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm p-12 text-center">
            <p className="text-gray-600">No businesses found</p>
            <p className="text-sm text-gray-500 mt-2">Try adjusting your search or filters</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {businesses.map((business) => (
              <BusinessCard key={business.id} business={business} />
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}

