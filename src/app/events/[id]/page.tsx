'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import {
  ArrowLeft,
  Calendar,
  Clock,
  MapPin,
  Users,
  Share2,
  Phone,
  MessageCircle,
  CheckCircle2,
  ExternalLink,
} from 'lucide-react';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import RSVPButton from '@/components/events/RSVPButton';
import { apiClient } from '@/lib/api';
import type { Event } from '@/types/event';
import { useAuthStore } from '@/store/authStore';

export default function EventDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuthStore();
  const eventId = params.id as string;

  const [event, setEvent] = useState<Event | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (eventId) {
      fetchEvent();
    }
  }, [eventId]);

  const fetchEvent = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await apiClient.getEventById(eventId);
      if (response.success && response.data) {
        setEvent(response.data as Event);
        // Increment views (fire and forget)
        apiClient.incrementEventViews(eventId).catch(() => {});
      } else {
        setError(response.error || 'Event not found');
      }
    } catch (err) {
      console.error('Error fetching event:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch event');
    } finally {
      setLoading(false);
    }
  };

  const handleRsvp = async (status: 'going' | 'maybe' | 'not_going') => {
    if (!event) return;

    try {
      const response = await apiClient.rsvpEvent(eventId, { rsvpStatus: status });
      if (response.success) {
        // Refresh event data
        await fetchEvent();
      } else {
        throw new Error(response.error || 'Failed to update RSVP');
      }
    } catch (err) {
      console.error('Error updating RSVP:', err);
      alert(err instanceof Error ? err.message : 'Failed to update RSVP');
      throw err;
    }
  };

  const handleShare = async () => {
    if (!event) return;

    const eventUrl = `${window.location.origin}/events/${event.id}`;
    const shareText = `Check out this event: ${event.title}\n\n${event.description}\n\n📅 ${formatDate(event.eventDate)} at ${formatTime(event.startTime)}\n📍 ${event.location.name}`;

    if (navigator.share) {
      try {
        await navigator.share({
          title: event.title,
          text: shareText,
          url: eventUrl,
        });
      } catch (err) {
        // User cancelled or error occurred
        console.log('Share cancelled or failed');
      }
    } else {
      // Fallback: copy to clipboard
      await navigator.clipboard.writeText(`${shareText}\n\n${eventUrl}`);
      alert('Event link copied to clipboard!');
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const formatTime = (timeString: string) => {
    const [hours, minutes] = timeString.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour % 12 || 12;
    return `${displayHour}:${minutes} ${ampm}`;
  };

  const getDirectionsUrl = () => {
    if (!event) return '';
    const { latitude, longitude } = event.location;
    return `https://www.google.com/maps/dir/?api=1&destination=${latitude},${longitude}`;
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="w-full max-w-4xl mx-auto p-4">
          <div className="animate-pulse space-y-4">
            <div className="h-64 bg-gray-200 rounded-lg" />
            <div className="h-8 bg-gray-200 rounded w-3/4" />
            <div className="h-4 bg-gray-200 rounded w-full" />
          </div>
        </div>
      </DashboardLayout>
    );
  }

  if (error || !event) {
    return (
      <DashboardLayout>
        <div className="w-full max-w-4xl mx-auto p-4">
          <div className="text-center py-12">
            <p className="text-red-600 mb-4">{error || 'Event not found'}</p>
            <button
              onClick={() => router.push('/events')}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              Back to Events
            </button>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  const isOwner = user?.id === event.organizer.id;
  const category = event.category;

  return (
    <DashboardLayout>
      <div className="w-full max-w-4xl mx-auto">
        {/* Header */}
        <div className="sticky top-0 z-10 bg-white border-b border-gray-200 px-4 py-4">
          <div className="flex items-center gap-4">
            <button
              onClick={() => router.back()}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div className="flex-1">
              <h1 className="text-xl font-bold text-gray-900">Event Details</h1>
            </div>
            <div className="flex items-center gap-2">
              {isOwner && (
                <Link
                  href={`/events/${eventId}/edit`}
                  className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  Edit
                </Link>
              )}
              <button
                onClick={handleShare}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                title="Share event"
              >
                <Share2 className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-4 space-y-6">
          {/* Cover Image */}
          {event.coverImageUrl ? (
            <div className="relative w-full h-64 md:h-96 rounded-lg overflow-hidden">
              <Image
                src={event.coverImageUrl}
                alt={event.title}
                fill
                className="object-cover"
                unoptimized
              />
              <div
                className="absolute top-4 left-4 px-3 py-1 rounded-full text-white text-sm font-semibold"
                style={{ backgroundColor: category.colorCode }}
              >
                {category.name}
              </div>
            </div>
          ) : (
            <div
              className="w-full h-64 md:h-96 rounded-lg flex items-center justify-center text-white"
              style={{ backgroundColor: category.colorCode }}
            >
              <div className="text-center">
                <Calendar className="w-16 h-16 mx-auto mb-2 opacity-80" />
                <p className="text-lg font-medium opacity-80">{category.name}</p>
              </div>
            </div>
          )}

          {/* Title and Price */}
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <h2 className="text-3xl font-bold text-gray-900 mb-2">{event.title}</h2>
              <div className="flex items-center gap-2 text-gray-600">
                <span>by</span>
                <Link
                  href={`/profile/${event.organizer.id}`}
                  className="font-semibold text-gray-900 hover:text-green-600 transition-colors"
                >
                  {event.organizer.fullName}
                </Link>
                {event.organizer.isVerified && (
                  <CheckCircle2 className="w-4 h-4 text-blue-600" />
                )}
              </div>
            </div>
            <div className="text-right">
              {event.isFree ? (
                <span className="px-4 py-2 bg-green-100 text-green-700 rounded-lg font-semibold">
                  Free
                </span>
              ) : (
                <span className="px-4 py-2 bg-yellow-100 text-yellow-700 rounded-lg font-semibold">
                  ₦{event.price?.toLocaleString()}
                </span>
              )}
            </div>
          </div>

          {/* Date & Time */}
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <Calendar className="w-5 h-5 text-green-600 mt-1 flex-shrink-0" />
              <div>
                <p className="font-semibold text-gray-900">{formatDate(event.eventDate)}</p>
                <div className="flex items-center gap-2 text-gray-600 mt-1">
                  <Clock className="w-4 h-4" />
                  <span>
                    {formatTime(event.startTime)}
                    {event.endTime && ` - ${formatTime(event.endTime)}`}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Location */}
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <MapPin className="w-5 h-5 text-green-600 mt-1 flex-shrink-0" />
              <div className="flex-1">
                <p className="font-semibold text-gray-900">{event.location.name}</p>
                <p className="text-gray-600 mt-1">{event.location.address}</p>
                {event.location.landmark && (
                  <p className="text-sm text-gray-500 mt-1">Near {event.location.landmark}</p>
                )}
                <a
                  href={getDirectionsUrl()}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 mt-2 text-green-600 hover:text-green-700 transition-colors"
                >
                  <ExternalLink className="w-4 h-4" />
                  Get Directions
                </a>
              </div>
            </div>
          </div>

          {/* Description */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">About this event</h3>
            <p className="text-gray-700 whitespace-pre-wrap">{event.description}</p>
          </div>

          {/* Requirements */}
          {(event.requireVerification || event.ageRestriction || event.languages.length > 0) && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Requirements</h3>
              <ul className="space-y-2">
                {event.requireVerification && (
                  <li className="flex items-center gap-2 text-gray-700">
                    <CheckCircle2 className="w-4 h-4 text-blue-600" />
                    <span>Verification required</span>
                  </li>
                )}
                {event.ageRestriction && (
                  <li className="flex items-center gap-2 text-gray-700">
                    <Users className="w-4 h-4 text-blue-600" />
                    <span>{event.ageRestriction}</span>
                  </li>
                )}
                {event.languages.length > 0 && (
                  <li className="flex items-center gap-2 text-gray-700">
                    <span className="text-blue-600">🌐</span>
                    <span>Languages: {event.languages.join(', ')}</span>
                  </li>
                )}
              </ul>
            </div>
          )}

          {/* Attendees */}
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-lg font-semibold text-gray-900">
                Attendees ({event.attendeesCount})
              </h3>
              {event.maxAttendees && (
                <span className="text-sm text-gray-600">
                  {event.maxAttendees - event.attendeesCount} spots remaining
                </span>
              )}
            </div>
            <Link
              href={`/events/${eventId}/attendees`}
              className="text-green-600 hover:text-green-700 font-medium"
            >
              View all attendees →
            </Link>
          </div>

          {/* RSVP Section */}
          {!isOwner && (
            <div className="bg-white border-2 border-gray-200 rounded-lg p-6">
              <RSVPButton
                eventId={eventId}
                currentStatus={event.userRsvpStatus}
                isAtCapacity={event.isAtCapacity}
                canRsvp={event.canRsvp}
                onRsvpChange={handleRsvp}
              />
            </div>
          )}

          {/* Organizer Contact */}
          {!isOwner && (
            <div className="bg-gray-50 rounded-lg p-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Contact Organizer</h3>
              <div className="flex items-center gap-3">
                {event.organizer.profilePictureUrl ? (
                  <Image
                    src={event.organizer.profilePictureUrl}
                    alt={event.organizer.fullName}
                    width={48}
                    height={48}
                    className="rounded-full"
                    unoptimized
                  />
                ) : (
                  <div className="w-12 h-12 bg-green-600 rounded-full flex items-center justify-center">
                    <span className="text-white font-semibold">
                      {event.organizer.firstName[0]}
                      {event.organizer.lastName[0]}
                    </span>
                  </div>
                )}
                <div className="flex-1">
                  <p className="font-semibold text-gray-900">{event.organizer.fullName}</p>
                  <p className="text-sm text-gray-600">Trust Score: {event.organizer.trustScore}</p>
                </div>
                <div className="flex items-center gap-2">
                  {event.organizer.phoneNumber && (
                    <a
                      href={`tel:${event.organizer.phoneNumber}`}
                      className="p-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                      title="Call organizer"
                    >
                      <Phone className="w-5 h-5 text-gray-700" />
                    </a>
                  )}
                  <Link
                    href={`/messages?userId=${event.organizer.id}`}
                    className="p-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                    title="Message organizer"
                  >
                    <MessageCircle className="w-5 h-5 text-gray-700" />
                  </Link>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}

