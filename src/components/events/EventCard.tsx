'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Calendar, MapPin, Users, Clock, CheckCircle2 } from 'lucide-react';
import type { Event } from '@/types/event';

interface EventCardProps {
  event: Event;
  onPress?: (event: Event) => void;
}

export default function EventCard({ event, onPress }: EventCardProps) {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
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

  const getCategoryColor = () => {
    return event.category?.colorCode || '#4CAF50';
  };

  const handleClick = () => {
    if (onPress) {
      onPress(event);
    }
  };

  // Get cover image - use coverImageUrl or first image from media
  const getCoverImage = () => {
    if (event.coverImageUrl) {
      return event.coverImageUrl;
    }
    // Use first image from media array if available
    if (event.media && event.media.length > 0) {
      const firstImage = event.media.find(m => m.type === 'image');
      return firstImage?.url;
    }
    return null;
  };

  const coverImage = getCoverImage();

  return (
    <Link
      href={`/events/${event.id}`}
      onClick={handleClick}
      className="block bg-white rounded-lg border border-gray-200 hover:border-green-500 hover:shadow-lg transition-all duration-200 overflow-hidden"
    >
      {/* Cover Image */}
      {coverImage ? (
        <div className="relative w-full h-48 bg-gray-100">
          <Image
            src={coverImage}
            alt={event.title}
            fill
            className="object-cover"
            unoptimized
          />
          {/* Category Badge Overlay */}
          <div
            className="absolute top-3 left-3 px-3 py-1 rounded-full text-white text-xs font-semibold flex items-center gap-1"
            style={{ backgroundColor: getCategoryColor() }}
          >
            {event.category?.name || 'Event'}
          </div>
          {/* Price Badge */}
          {!event.isFree && event.price && (
            <div className="absolute top-3 right-3 px-3 py-1 bg-white rounded-full text-sm font-semibold text-gray-900">
              ₦{event.price.toLocaleString()}
            </div>
          )}
          {event.isFree && (
            <div className="absolute top-3 right-3 px-3 py-1 bg-green-500 rounded-full text-sm font-semibold text-white">
              Free
            </div>
          )}
        </div>
      ) : (
        <div
          className="w-full h-48 flex items-center justify-center"
          style={{ backgroundColor: getCategoryColor() }}
        >
          <div className="text-white text-center">
            <Calendar className="w-12 h-12 mx-auto mb-2 opacity-80" />
            <p className="text-sm font-medium opacity-80">{event.category?.name || 'Event'}</p>
          </div>
        </div>
      )}

      {/* Content */}
      <div className="p-4">
        {/* Title */}
        <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-2">
          {event.title}
        </h3>

        {/* Date & Time */}
        <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
          <Calendar className="w-4 h-4" />
          <span>{formatDate(event.eventDate)}</span>
          <Clock className="w-4 h-4 ml-2" />
          <span>{formatTime(event.startTime)}</span>
        </div>

        {/* Location */}
        <div className="flex items-center gap-2 text-sm text-gray-600 mb-3">
          <MapPin className="w-4 h-4 flex-shrink-0" />
          <span className="line-clamp-1">{event.location.name}</span>
        </div>

        {/* Organizer */}
        <div className="flex items-center gap-2 mb-3">
          {event.organizer.profilePictureUrl ? (
            <Image
              src={event.organizer.profilePictureUrl}
              alt={event.organizer.fullName}
              width={24}
              height={24}
              className="rounded-full"
              unoptimized
            />
          ) : (
            <div className="w-6 h-6 bg-green-600 rounded-full flex items-center justify-center">
              <span className="text-white text-xs font-semibold">
                {event.organizer.firstName[0]}
                {event.organizer.lastName[0]}
              </span>
            </div>
          )}
          <span className="text-sm text-gray-700 flex-1 truncate">
            {event.organizer.fullName}
          </span>
          {event.organizer.isVerified && (
            <CheckCircle2 className="w-4 h-4 text-blue-600 flex-shrink-0" />
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between pt-3 border-t border-gray-100">
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Users className="w-4 h-4" />
            <span>
              {event.attendeesCount} {event.attendeesCount === 1 ? 'attendee' : 'attendees'}
            </span>
            {event.maxAttendees && (
              <span className="text-gray-400">/ {event.maxAttendees} max</span>
            )}
          </div>
          {event.userRsvpStatus && (
            <span
              className={`px-2 py-1 rounded-full text-xs font-medium ${
                event.userRsvpStatus === 'going'
                  ? 'bg-green-100 text-green-700'
                  : event.userRsvpStatus === 'maybe'
                  ? 'bg-yellow-100 text-yellow-700'
                  : 'bg-gray-100 text-gray-700'
              }`}
            >
              {event.userRsvpStatus === 'going'
                ? 'Going'
                : event.userRsvpStatus === 'maybe'
                ? 'Maybe'
                : "Can't Go"}
            </span>
          )}
        </div>
      </div>
    </Link>
  );
}

