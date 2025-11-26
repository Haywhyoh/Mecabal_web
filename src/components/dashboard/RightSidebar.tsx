'use client';

import React from 'react';
import { Search, TrendingUp, MapPin, Users, Bell, Plus } from 'lucide-react';
import Link from 'next/link';

export default function RightSidebar() {
  const trendingTopics = [
    { topic: 'Community Meeting', count: '12.5k' },
    { topic: 'Security Update', count: '8.2k' },
    { topic: 'New Park Opening', count: '5.1k' },
    { topic: 'Neighborhood Cleanup', count: '3.8k' },
  ];

  const suggestedNeighborhoods = [
    { name: 'Victoria Island Estate', members: 234, type: 'ESTATE' },
    { name: 'Lekki Phase 1', members: 189, type: 'AREA' },
    { name: 'Ikoyi Community', members: 156, type: 'COMMUNITY' },
  ];

  return (
    <aside className="hidden xl:block w-80 h-screen overflow-y-auto border-l border-gray-200 bg-white">
      <div className="p-4 space-y-6">
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search Mecabal"
            className="w-full pl-10 pr-4 py-3 bg-gray-100 rounded-full border-none text-gray-900 focus:outline-none focus:ring-2 focus:ring-green-500 focus:bg-white"
          />
        </div>

        {/* Quick Actions */}
        <div className="bg-gray-50 rounded-2xl p-4">
          <h3 className="font-semibold text-gray-900 mb-3">Quick Actions</h3>
          <div className="space-y-2">
            <Link
              href="/neighborhoods/create"
              className="flex items-center gap-3 p-3 bg-white rounded-lg hover:bg-gray-100 transition-colors"
            >
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                <Plus className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <p className="font-medium text-gray-900">Create Neighborhood</p>
                <p className="text-xs text-gray-500">Add a new area</p>
              </div>
            </Link>
            <Link
              href="/neighborhoods/browse"
              className="flex items-center gap-3 p-3 bg-white rounded-lg hover:bg-gray-100 transition-colors"
            >
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <MapPin className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="font-medium text-gray-900">Browse Neighborhoods</p>
                <p className="text-xs text-gray-500">Explore areas</p>
              </div>
            </Link>
          </div>
        </div>

        {/* Trending Topics */}
        <div className="bg-gray-50 rounded-2xl p-4">
          <div className="flex items-center gap-2 mb-3">
            <TrendingUp className="w-5 h-5 text-green-600" />
            <h3 className="font-semibold text-gray-900">Trending in your area</h3>
          </div>
          <div className="space-y-3">
            {trendingTopics.map((item, index) => (
              <button
                key={index}
                className="w-full text-left hover:bg-white rounded-lg p-2 transition-colors"
              >
                <p className="font-medium text-gray-900">{item.topic}</p>
                <p className="text-xs text-gray-500">{item.count} posts</p>
              </button>
            ))}
          </div>
        </div>

        {/* Suggested Neighborhoods */}
        <div className="bg-gray-50 rounded-2xl p-4">
          <div className="flex items-center gap-2 mb-3">
            <Users className="w-5 h-5 text-green-600" />
            <h3 className="font-semibold text-gray-900">Suggested Neighborhoods</h3>
          </div>
          <div className="space-y-3">
            {suggestedNeighborhoods.map((neighborhood, index) => (
              <Link
                key={index}
                href={`/neighborhoods/${neighborhood.name.toLowerCase().replace(/\s+/g, '-')}`}
                className="block hover:bg-white rounded-lg p-3 transition-colors"
              >
                <div className="flex items-start justify-between mb-1">
                  <p className="font-medium text-gray-900">{neighborhood.name}</p>
                  <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded">
                    {neighborhood.type}
                  </span>
                </div>
                <div className="flex items-center gap-1 text-xs text-gray-500">
                  <Users className="w-3 h-3" />
                  <span>{neighborhood.members} members</span>
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* Notifications Placeholder */}
        <div className="bg-gray-50 rounded-2xl p-4">
          <div className="flex items-center gap-2 mb-3">
            <Bell className="w-5 h-5 text-green-600" />
            <h3 className="font-semibold text-gray-900">Notifications</h3>
          </div>
          <p className="text-sm text-gray-500">
            You're all caught up! No new notifications.
          </p>
        </div>
      </div>
    </aside>
  );
}

