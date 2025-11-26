'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Check, Loader2 } from 'lucide-react';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import { apiClient } from '@/lib/api';
import { EVENT_CATEGORIES } from '@/types/event';
import type { CreateEventDto } from '@/types/event';

interface FormData {
  title: string;
  description: string;
  categoryId: number | null;
  eventDate: string;
  startTime: string;
  endTime: string;
  locationName: string;
  locationAddress: string;
  city: string;
  state: string;
  landmark: string;
  latitude: number | null;
  longitude: number | null;
  isFree: boolean;
  price: string;
  maxAttendees: string;
  allowGuests: boolean;
  requireVerification: boolean;
  ageRestriction: string;
  languages: string[];
  isPrivate: boolean;
  specialRequirements: string;
  coverImageUrl: string;
}

const nigerianLanguages = ['English', 'Hausa', 'Yoruba', 'Igbo', 'Pidgin', 'Fulani', 'Kanuri', 'Ibibio'];
const ageRestrictions = [
  { value: '', label: 'No restriction' },
  { value: 'family-friendly', label: 'Family-friendly' },
  { value: '18+', label: '18+ only' },
  { value: '21+', label: '21+ only' },
  { value: 'children-only', label: 'Children only' },
];

export default function CreateEventPage() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState<FormData>({
    title: '',
    description: '',
    categoryId: null,
    eventDate: '',
    startTime: '',
    endTime: '',
    locationName: '',
    locationAddress: '',
    city: '',
    state: '',
    landmark: '',
    latitude: null,
    longitude: null,
    isFree: true,
    price: '',
    maxAttendees: '',
    allowGuests: true,
    requireVerification: false,
    ageRestriction: '',
    languages: ['English'],
    isPrivate: false,
    specialRequirements: '',
    coverImageUrl: '',
  });

  const totalSteps = 5;

  const updateFormData = (field: keyof FormData, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const validateStep = (step: number): boolean => {
    switch (step) {
      case 1:
        return !!(formData.title.trim() && formData.description.trim() && formData.categoryId);
      case 2:
        return !!(formData.eventDate && formData.startTime);
      case 3:
        return !!(formData.locationName.trim() && formData.locationAddress.trim() && formData.city.trim() && formData.state);
      case 4:
        return formData.isFree || (formData.price.trim() && parseFloat(formData.price) > 0);
      case 5:
        return true;
      default:
        return false;
    }
  };

  const nextStep = () => {
    if (!validateStep(currentStep)) {
      setError('Please fill in all required fields');
      return;
    }
    setError(null);
    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSubmit = async () => {
    if (!validateStep(currentStep)) {
      setError('Please fill in all required fields');
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      const eventData: CreateEventDto = {
        categoryId: formData.categoryId!,
        title: formData.title,
        description: formData.description,
        eventDate: formData.eventDate,
        startTime: formData.startTime,
        endTime: formData.endTime || undefined,
        location: {
          name: formData.locationName,
          address: `${formData.locationAddress}, ${formData.city}, ${formData.state}`,
          latitude: formData.latitude || 0,
          longitude: formData.longitude || 0,
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
        coverImageUrl: formData.coverImageUrl || undefined,
        specialRequirements: formData.specialRequirements || undefined,
      };

      const response = await apiClient.createEvent(eventData);
      if (response.success && response.data) {
        const event = response.data as any;
        router.push(`/events/${event.id}`);
      } else {
        throw new Error(response.error || 'Failed to create event');
      }
    } catch (err) {
      console.error('Error creating event:', err);
      setError(err instanceof Error ? err.message : 'Failed to create event');
    } finally {
      setSubmitting(false);
    }
  };

  const renderStepIndicator = () => (
    <div className="flex items-center justify-center gap-2 mb-6">
      {Array.from({ length: totalSteps }, (_, i) => (
        <React.Fragment key={i}>
          <div
            className={`w-8 h-8 rounded-full flex items-center justify-center font-semibold ${
              i + 1 === currentStep
                ? 'bg-green-600 text-white'
                : i + 1 < currentStep
                ? 'bg-green-100 text-green-600'
                : 'bg-gray-200 text-gray-500'
            }`}
          >
            {i + 1 < currentStep ? <Check className="w-5 h-5" /> : i + 1}
          </div>
          {i < totalSteps - 1 && (
            <div
              className={`h-1 w-12 ${
                i + 1 < currentStep ? 'bg-green-600' : 'bg-gray-200'
              }`}
            />
          )}
        </React.Fragment>
      ))}
    </div>
  );

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
              <h1 className="text-xl font-bold text-gray-900">Create Event</h1>
              <p className="text-sm text-gray-600">Step {currentStep} of {totalSteps}</p>
            </div>
          </div>
        </div>

        {/* Progress Indicator */}
        <div className="px-4 pt-6">
          {renderStepIndicator()}
        </div>

        {/* Form Content */}
        <div className="px-4 pb-8">
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700">
              {error}
            </div>
          )}

          {/* Step 1: Basic Info */}
          {currentStep === 1 && (
            <div className="space-y-4">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Event Details</h2>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Event Title *
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => updateFormData('title', e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                  placeholder="e.g., Community Cleanup Drive"
                  maxLength={100}
                />
                <p className="text-xs text-gray-500 mt-1">{formData.title.length}/100</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description *
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => updateFormData('description', e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                  rows={4}
                  placeholder="Describe your event..."
                  maxLength={500}
                />
                <p className="text-xs text-gray-500 mt-1">{formData.description.length}/500</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Category *
                </label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                  {EVENT_CATEGORIES.map((category) => (
                    <button
                      key={category.id}
                      onClick={() => updateFormData('categoryId', category.id)}
                      className={`p-3 rounded-lg border-2 text-sm font-medium transition-colors ${
                        formData.categoryId === category.id
                          ? 'border-green-600 bg-green-50 text-green-700'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      {category.name}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Step 2: Date & Time */}
          {currentStep === 2 && (
            <div className="space-y-4">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">When is your event?</h2>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Date *
                </label>
                <input
                  type="date"
                  value={formData.eventDate}
                  onChange={(e) => updateFormData('eventDate', e.target.value)}
                  min={new Date().toISOString().split('T')[0]}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Start Time *
                  </label>
                  <input
                    type="time"
                    value={formData.startTime}
                    onChange={(e) => updateFormData('startTime', e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    End Time
                  </label>
                  <input
                    type="time"
                    value={formData.endTime}
                    onChange={(e) => updateFormData('endTime', e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Step 3: Location */}
          {currentStep === 3 && (
            <div className="space-y-4">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Where is your event?</h2>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Venue Name *
                </label>
                <input
                  type="text"
                  value={formData.locationName}
                  onChange={(e) => updateFormData('locationName', e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                  placeholder="e.g., Community Hall"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Address *
                </label>
                <input
                  type="text"
                  value={formData.locationAddress}
                  onChange={(e) => updateFormData('locationAddress', e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                  placeholder="Street address"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    City *
                  </label>
                  <input
                    type="text"
                    value={formData.city}
                    onChange={(e) => updateFormData('city', e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                    placeholder="e.g., Lagos"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    State *
                  </label>
                  <input
                    type="text"
                    value={formData.state}
                    onChange={(e) => updateFormData('state', e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                    placeholder="e.g., Lagos"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Landmark
                </label>
                <input
                  type="text"
                  value={formData.landmark}
                  onChange={(e) => updateFormData('landmark', e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                  placeholder="e.g., Near Ikeja City Mall"
                />
              </div>
            </div>
          )}

          {/* Step 4: Pricing & Settings */}
          {currentStep === 4 && (
            <div className="space-y-4">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Event Settings</h2>
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div>
                  <label className="font-medium text-gray-900">Free Event</label>
                  <p className="text-sm text-gray-600">This event is free to attend</p>
                </div>
                <input
                  type="checkbox"
                  checked={formData.isFree}
                  onChange={(e) => updateFormData('isFree', e.target.checked)}
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
                    onChange={(e) => updateFormData('price', e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                    placeholder="0.00"
                    min="0"
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
                  onChange={(e) => updateFormData('maxAttendees', e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                  placeholder="Leave empty for unlimited"
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
                    onChange={(e) => updateFormData('requireVerification', e.target.checked)}
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
                    onChange={(e) => updateFormData('isPrivate', e.target.checked)}
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
                    onChange={(e) => updateFormData('allowGuests', e.target.checked)}
                    className="w-5 h-5 text-green-600 rounded focus:ring-green-500"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Step 5: Additional Details */}
          {currentStep === 5 && (
            <div className="space-y-4">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Additional Details</h2>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Languages
                </label>
                <div className="flex flex-wrap gap-2">
                  {nigerianLanguages.map((lang) => (
                    <button
                      key={lang}
                      onClick={() => {
                        const newLangs = formData.languages.includes(lang)
                          ? formData.languages.filter((l) => l !== lang)
                          : [...formData.languages, lang];
                        updateFormData('languages', newLangs);
                      }}
                      className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
                        formData.languages.includes(lang)
                          ? 'bg-green-600 text-white'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      {lang}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Age Restriction
                </label>
                <select
                  value={formData.ageRestriction}
                  onChange={(e) => updateFormData('ageRestriction', e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                >
                  {ageRestrictions.map((restriction) => (
                    <option key={restriction.value} value={restriction.value}>
                      {restriction.label}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Special Requirements
                </label>
                <textarea
                  value={formData.specialRequirements}
                  onChange={(e) => updateFormData('specialRequirements', e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                  rows={3}
                  placeholder="Any special requirements, what to bring, dress code, etc."
                />
              </div>
            </div>
          )}

          {/* Navigation Buttons */}
          <div className="flex items-center justify-between mt-8 pt-6 border-t border-gray-200">
            <button
              onClick={prevStep}
              disabled={currentStep === 1}
              className="px-6 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Back
            </button>
            {currentStep < totalSteps ? (
              <button
                onClick={nextStep}
                disabled={!validateStep(currentStep)}
                className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Continue
              </button>
            ) : (
              <button
                onClick={handleSubmit}
                disabled={!validateStep(currentStep) || submitting}
                className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {submitting ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Creating...
                  </>
                ) : (
                  'Create Event'
                )}
              </button>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}

