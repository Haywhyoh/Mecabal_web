'use client';

import React, { useState } from 'react';
import { CheckCircle, HelpCircle, XCircle, Loader2 } from 'lucide-react';

interface RSVPButtonProps {
  eventId: string;
  currentStatus?: 'going' | 'maybe' | 'not_going';
  isAtCapacity: boolean;
  canRsvp: boolean;
  onRsvpChange: (status: 'going' | 'maybe' | 'not_going') => Promise<void>;
}

export default function RSVPButton({
  eventId,
  currentStatus,
  isAtCapacity,
  canRsvp,
  onRsvpChange,
}: RSVPButtonProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState<'going' | 'maybe' | 'not_going' | null>(
    currentStatus || null
  );

  const handleRsvp = async (status: 'going' | 'maybe' | 'not_going') => {
    if (isSubmitting) return;
    if (status === currentStatus) return; // Already selected

    setIsSubmitting(true);
    try {
      await onRsvpChange(status);
      setSelectedStatus(status);
    } catch (error) {
      console.error('Error updating RSVP:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const buttons = [
    {
      status: 'going' as const,
      label: 'Going',
      icon: CheckCircle,
      color: 'bg-green-600 hover:bg-green-700 text-white',
      activeColor: 'bg-green-600 text-white',
      inactiveColor: 'bg-white border-2 border-green-600 text-green-600 hover:bg-green-50',
    },
    {
      status: 'maybe' as const,
      label: 'Maybe',
      icon: HelpCircle,
      color: 'bg-yellow-600 hover:bg-yellow-700 text-white',
      activeColor: 'bg-yellow-600 text-white',
      inactiveColor: 'bg-white border-2 border-yellow-600 text-yellow-600 hover:bg-yellow-50',
    },
    {
      status: 'not_going' as const,
      label: "Can't Go",
      icon: XCircle,
      color: 'bg-gray-600 hover:bg-gray-700 text-white',
      activeColor: 'bg-gray-600 text-white',
      inactiveColor: 'bg-white border-2 border-gray-600 text-gray-600 hover:bg-gray-50',
    },
  ];

  return (
    <div className="space-y-3">
      <h3 className="text-lg font-semibold text-gray-900">Will you be attending?</h3>
      <div className="flex flex-wrap gap-3">
        {buttons.map((button) => {
          const Icon = button.icon;
          const isActive = selectedStatus === button.status;
          const isDisabled =
            isSubmitting ||
            (button.status === 'going' && isAtCapacity) ||
            (!canRsvp && !isActive);

          return (
            <button
              key={button.status}
              onClick={() => handleRsvp(button.status)}
              disabled={isDisabled}
              className={`
                flex items-center gap-2 px-6 py-3 rounded-lg font-semibold transition-colors shadow-sm
                ${isActive ? button.activeColor : button.inactiveColor}
                ${isDisabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
              `}
            >
              {isSubmitting && selectedStatus === button.status ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <Icon className="w-5 h-5" />
              )}
              <span>{button.label}</span>
            </button>
          );
        })}
      </div>
      {isAtCapacity && (
        <p className="text-sm text-red-600">This event is at capacity</p>
      )}
    </div>
  );
}

