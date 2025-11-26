'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Plus, List, Calendar as CalendarIcon, Map, RefreshCw } from 'lucide-react';
import Link from 'next/link';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import EventCard from '@/components/events/EventCard';
import EventCardSkeleton from '@/components/events/EventCardSkeleton';
import EventFilters from '@/components/events/EventFilters';
import { apiClient } from '@/lib/api';
import type { Event, EventFilterDto, PaginatedResponse } from '@/types/event';

type ViewMode = 'list' | 'calendar' | 'map';
type QuickFilter = 'upcoming' | 'this_weekend' | 'this_month' | 'my_events';

export default function EventsPage() {
  const [events, setEvents] = useState<Event[]>([]);
  const [featuredEvents, setFeaturedEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>('list');
  const [quickFilter, setQuickFilter] = useState<QuickFilter>('upcoming');
  const [filters, setFilters] = useState<EventFilterDto>({
    page: 1,
    limit: 20,
  });
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 0,
    hasNext: false,
    hasPrev: false,
  });
  const [refreshing, setRefreshing] = useState(false);

  const fetchEvents = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const baseFilters = { ...filters };

      // Apply quick filter date ranges
      const now = new Date();
      switch (quickFilter) {
        case 'upcoming':
          baseFilters.dateFrom = now.toISOString().split('T')[0];
          break;
        case 'this_weekend':
          const saturday = new Date(now);
          saturday.setDate(now.getDate() + (6 - now.getDay()));
          const sunday = new Date(saturday);
          sunday.setDate(saturday.getDate() + 1);
          baseFilters.dateFrom = saturday.toISOString().split('T')[0];
          baseFilters.dateTo = sunday.toISOString().split('T')[0];
          break;
        case 'this_month':
          const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
          const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);
          baseFilters.dateFrom = startOfMonth.toISOString().split('T')[0];
          baseFilters.dateTo = endOfMonth.toISOString().split('T')[0];
          break;
        case 'my_events':
          const myEventsResponse = await apiClient.getMyEvents('all', baseFilters);
          if (myEventsResponse.success && myEventsResponse.data) {
            const data = myEventsResponse.data as any;
            if (data.data) {
              setEvents(data.data);
              setPagination(data.meta || pagination);
            } else {
              setEvents(Array.isArray(data) ? data : []);
            }
          }
          setLoading(false);
          return;
      }

      const response = await apiClient.getEvents(baseFilters);
      if (response.success && response.data) {
        const data = response.data as any;
        if (data.data && data.meta) {
          // Paginated response
          setEvents(data.data);
          setPagination(data.meta);
        } else if (Array.isArray(data)) {
          // Array response
          setEvents(data);
        } else {
          setEvents([]);
        }
      } else {
        setError(response.error || 'Failed to fetch events');
        setEvents([]);
      }
    } catch (err) {
      console.error('Error fetching events:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch events');
      setEvents([]);
    } finally {
      setLoading(false);
    }
  }, [filters, quickFilter]);

  const fetchFeaturedEvents = useCallback(async () => {
    try {
      const response = await apiClient.getFeaturedEvents(5);
      if (response.success && response.data) {
        setFeaturedEvents(Array.isArray(response.data) ? response.data : []);
      }
    } catch (err) {
      console.error('Error fetching featured events:', err);
    }
  }, []);

  useEffect(() => {
    fetchEvents();
  }, [fetchEvents]);

  useEffect(() => {
    fetchFeaturedEvents();
  }, [fetchFeaturedEvents]);

  const handleFiltersChange = (newFilters: EventFilterDto) => {
    setFilters(newFilters);
  };

  const handleClearFilters = () => {
    setFilters({
      page: 1,
      limit: 20,
    });
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await Promise.all([fetchEvents(), fetchFeaturedEvents()]);
    setRefreshing(false);
  };

  const handleLoadMore = async () => {
    if (!pagination.hasNext || loading) return;

    const newFilters = {
      ...filters,
      page: pagination.page + 1,
    };
    setFilters(newFilters);

    try {
      const response = await apiClient.getEvents(newFilters);
      if (response.success && response.data) {
        const data = response.data as any;
        if (data.data && data.meta) {
          setEvents((prev) => [...prev, ...data.data]);
          setPagination(data.meta);
        }
      }
    } catch (err) {
      console.error('Error loading more events:', err);
    }
  };

  return (
    <DashboardLayout>
      <div className="w-full">
        {/* Header */}
        <div className="sticky top-0 z-10 bg-white border-b border-gray-200 px-4 py-4">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Events</h1>
              <p className="text-sm text-gray-600 mt-1">
                Discover and join community events
              </p>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={handleRefresh}
                disabled={refreshing}
                className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
                title="Refresh"
              >
                <RefreshCw className={`w-5 h-5 ${refreshing ? 'animate-spin' : ''}`} />
              </button>
              <Link
                href="/events/create"
                className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                <Plus className="w-5 h-5" />
                <span className="hidden sm:inline">Create Event</span>
              </Link>
            </div>
          </div>

          {/* Quick Filters */}
          <div className="flex items-center gap-2 mb-4 overflow-x-auto pb-2">
            {(['upcoming', 'this_weekend', 'this_month', 'my_events'] as QuickFilter[]).map((filter) => (
              <button
                key={filter}
                onClick={() => setQuickFilter(filter)}
                className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
                  quickFilter === filter
                    ? 'bg-green-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {filter === 'upcoming'
                  ? 'Upcoming'
                  : filter === 'this_weekend'
                  ? 'This Weekend'
                  : filter === 'this_month'
                  ? 'This Month'
                  : 'My Events'}
              </button>
            ))}
          </div>

          {/* View Mode Toggle */}
          <div className="flex items-center gap-2">
            <div className="flex items-center bg-gray-100 rounded-lg p-1">
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 rounded transition-colors ${
                  viewMode === 'list'
                    ? 'bg-white text-green-600 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
                title="List view"
              >
                <List className="w-5 h-5" />
              </button>
              <button
                onClick={() => setViewMode('calendar')}
                className={`p-2 rounded transition-colors ${
                  viewMode === 'calendar'
                    ? 'bg-white text-green-600 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
                title="Calendar view"
              >
                <CalendarIcon className="w-5 h-5" />
              </button>
              <button
                onClick={() => setViewMode('map')}
                className={`p-2 rounded transition-colors ${
                  viewMode === 'map'
                    ? 'bg-white text-green-600 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
                title="Map view"
              >
                <Map className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="px-4 pt-4">
          <EventFilters
            filters={filters}
            onFiltersChange={handleFiltersChange}
            onClear={handleClearFilters}
          />
        </div>

        {/* Featured Events */}
        {featuredEvents.length > 0 && quickFilter !== 'my_events' && (
          <div className="px-4 mb-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-3">Featured Events</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {featuredEvents.map((event) => (
                <EventCard key={event.id} event={event} />
              ))}
            </div>
          </div>
        )}

        {/* Content */}
        <div className="px-4 pb-8">
          {loading && events.length === 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <EventCardSkeleton key={i} />
              ))}
            </div>
          ) : error ? (
            <div className="text-center py-12">
              <p className="text-red-600 mb-4">{error}</p>
              <button
                onClick={fetchEvents}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                Try Again
              </button>
            </div>
          ) : events.length === 0 ? (
            <div className="text-center py-12">
              <CalendarIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No Events Found</h3>
              <p className="text-gray-600 mb-4">
                {quickFilter === 'my_events'
                  ? "You haven't joined any events yet"
                  : 'No events match your filters'}
              </p>
              <Link
                href="/events/create"
                className="inline-flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                <Plus className="w-5 h-5" />
                Create Event
              </Link>
            </div>
          ) : viewMode === 'list' ? (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {events.map((event) => (
                  <EventCard key={event.id} event={event} />
                ))}
              </div>
              {pagination.hasNext && (
                <div className="text-center mt-8">
                  <button
                    onClick={handleLoadMore}
                    disabled={loading}
                    className="px-6 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors disabled:opacity-50"
                  >
                    {loading ? 'Loading...' : 'Load More'}
                  </button>
                </div>
              )}
            </>
          ) : viewMode === 'calendar' ? (
            <div className="text-center py-12">
              <CalendarIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">Calendar view coming soon</p>
            </div>
          ) : (
            <div className="text-center py-12">
              <Map className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">Map view coming soon</p>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}

