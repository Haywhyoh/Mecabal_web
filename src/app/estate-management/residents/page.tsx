'use client';

import React, { useState, useEffect } from 'react';
import { Home, Search, Phone, Mail } from 'lucide-react';
import { apiClient } from '@/lib/api';

export default function ResidentsPage() {
  const [residents, setResidents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [estateId, setEstateId] = useState<string | null>(null);

  useEffect(() => {
    // TODO: Fetch residents from estate
    // This would need an endpoint to get estate members
    const fetchResidents = async () => {
      if (!estateId) return;
      try {
        setLoading(true);
        // Placeholder - would need actual API endpoint
        setResidents([]);
      } catch (error) {
        console.error('Error fetching residents:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchResidents();
  }, [estateId]);

  const filteredResidents = residents.filter((resident) =>
    `${resident.firstName} ${resident.lastName}`.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-900 mb-6">Resident Directory</h1>

      {/* Search */}
      <div className="bg-white rounded-lg shadow p-4 mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Search residents..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
          />
        </div>
      </div>

      {/* Residents Grid */}
      <div className="bg-white rounded-lg shadow">
        {loading ? (
          <div className="p-8 text-center">
            <div className="w-12 h-12 border-4 border-green-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-600">Loading residents...</p>
          </div>
        ) : filteredResidents.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            <Home className="w-12 h-12 mx-auto mb-4 text-gray-400" />
            <p>No residents found</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-6">
            {filteredResidents.map((resident) => (
              <div key={resident.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                    <span className="text-green-600 font-semibold">
                      {resident.firstName?.[0]}{resident.lastName?.[0]}
                    </span>
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">
                      {resident.firstName} {resident.lastName}
                    </h3>
                    <p className="text-sm text-gray-500">Verified Resident</p>
                  </div>
                </div>
                <div className="space-y-2 text-sm text-gray-600">
                  {resident.phoneNumber && (
                    <div className="flex items-center gap-2">
                      <Phone className="w-4 h-4" />
                      <span>{resident.phoneNumber}</span>
                    </div>
                  )}
                  {resident.email && (
                    <div className="flex items-center gap-2">
                      <Mail className="w-4 h-4" />
                      <span>{resident.email}</span>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

