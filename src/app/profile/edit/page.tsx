'use client';

import React, { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Save, Camera, X, Loader2 } from 'lucide-react';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import ProfileSection from '@/components/profile/ProfileSection';
import { apiClient } from '@/lib/api';
import { useAuthStore } from '@/store/authStore';
import type { User } from '@/types/user';

interface FormData {
  firstName: string;
  lastName: string;
  bio: string;
  occupation: string;
  professionalSkills: string;
  state: string;
  city: string;
  estate: string;
  landmark: string;
}

export default function EditProfilePage() {
  const router = useRouter();
  const { updateUser: updateAuthStoreUser } = useAuthStore();
  const [user, setUser] = useState<User | null>(null);
  const [formData, setFormData] = useState<FormData>({
    firstName: '',
    lastName: '',
    bio: '',
    occupation: '',
    professionalSkills: '',
    state: '',
    city: '',
    estate: '',
    landmark: '',
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  
  // Avatar upload state
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
  const [avatarUploadError, setAvatarUploadError] = useState<string | null>(null);
  const [isHoveringAvatar, setIsHoveringAvatar] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    loadUser();
  }, []);

  const loadUser = async () => {
    try {
      setIsLoading(true);
      const response = await apiClient.getCurrentUserProfile();
      if (response.success && response.data) {
        const userData = response.data as User;
        setUser(userData);
        setFormData({
          firstName: userData.firstName || '',
          lastName: userData.lastName || '',
          bio: userData.bio || '',
          occupation: userData.occupation || '',
          professionalSkills: userData.professionalSkills || '',
          state: userData.state || '',
          city: userData.city || '',
          estate: userData.estate || '',
          landmark: userData.landmark || '',
        });
      } else {
        setError(response.error || 'Failed to load profile');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load profile');
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (field: keyof FormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setError(null);
    setSuccess(false);
  };

  const handleAvatarUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      setAvatarUploadError('Please select an image file');
      return;
    }

    // Validate file size (5MB limit)
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      setAvatarUploadError('File size must be less than 5MB');
      return;
    }

    setAvatarUploadError(null);
    setIsUploadingAvatar(true);

    try {
      const response = await apiClient.uploadAvatar(file);
      
      if (response.success && response.data?.avatarUrl) {
        // Update local user state
        const updatedUser = { ...user!, profilePictureUrl: response.data.avatarUrl };
        setUser(updatedUser);
        
        // Update auth store
        updateAuthStoreUser({ profilePictureUrl: response.data.avatarUrl });
      } else {
        setAvatarUploadError(response.error || 'Failed to upload avatar');
      }
    } catch (error) {
      setAvatarUploadError(error instanceof Error ? error.message : 'Failed to upload avatar');
    } finally {
      setIsUploadingAvatar(false);
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleAvatarDelete = async () => {
    if (!user?.profilePictureUrl) return;
    
    if (!window.confirm('Are you sure you want to delete your profile picture?')) {
      return;
    }

    setIsUploadingAvatar(true);
    setAvatarUploadError(null);

    try {
      const response = await apiClient.deleteAvatar();
      
      if (response.success) {
        // Update local user state
        const updatedUser = { ...user, profilePictureUrl: undefined };
        setUser(updatedUser);
        
        // Update auth store
        updateAuthStoreUser({ profilePictureUrl: undefined });
      } else {
        setAvatarUploadError(response.error || 'Failed to delete avatar');
      }
    } catch (error) {
      setAvatarUploadError(error instanceof Error ? error.message : 'Failed to delete avatar');
    } finally {
      setIsUploadingAvatar(false);
    }
  };

  const handleAvatarClick = () => {
    if (!isUploadingAvatar) {
      fileInputRef.current?.click();
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(false);

    // Validation
    if (!formData.firstName.trim() || !formData.lastName.trim()) {
      setError('First name and last name are required');
      return;
    }

    if (formData.bio.length > 500) {
      setError('Bio must be 500 characters or less');
      return;
    }

    setIsSaving(true);
    try {
      const response = await apiClient.updateUserProfile({
        firstName: formData.firstName.trim(),
        lastName: formData.lastName.trim(),
        bio: formData.bio.trim() || undefined,
        occupation: formData.occupation.trim() || undefined,
        professionalSkills: formData.professionalSkills.trim() || undefined,
        state: formData.state.trim() || undefined,
        city: formData.city.trim() || undefined,
        estate: formData.estate.trim() || undefined,
        landmark: formData.landmark.trim() || undefined,
      });

      if (response.success) {
        setSuccess(true);
        setTimeout(() => {
          router.push('/profile');
        }, 1500);
      } else {
        setError(response.error || 'Failed to update profile');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update profile');
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="w-12 h-12 border-4 border-green-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-600">Loading...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="flex flex-col">
        {/* Header */}
        <div className="sticky top-0 z-10 bg-white/80 backdrop-blur-sm border-b border-gray-200 px-4 py-3 flex items-center gap-4">
          <button
            onClick={() => router.back()}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="text-xl font-bold text-gray-900">Edit Profile</h1>
        </div>

        {/* Messages */}
        {error && (
          <div className="bg-red-50 border-l-4 border-red-500 p-4 m-4">
            <p className="text-red-700 text-sm">{error}</p>
          </div>
        )}

        {success && (
          <div className="bg-green-50 border-l-4 border-green-500 p-4 m-4">
            <p className="text-green-700 text-sm">Profile updated successfully! Redirecting...</p>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          {/* Avatar Upload Section */}
          <ProfileSection title="Profile Picture">
            <div className="flex flex-col items-center gap-4">
              <div
                className="relative cursor-pointer group"
                onMouseEnter={() => setIsHoveringAvatar(true)}
                onMouseLeave={() => setIsHoveringAvatar(false)}
                onClick={handleAvatarClick}
              >
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleAvatarUpload}
                  accept="image/*"
                  className="hidden"
                  disabled={isUploadingAvatar}
                />
                
                {user?.profilePictureUrl ? (
                  <div className="relative">
                    <img
                      src={user.profilePictureUrl}
                      alt={user.firstName || 'Profile'}
                      className="w-32 h-32 rounded-full border-4 border-gray-200 object-cover transition-opacity"
                      style={{ opacity: isUploadingAvatar ? 0.5 : 1 }}
                    />
                    {/* Upload overlay */}
                    {(isHoveringAvatar || isUploadingAvatar) && (
                      <div className="absolute inset-0 rounded-full bg-black bg-opacity-50 flex items-center justify-center">
                        {isUploadingAvatar ? (
                          <Loader2 className="w-8 h-8 text-white animate-spin" />
                        ) : (
                          <Camera className="w-8 h-8 text-white" />
                        )}
                      </div>
                    )}
                    {/* Delete button */}
                    {user.profilePictureUrl && isHoveringAvatar && !isUploadingAvatar && (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleAvatarDelete();
                        }}
                        className="absolute -top-2 -right-2 w-8 h-8 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600 transition-colors z-10"
                        title="Delete avatar"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                ) : (
                  <div className="relative">
                    <div
                      className="w-32 h-32 rounded-full border-4 border-gray-200 bg-green-600 flex items-center justify-center transition-opacity group-hover:bg-green-700"
                      style={{ opacity: isUploadingAvatar ? 0.5 : 1 }}
                    >
                      {isUploadingAvatar ? (
                        <Loader2 className="w-12 h-12 text-white animate-spin" />
                      ) : (
                        <span className="text-white font-bold text-4xl">
                          {user?.firstName?.[0]?.toUpperCase() || user?.email?.[0]?.toUpperCase() || 'U'}
                        </span>
                      )}
                    </div>
                    {/* Upload overlay */}
                    {isHoveringAvatar && !isUploadingAvatar && (
                      <div className="absolute inset-0 rounded-full bg-black bg-opacity-50 flex items-center justify-center">
                        <Camera className="w-8 h-8 text-white" />
                      </div>
                    )}
                  </div>
                )}
              </div>
              
              <div className="text-center">
                <button
                  type="button"
                  onClick={handleAvatarClick}
                  disabled={isUploadingAvatar}
                  className="px-4 py-2 text-sm font-medium text-green-600 hover:text-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {user?.profilePictureUrl ? 'Change Photo' : 'Upload Photo'}
                </button>
                {user?.profilePictureUrl && (
                  <button
                    type="button"
                    onClick={handleAvatarDelete}
                    disabled={isUploadingAvatar}
                    className="ml-4 px-4 py-2 text-sm font-medium text-red-600 hover:text-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    Remove Photo
                  </button>
                )}
              </div>
              
              {avatarUploadError && (
                <div className="w-full p-3 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-sm text-red-600 text-center">{avatarUploadError}</p>
                </div>
              )}
              
              <p className="text-xs text-gray-500 text-center max-w-md">
                Click on the photo or use the button to upload a new profile picture. Maximum file size is 5MB.
              </p>
            </div>
          </ProfileSection>

          {/* Basic Information */}
          <ProfileSection title="Basic Information">
            <div className="space-y-4">
              <div>
                <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 mb-1">
                  First Name *
                </label>
                <input
                  id="firstName"
                  type="text"
                  value={formData.firstName}
                  onChange={(e) => handleInputChange('firstName', e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg text-gray-900 bg-white focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  required
                />
              </div>

              <div>
                <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 mb-1">
                  Last Name *
                </label>
                <input
                  id="lastName"
                  type="text"
                  value={formData.lastName}
                  onChange={(e) => handleInputChange('lastName', e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg text-gray-900 bg-white focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  required
                />
              </div>

              <div>
                <label htmlFor="bio" className="block text-sm font-medium text-gray-700 mb-1">
                  Bio
                </label>
                <textarea
                  id="bio"
                  value={formData.bio}
                  onChange={(e) => handleInputChange('bio', e.target.value)}
                  rows={4}
                  maxLength={500}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg text-gray-900 bg-white focus:ring-2 focus:ring-green-500 focus:border-green-500 resize-none"
                  placeholder="Tell your neighbors about yourself..."
                />
                <p className="text-xs text-gray-500 mt-1 text-right">
                  {formData.bio.length}/500
                </p>
              </div>
            </div>
          </ProfileSection>

          {/* Professional Information */}
          <ProfileSection title="Professional Information">
            <div className="space-y-4">
              <div>
                <label htmlFor="occupation" className="block text-sm font-medium text-gray-700 mb-1">
                  Occupation
                </label>
                <input
                  id="occupation"
                  type="text"
                  value={formData.occupation}
                  onChange={(e) => handleInputChange('occupation', e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg text-gray-900 bg-white focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  placeholder="e.g., Software Engineer, Teacher"
                />
              </div>

              <div>
                <label htmlFor="professionalSkills" className="block text-sm font-medium text-gray-700 mb-1">
                  Professional Skills
                </label>
                <input
                  id="professionalSkills"
                  type="text"
                  value={formData.professionalSkills}
                  onChange={(e) => handleInputChange('professionalSkills', e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg text-gray-900 bg-white focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  placeholder="e.g., Plumbing, Electrical, Catering"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Comma-separated list of your professional skills
                </p>
              </div>
            </div>
          </ProfileSection>

          {/* Location Information */}
          <ProfileSection title="Location Information">
            <div className="space-y-4">
              <div>
                <label htmlFor="state" className="block text-sm font-medium text-gray-700 mb-1">
                  State
                </label>
                <input
                  id="state"
                  type="text"
                  value={formData.state}
                  onChange={(e) => handleInputChange('state', e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg text-gray-900 bg-white focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  placeholder="e.g., Lagos"
                />
              </div>

              <div>
                <label htmlFor="city" className="block text-sm font-medium text-gray-700 mb-1">
                  City
                </label>
                <input
                  id="city"
                  type="text"
                  value={formData.city}
                  onChange={(e) => handleInputChange('city', e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg text-gray-900 bg-white focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  placeholder="e.g., Victoria Island"
                />
              </div>

              <div>
                <label htmlFor="estate" className="block text-sm font-medium text-gray-700 mb-1">
                  Estate/Compound
                </label>
                <input
                  id="estate"
                  type="text"
                  value={formData.estate}
                  onChange={(e) => handleInputChange('estate', e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg text-gray-900 bg-white focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  placeholder="e.g., Lekki Gardens Estate"
                />
              </div>

              <div>
                <label htmlFor="landmark" className="block text-sm font-medium text-gray-700 mb-1">
                  Landmark
                </label>
                <input
                  id="landmark"
                  type="text"
                  value={formData.landmark}
                  onChange={(e) => handleInputChange('landmark', e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg text-gray-900 bg-white focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  placeholder="e.g., Near Shoprite"
                />
              </div>
            </div>
          </ProfileSection>

          {/* Privacy Notice */}
          <ProfileSection>
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex items-start gap-3">
              <div className="text-blue-600 mt-0.5">ℹ️</div>
              <p className="text-sm text-blue-800">
                Your information is only shared with verified neighbors in your estate. You can control visibility in Privacy Settings.
              </p>
            </div>
          </ProfileSection>

          {/* Save Button */}
          <div className="sticky bottom-0 bg-white border-t border-gray-200 p-4">
            <button
              type="submit"
              disabled={isSaving || success}
              className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium transition-colors"
            >
              <Save className="w-5 h-5" />
              {isSaving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </DashboardLayout>
  );
}


