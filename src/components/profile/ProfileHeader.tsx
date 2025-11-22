'use client';

import React from 'react';
import { CheckCircle2, MapPin, Calendar } from 'lucide-react';
import type { User } from '@/types/user';

interface ProfileHeaderProps {
  user: User;
  showEditButton?: boolean;
  onEditClick?: () => void;
}

export default function ProfileHeader({ user, showEditButton = false, onEditClick }: ProfileHeaderProps) {
  const initials = user.firstName?.[0]?.toUpperCase() || user.email?.[0]?.toUpperCase() || 'U';
  const fullName = user.fullName || (user.firstName && user.lastName ? `${user.firstName} ${user.lastName}` : user.email?.split('@')[0] || 'User');

  return (
    <div className="bg-white border-b border-gray-200">
      <div className="p-4">
        {/* Avatar and Cover */}
        <div className="relative mb-4">
          <div className="h-32 bg-gradient-to-r from-green-500 to-green-600 rounded-t-lg"></div>
          <div className="absolute -bottom-12 left-4">
            {user.profilePictureUrl ? (
              <img
                src={user.profilePictureUrl}
                alt={fullName}
                className="w-24 h-24 rounded-full border-4 border-white object-cover"
              />
            ) : (
              <div className="w-24 h-24 rounded-full border-4 border-white bg-green-600 flex items-center justify-center">
                <span className="text-white font-bold text-2xl">{initials}</span>
              </div>
            )}
          </div>
        </div>

        {/* User Info */}
        <div className="mt-16 px-4">
          <div className="flex items-start justify-between mb-2">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <h1 className="text-2xl font-bold text-gray-900">{fullName}</h1>
                {user.isVerified && (
                  <CheckCircle2 className="w-5 h-5 text-green-600" title="Verified" />
                )}
              </div>
              {user.email && (
                <p className="text-gray-500 text-sm mb-2">@{user.email.split('@')[0]}</p>
              )}
            </div>
            {showEditButton && (
              <button
                onClick={onEditClick}
                className="px-4 py-2 border border-gray-300 rounded-full hover:bg-gray-50 font-medium text-sm transition-colors"
              >
                Edit Profile
              </button>
            )}
          </div>

          {user.bio && (
            <p className="text-gray-900 mb-3">{user.bio}</p>
          )}

          {/* Location and Join Date */}
          <div className="flex items-center gap-4 text-sm text-gray-500 mb-3">
            {user.locationString && (
              <div className="flex items-center gap-1">
                <MapPin className="w-4 h-4" />
                <span>{user.locationString}</span>
              </div>
            )}
            {user.joinDate && (
              <div className="flex items-center gap-1">
                <Calendar className="w-4 h-4" />
                <span>Joined {user.joinDate}</span>
              </div>
            )}
          </div>

          {/* Verification Badges */}
          <div className="flex items-center gap-4 flex-wrap">
            {user.phoneVerified && (
              <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full">
                Phone Verified
              </span>
            )}
            {user.identityVerified && (
              <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full">
                Identity Verified
              </span>
            )}
            {user.addressVerified && (
              <span className="text-xs bg-purple-100 text-purple-700 px-2 py-1 rounded-full">
                Address Verified
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}


