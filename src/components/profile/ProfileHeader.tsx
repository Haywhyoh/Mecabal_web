'use client';

import React, { useState, useRef } from 'react';
import { CheckCircle2, MapPin, Calendar, Camera, X, Loader2 } from 'lucide-react';
import { apiClient } from '@/lib/api';
import type { User } from '@/types/user';

interface ProfileHeaderProps {
  user: User;
  showEditButton?: boolean;
  onEditClick?: () => void;
  onAvatarUpdate?: (avatarUrl: string | null) => void;
}

export default function ProfileHeader({ 
  user, 
  showEditButton = false, 
  onEditClick,
  onAvatarUpdate 
}: ProfileHeaderProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isHoveringAvatar, setIsHoveringAvatar] = useState(false);

  const initials = user.firstName?.[0]?.toUpperCase() || user.email?.[0]?.toUpperCase() || 'U';
  const fullName = user.fullName || (user.firstName && user.lastName ? `${user.firstName} ${user.lastName}` : user.email?.split('@')[0] || 'User');

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      setUploadError('Please select an image file');
      return;
    }

    // Validate file size (5MB limit)
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      setUploadError('File size must be less than 5MB');
      return;
    }

    setUploadError(null);
    setIsUploading(true);

    try {
      const response = await apiClient.uploadAvatar(file);
      
      if (response.success && response.data?.avatarUrl) {
        if (onAvatarUpdate) {
          onAvatarUpdate(response.data.avatarUrl);
        }
      } else {
        setUploadError(response.error || 'Failed to upload avatar');
      }
    } catch (error) {
      setUploadError(error instanceof Error ? error.message : 'Failed to upload avatar');
    } finally {
      setIsUploading(false);
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleDeleteAvatar = async () => {
    if (!user.profilePictureUrl) return;
    
    if (!confirm('Are you sure you want to delete your profile picture?')) {
      return;
    }

    setIsUploading(true);
    setUploadError(null);

    try {
      const response = await apiClient.deleteAvatar();
      
      if (response.success) {
        if (onAvatarUpdate) {
          onAvatarUpdate(null);
        }
      } else {
        setUploadError(response.error || 'Failed to delete avatar');
      }
    } catch (error) {
      setUploadError(error instanceof Error ? error.message : 'Failed to delete avatar');
    } finally {
      setIsUploading(false);
    }
  };

  const handleAvatarClick = () => {
    if (!isUploading) {
      fileInputRef.current?.click();
    }
  };

  // Build location string with estate priority
  const getLocationDisplay = () => {
    const parts = [];
    if (user.estate) parts.push(user.estate);
    if (user.city) parts.push(user.city);
    if (user.state) parts.push(user.state);
    return parts.length > 0 ? parts.join(', ') : user.locationString;
  };

  return (
    <div className="bg-white border-b border-gray-200">
      <div className="p-4">
        {/* Avatar and Cover */}
        <div className="relative mb-4">
          <div className="h-32 bg-gradient-to-r from-green-500 to-green-600 rounded-t-lg"></div>
          <div 
            className="absolute -bottom-12 left-4 cursor-pointer group"
            onMouseEnter={() => setIsHoveringAvatar(true)}
            onMouseLeave={() => setIsHoveringAvatar(false)}
            onClick={handleAvatarClick}
          >
            <div className="relative">
              {user.profilePictureUrl ? (
                <img
                  src={user.profilePictureUrl}
                  alt={fullName}
                  className="w-24 h-24 rounded-full border-4 border-white object-cover transition-opacity"
                  style={{ opacity: isUploading ? 0.5 : 1 }}
                />
              ) : (
                <div className="w-24 h-24 rounded-full border-4 border-white bg-green-600 flex items-center justify-center transition-opacity"
                  style={{ opacity: isUploading ? 0.5 : 1 }}>
                  <span className="text-white font-bold text-2xl">{initials}</span>
                </div>
              )}
              
              {/* Upload overlay */}
              {(isHoveringAvatar || isUploading) && (
                <div className="absolute inset-0 rounded-full bg-black bg-opacity-50 flex items-center justify-center">
                  {isUploading ? (
                    <Loader2 className="w-6 h-6 text-white animate-spin" />
                  ) : (
                    <Camera className="w-6 h-6 text-white" />
                  )}
                </div>
              )}

              {/* Delete button (if avatar exists) */}
              {user.profilePictureUrl && isHoveringAvatar && !isUploading && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDeleteAvatar();
                  }}
                  className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600 transition-colors"
                  title="Delete avatar"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>

          {/* Hidden file input */}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileSelect}
            className="hidden"
          />
        </div>

        {/* Upload error message */}
        {uploadError && (
          <div className="mb-4 px-4">
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-600">{uploadError}</p>
            </div>
          </div>
        )}

        {/* User Info */}
        <div className="mt-16 px-4">
          <div className="flex items-start justify-between mb-2">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <h1 className="text-2xl font-bold text-gray-900">{fullName}</h1>
                {user.isVerified && (
                  <CheckCircle2 className="w-5 h-5 text-green-600" aria-label="Verified" />
                )}
              </div>
              {user.email && (
                <p className="text-gray-500 text-sm mb-2">@{user.email.split('@')[0]}</p>
              )}
            </div>
            {showEditButton && (
              <button
                onClick={onEditClick}
                className="px-4 py-2 bg-gray-900 text-white rounded-full hover:bg-gray-800 font-medium text-sm transition-colors"
              >
                Edit Profile
              </button>
            )}
          </div>

          {user.bio && (
            <p className="text-gray-900 mb-3">{user.bio}</p>
          )}

          {/* Location and Join Date */}
          <div className="flex items-center gap-4 text-sm text-gray-500 mb-3 flex-wrap">
            {(user.estate || user.city || user.state || user.locationString) && (
              <div className="flex items-center gap-1">
                <MapPin className="w-4 h-4" />
                <span>{getLocationDisplay()}</span>
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


