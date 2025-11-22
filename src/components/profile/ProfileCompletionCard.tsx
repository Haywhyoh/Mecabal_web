'use client';

import React from 'react';
import { CheckCircle2, Circle } from 'lucide-react';
import type { ProfileCompletion } from '@/types/profile';

interface ProfileCompletionCardProps {
  completion: ProfileCompletion;
  onCompleteClick?: () => void;
}

export default function ProfileCompletionCard({ completion, onCompleteClick }: ProfileCompletionCardProps) {
  const percentage = completion.percentage || 0;
  const missingFields = completion.missingFields || [];

  const getFieldLabel = (field: string): string => {
    const labels: Record<string, string> = {
      firstName: 'First Name',
      lastName: 'Last Name',
      email: 'Email',
      phoneNumber: 'Phone Number',
      phoneVerified: 'Phone Verification',
      bio: 'Bio',
      occupation: 'Occupation',
      state: 'State',
      city: 'City',
      profilePictureUrl: 'Profile Picture',
    };
    return labels[field] || field;
  };

  return (
    <div className="bg-gradient-to-r from-green-50 to-green-100 border border-green-200 rounded-lg p-4">
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-semibold text-gray-900">Profile Completion</h3>
        <span className="text-2xl font-bold text-green-600">{percentage}%</span>
      </div>

      {/* Progress Bar */}
      <div className="w-full bg-gray-200 rounded-full h-2 mb-3">
        <div
          className="bg-green-600 h-2 rounded-full transition-all duration-300"
          style={{ width: `${percentage}%` }}
        />
      </div>

      {missingFields.length > 0 && (
        <div className="space-y-2">
          <p className="text-sm text-gray-600 mb-2">Complete your profile by adding:</p>
          <ul className="space-y-1">
            {missingFields.slice(0, 3).map((field) => (
              <li key={field} className="flex items-center gap-2 text-sm text-gray-700">
                <Circle className="w-4 h-4 text-gray-400" />
                <span>{getFieldLabel(field)}</span>
              </li>
            ))}
          </ul>
          {onCompleteClick && (
            <button
              onClick={onCompleteClick}
              className="mt-3 text-sm text-green-600 hover:text-green-700 font-medium"
            >
              Complete Profile →
            </button>
          )}
        </div>
      )}

      {missingFields.length === 0 && (
        <div className="flex items-center gap-2 text-green-700">
          <CheckCircle2 className="w-5 h-5" />
          <span className="text-sm font-medium">Your profile is complete!</span>
        </div>
      )}
    </div>
  );
}


