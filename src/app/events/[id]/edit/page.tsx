'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, Loader2, AlertCircle } from 'lucide-react';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import MediaUpload, { type MediaFile } from '@/components/posts/MediaUpload';
import { apiClient } from '@/lib/api';
import { EVENT_CATEGORIES } from '@/types/event';
import type { Event, UpdateEventDto } from '@/types/event';
import { useAuthStore } from '@/store/authStore';

export default function EditEventPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuthStore();
  const eventId = params.id as string;

  const [event, setEvent] = useState<Event | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [mediaFiles, setMediaFiles] = useState<MediaFile[]>([]);
  const [uploadedMedia, setUploadedMedia] = useState<Array<{ url: string; type: 'image' | 'video'; caption?: string }>>([]);

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    categoryId: 0,
    eventDate: '',
    startTime: '',
    endTime: '',
    locationName: '',
    locationAddress: '',
    landmark: '',
    isFree: true,
    price: '',
    maxAttendees: '',
    allowGuests: true,
    requireVerification: false,
    ageRestriction: '',
    languages: ['English'],
    isPrivate: false,
    specialRequirements: '',
  });

  useEffect(() => {
    if (eventId) {
      fetchEvent();
    }
  }, [eventId]);

  const fetchEvent = async () => {
    try {
      setLoading(true);
      const response = await apiClient.getEventById(eventId);
      if (response.success && response.data) {
        const eventData = response.data as Event;
        setEvent(eventData);

        // Check if user is owner
        if (user?.id !== eventData.organizer.id) {
          setError('You do not have permission to edit this event');
          return;
        }

        // Pre-fill form
        const addressParts = eventData.location.address.split(',');
        setFormData({
          title: eventData.title,
          description: eventData.description,
          categoryId: eventData.category.id,
          eventDate: eventData.eventDate,
          startTime: eventData.startTime,
          endTime: eventData.endTime || '',
          locationName: eventData.location.name,
          locationAddress: addressParts[0] || eventData.location.address,
          landmark: eventData.location.landmark || '',
          isFree: eventData.isFree,
          price: eventData.price?.toString() || '',
          maxAttendees: eventData.maxAttendees?.toString() || '',
          allowGuests: eventData.allowGuests,
          requireVerification: eventData.requireVerification,
          ageRestriction: eventData.ageRestriction || '',
          languages: eventData.languages,
          isPrivate: eventData.isPrivate,
          specialRequirements: eventData.specialRequirements || '',
        });

        // Load existing media
        if (eventData.media && eventData.media.length > 0) {
          setUploadedMedia(eventData.media.map((m) => ({
            url: m.url,
            type: m.type,
            caption: m.caption,
          })));
        }
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

  const uploadMediaFiles = async (): Promise<Array<{ url: string; type: 'image' | 'video'; caption?: string }>> => {
    if (mediaFiles.length === 0) {
      return [];
    }

    try {
      setUploading(true);
      const files = mediaFiles.map((mf) => mf.file);
      
      const response = await apiClient.uploadMedia(files, {
        quality: 'high',
        maxWidth: 1920,
        maxHeight: 1920,
      });

      if (response.success) {
        const uploaded = response.data?.media || (response as any).media || response.data?.files || [];
        
        if (!Array.isArray(uploaded) || uploaded.length === 0) {
          throw new Error('No media files returned from upload');
        }
        
        const mediaArray = uploaded.map((file: any) => ({
          url: file.url,
          type: file.type,
        }));
        return mediaArray;
      } else {
        const errorMsg = response.error || 'Failed to upload media';
        throw new Error(errorMsg);
      }
    } catch (err) {
      console.error('Error uploading media:', err);
      throw err;
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!event) return;

    setSubmitting(true);
    setError(null);

    try {
      // Upload new media first
      let newMedia: Array<{ url: string; type: 'image' | 'video'; caption?: string }> = [];
      
      if (mediaFiles.length > 0) {
        try {
          newMedia = await uploadMediaFiles();
        } catch (uploadError) {
          console.error('Media upload failed, continuing without new media:', uploadError);
          setError('Media upload failed. Event will be updated without new images.');
          newMedia = [];
        }
      }
      
      // Combine existing and new media
      const allMedia = [...uploadedMedia, ...newMedia];

      const updateData: UpdateEventDto = {
        title: formData.title,
        description: formData.description,
        categoryId: formData.categoryId,
        eventDate: formData.eventDate,
        startTime: formData.startTime,
        endTime: formData.endTime || undefined,
        location: {
          name: formData.locationName,
          address: formData.locationAddress,
          latitude: event.location.latitude,
          longitude: event.location.longitude,
          landmark: formData.landmark || undefined,
        },
        isFree: formData.isFree,
        price: formData.isFree ? undefined : parseFloat(formData.price),
        maxAttendees: formData.maxAttendees ? parseInt(formData.maxAttendees) : undefined,
        allowGuests: formData.allowGuests,
        requireVerification: formData.requireVerification,
        ageRestriction: formData.ageRestriction || undefined,
        languages: formData.languages,
        isPrivate: formData.isPrivate,
        media: allMedia.length > 0 ? allMedia.map((m, index) => ({
          url: m.url,
          type: m.type,
          caption: m.caption,
          displayOrder: index,
        })) : undefined,
        specialRequirements: formData.specialRequirements || undefined,
      };

      const response = await apiClient.updateEvent(eventId, updateData);
      if (response.success) {
        router.push(`/events/${eventId}`);
      } else {
        throw new Error(response.error || 'Failed to update event');
      }
    } catch (err) {
      console.error('Error updating event:', err);
      setError(err instanceof Error ? err.message : 'Failed to update event');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="w-full max-w-3xl mx-auto p-4">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-gray-200 rounded w-1/2" />
            <div className="h-64 bg-gray-200 rounded" />
          </div>
        </div>
      </DashboardLayout>
    );
  }

  if (error || !event) {
    return (
      <DashboardLayout>
        <div className="w-full max-w-3xl mx-auto p-4">
          <div className="text-center py-12">
            <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
            <p className="text-red-600 mb-4">{error || 'Event not found'}</p>
            <button
              onClick={() => router.push(`/events/${eventId}`)}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              Back to Event
            </button>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="w-full max-w-3xl mx-auto">
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
              <h1 className="text-xl font-bold text-gray-900">Edit Event</h1>
            </div>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-4 space-y-6">
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700">
              {error}
            </div>
          )}

          {/* Basic Info */}
          <div className="space-y-4">
            <h2 className="text-xl font-bold text-gray-900">Event Details</h2>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Event Title *
              </label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="w-full px-4 py-2 bg-white border-2 border-gray-400 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
                required
                maxLength={100}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Description *
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full px-4 py-2 bg-white border-2 border-gray-400 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
                rows={4}
                required
                maxLength={500}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Category *
              </label>
              <select
                value={formData.categoryId}
                onChange={(e) => setFormData({ ...formData, categoryId: parseInt(e.target.value) })}
                className="w-full px-4 py-2 bg-white border-2 border-gray-400 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
                required
              >
                <option value={0}>Select category</option>
                {EVENT_CATEGORIES.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Event Images
              </label>
              <MediaUpload
                maxFiles={10}
                maxFileSize={10}
                onMediaChange={setMediaFiles}
                existingMedia={uploadedMedia}
                onRemoveExisting={(index) => {
                  setUploadedMedia((prev) => prev.filter((_, i) => i !== index));
                }}
              />
            </div>
          </div>

          {/* Date & Time */}
          <div className="space-y-4">
            <h2 className="text-xl font-bold text-gray-900">Date & Time</h2>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Date *</label>
              <input
                type="date"
                value={formData.eventDate}
                onChange={(e) => setFormData({ ...formData, eventDate: e.target.value })}
                className="w-full px-4 py-2 bg-white border-2 border-gray-400 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
                required
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Start Time *</label>
                <input
                  type="time"
                  value={formData.startTime}
                  onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                  className="w-full px-4 py-2 bg-white border-2 border-gray-400 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">End Time</label>
                <input
                  type="time"
                  value={formData.endTime}
                  onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
                  className="w-full px-4 py-2 bg-white border-2 border-gray-400 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
                />
              </div>
            </div>
          </div>

          {/* Location */}
          <div className="space-y-4">
            <h2 className="text-xl font-bold text-gray-900">Location</h2>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Venue Name *</label>
              <input
                type="text"
                value={formData.locationName}
                onChange={(e) => setFormData({ ...formData, locationName: e.target.value })}
                className="w-full px-4 py-2 bg-white border-2 border-gray-400 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Address *</label>
              <input
                type="text"
                value={formData.locationAddress}
                onChange={(e) => setFormData({ ...formData, locationAddress: e.target.value })}
                className="w-full px-4 py-2 bg-white border-2 border-gray-400 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Landmark</label>
              <input
                type="text"
                value={formData.landmark}
                onChange={(e) => setFormData({ ...formData, landmark: e.target.value })}
                className="w-full px-4 py-2 bg-white border-2 border-gray-400 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
              />
            </div>
          </div>

          {/* Settings */}
          <div className="space-y-4">
            <h2 className="text-xl font-bold text-gray-900">Settings</h2>
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div>
                <label className="font-medium text-gray-900">Free Event</label>
                <p className="text-sm text-gray-600">This event is free to attend</p>
              </div>
              <input
                type="checkbox"
                checked={formData.isFree}
                onChange={(e) => setFormData({ ...formData, isFree: e.target.checked })}
                className="w-5 h-5 text-green-600 rounded focus:ring-green-500"
              />
            </div>
            {!formData.isFree && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Ticket Price (₦) *
                </label>
                <input
                  type="number"
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                  className="w-full px-4 py-2 bg-white border-2 border-gray-400 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  min="0"
                  required={!formData.isFree}
                />
              </div>
            )}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Maximum Attendees
              </label>
              <input
                type="number"
                value={formData.maxAttendees}
                onChange={(e) => setFormData({ ...formData, maxAttendees: e.target.value })}
                className="w-full px-4 py-2 bg-white border-2 border-gray-400 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
                min="1"
              />
            </div>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div>
                  <label className="font-medium text-gray-900">Require Verification</label>
                  <p className="text-sm text-gray-600">Only verified neighbors can attend</p>
                </div>
                <input
                  type="checkbox"
                  checked={formData.requireVerification}
                  onChange={(e) => setFormData({ ...formData, requireVerification: e.target.checked })}
                  className="w-5 h-5 text-green-600 rounded focus:ring-green-500"
                />
              </div>
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div>
                  <label className="font-medium text-gray-900">Private Event</label>
                  <p className="text-sm text-gray-600">Only invited neighbors can see this</p>
                </div>
                <input
                  type="checkbox"
                  checked={formData.isPrivate}
                  onChange={(e) => setFormData({ ...formData, isPrivate: e.target.checked })}
                  className="w-5 h-5 text-green-600 rounded focus:ring-green-500"
                />
              </div>
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div>
                  <label className="font-medium text-gray-900">Allow Guests</label>
                  <p className="text-sm text-gray-600">Attendees can bring guests</p>
                </div>
                <input
                  type="checkbox"
                  checked={formData.allowGuests}
                  onChange={(e) => setFormData({ ...formData, allowGuests: e.target.checked })}
                  className="w-5 h-5 text-green-600 rounded focus:ring-green-500"
                />
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 pt-6 border-t border-gray-200">
            <button
              type="button"
              onClick={() => router.back()}
              className="px-6 py-2 bg-gray-800 text-white rounded-lg hover:bg-gray-900 transition-colors font-medium"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting || uploading}
              className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {(submitting || uploading) ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  {uploading ? 'Uploading images...' : 'Saving...'}
                </>
              ) : (
                'Save Changes'
              )}
            </button>
          </div>
        </form>
      </div>
    </DashboardLayout>
  );
}

