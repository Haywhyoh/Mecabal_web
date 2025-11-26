'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import { ArrowLeft, Search, CheckCircle2, Users } from 'lucide-react';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import { apiClient } from '@/lib/api';
import type { EventAttendee, PaginatedResponse } from '@/types/event';

export default function EventAttendeesPage() {
  const params = useParams();
  const router = useRouter();
  const eventId = params.id as string;

  const [attendees, setAttendees] = useState<EventAttendee[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [rsvpFilter, setRsvpFilter] = useState<'going' | 'maybe' | 'not_going' | 'all'>('all');
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 0,
    hasNext: false,
    hasPrev: false,
  });

  useEffect(() => {
    if (eventId) {
      fetchAttendees();
    }
  }, [eventId, rsvpFilter, searchQuery]);

  const fetchAttendees = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await apiClient.getEventAttendees(eventId, {
        page: pagination.page,
        limit: pagination.limit,
        rsvpStatus: rsvpFilter !== 'all' ? rsvpFilter : undefined,
        search: searchQuery || undefined,
      });

      if (response.success && response.data) {
        const data = response.data as any;
        if (data.data && data.meta) {
          setAttendees(data.data);
          setPagination(data.meta);
        } else if (Array.isArray(data)) {
          setAttendees(data);
        } else {
          setAttendees([]);
        }
      } else {
        setError(response.error || 'Failed to fetch attendees');
        setAttendees([]);
      }
    } catch (err) {
      console.error('Error fetching attendees:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch attendees');
      setAttendees([]);
    } finally {
      setLoading(false);
    }
  };

  const getRsvpStatusColor = (status: string) => {
    switch (status) {
      case 'going':
        return 'bg-green-100 text-green-700';
      case 'maybe':
        return 'bg-yellow-100 text-yellow-700';
      case 'not_going':
        return 'bg-gray-100 text-gray-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  const getRsvpStatusLabel = (status: string) => {
    switch (status) {
      case 'going':
        return 'Going';
      case 'maybe':
        return 'Maybe';
      case 'not_going':
        return "Can't Go";
      default:
        return status;
    }
  };

  return (
    <DashboardLayout>
      <div className="w-full max-w-4xl mx-auto">
        {/* Header */}
        <div className="sticky top-0 z-10 bg-white border-b border-gray-200 px-4 py-4">
          <div className="flex items-center gap-4 mb-4">
            <button
              onClick={() => router.back()}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div className="flex-1">
              <h1 className="text-xl font-bold text-gray-900">Event Attendees</h1>
              <p className="text-sm text-gray-600">{pagination.total} total</p>
            </div>
          </div>

          {/* Search and Filters */}
          <div className="flex items-center gap-3">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search attendees..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
              />
            </div>
            <select
              value={rsvpFilter}
              onChange={(e) => setRsvpFilter(e.target.value as any)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
            >
              <option value="all">All Status</option>
              <option value="going">Going</option>
              <option value="maybe">Maybe</option>
              <option value="not_going">Can't Go</option>
            </select>
          </div>
        </div>

        {/* Content */}
        <div className="p-4">
          {loading && attendees.length === 0 ? (
            <div className="space-y-4">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="animate-pulse flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
                  <div className="w-12 h-12 bg-gray-200 rounded-full" />
                  <div className="flex-1">
                    <div className="h-4 bg-gray-200 rounded w-32 mb-2" />
                    <div className="h-3 bg-gray-200 rounded w-24" />
                  </div>
                </div>
              ))}
            </div>
          ) : error ? (
            <div className="text-center py-12">
              <p className="text-red-600 mb-4">{error}</p>
              <button
                onClick={fetchAttendees}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                Try Again
              </button>
            </div>
          ) : attendees.length === 0 ? (
            <div className="text-center py-12">
              <Users className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No Attendees Found</h3>
              <p className="text-gray-600">
                {searchQuery || rsvpFilter !== 'all'
                  ? 'No attendees match your filters'
                  : 'No one has RSVPed to this event yet'}
              </p>
            </div>
          ) : (
            <>
              <div className="space-y-3">
                {attendees.map((attendee) => (
                  <div
                    key={attendee.id}
                    className="flex items-center gap-4 p-4 bg-white border border-gray-200 rounded-lg hover:shadow-md transition-shadow"
                  >
                    {attendee.user.profilePictureUrl ? (
                      <Image
                        src={attendee.user.profilePictureUrl}
                        alt={attendee.user.fullName}
                        width={48}
                        height={48}
                        className="rounded-full"
                        unoptimized
                      />
                    ) : (
                      <div className="w-12 h-12 bg-green-600 rounded-full flex items-center justify-center">
                        <span className="text-white font-semibold">
                          {attendee.user.firstName[0]}
                          {attendee.user.lastName[0]}
                        </span>
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold text-gray-900 truncate">
                          {attendee.user.fullName}
                        </h3>
                        {attendee.user.isVerified && (
                          <CheckCircle2 className="w-4 h-4 text-blue-600 flex-shrink-0" />
                        )}
                      </div>
                      <p className="text-sm text-gray-600">
                        Trust Score: {attendee.user.trustScore}
                      </p>
                      {attendee.guestsCount > 0 && (
                        <p className="text-xs text-gray-500 mt-1">
                          Bringing {attendee.guestsCount} guest{attendee.guestsCount !== 1 ? 's' : ''}
                        </p>
                      )}
                    </div>
                    <div className="flex flex-col items-end gap-2">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-medium ${getRsvpStatusColor(
                          attendee.rsvpStatus
                        )}`}
                      >
                        {getRsvpStatusLabel(attendee.rsvpStatus)}
                      </span>
                      {attendee.checkedIn && (
                        <span className="text-xs text-green-600 font-medium">Checked In</span>
                      )}
                      <span className="text-xs text-gray-500">
                        {new Date(attendee.rsvpAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                ))}
              </div>

              {/* Pagination */}
              {pagination.totalPages > 1 && (
                <div className="flex items-center justify-center gap-2 mt-6">
                  <button
                    onClick={() => {
                      setPagination((prev) => ({ ...prev, page: prev.page - 1 }));
                      fetchAttendees();
                    }}
                    disabled={!pagination.hasPrev}
                    className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Previous
                  </button>
                  <span className="text-gray-600">
                    Page {pagination.page} of {pagination.totalPages}
                  </span>
                  <button
                    onClick={() => {
                      setPagination((prev) => ({ ...prev, page: prev.page + 1 }));
                      fetchAttendees();
                    }}
                    disabled={!pagination.hasNext}
                    className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Next
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}

