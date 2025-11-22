'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { MapPin, Briefcase, Mail, Phone, Edit, Globe, Calendar } from 'lucide-react';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import ProfileHeader from '@/components/profile/ProfileHeader';
import ProfileCompletionCard from '@/components/profile/ProfileCompletionCard';
import TrustScoreCard from '@/components/profile/TrustScoreCard';
import ProfileSection from '@/components/profile/ProfileSection';
import { apiClient } from '@/lib/api';
import type { User } from '@/types/user';
import type { ProfileCompletion } from '@/types/profile';

export default function ProfilePage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [completion, setCompletion] = useState<ProfileCompletion | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const [userResponse, completionResponse] = await Promise.all([
        apiClient.getCurrentUserProfile(),
        apiClient.getProfileCompletion(),
      ]);

      if (userResponse.success && userResponse.data) {
        setUser(userResponse.data as User);
      } else {
        setError(userResponse.error || 'Failed to load profile');
      }

      if (completionResponse.success && completionResponse.data) {
        setCompletion(completionResponse.data as ProfileCompletion);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load profile');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAvatarUploadSuccess = (avatarUrl: string) => {
    if (user) {
      setUser({ ...user, profilePictureUrl: avatarUrl });
    }
    loadProfile(); // Refresh to get updated data
  };

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="w-12 h-12 border-4 border-green-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-600">Loading profile...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  if (error || !user) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <p className="text-red-600 mb-4">{error || 'Failed to load profile'}</p>
            <button
              onClick={loadProfile}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
            >
              Retry
            </button>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="flex flex-col">
        {/* Profile Header */}
        <ProfileHeader
          user={user}
          showEditButton
          onEditClick={() => router.push('/profile/edit')}
        />

        {/* Profile Completion */}
        {completion && (
          <ProfileSection>
            <ProfileCompletionCard
              completion={completion}
              onCompleteClick={() => router.push('/profile/edit')}
            />
          </ProfileSection>
        )}

        {/* Trust Score */}
        <ProfileSection>
          <TrustScoreCard
            trustScore={user.trustScore}
            verificationLevel={user.verificationLevel}
            compact={false}
          />
        </ProfileSection>

        {/* Basic Information */}
        <ProfileSection title="Basic Information">
          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <Mail className="w-5 h-5 text-gray-400 mt-0.5" />
              <div>
                <p className="text-sm text-gray-500">Email</p>
                <p className="text-gray-900">{user.email}</p>
              </div>
            </div>

            {user.phoneNumber && (
              <div className="flex items-start gap-3">
                <Phone className="w-5 h-5 text-gray-400 mt-0.5" />
                <div>
                  <p className="text-sm text-gray-500">Phone</p>
                  <p className="text-gray-900">{user.phoneNumber}</p>
                  {user.phoneVerified && (
                    <span className="text-xs text-green-600 mt-1 inline-block">Verified</span>
                  )}
                </div>
              </div>
            )}

            {user.dateOfBirth && (
              <div className="flex items-start gap-3">
                <Calendar className="w-5 h-5 text-gray-400 mt-0.5" />
                <div>
                  <p className="text-sm text-gray-500">Date of Birth</p>
                  <p className="text-gray-900">
                    {new Date(user.dateOfBirth).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })}
                  </p>
                </div>
              </div>
            )}

            {user.gender && (
              <div className="flex items-start gap-3">
                <Globe className="w-5 h-5 text-gray-400 mt-0.5" />
                <div>
                  <p className="text-sm text-gray-500">Gender</p>
                  <p className="text-gray-900 capitalize">{user.gender}</p>
                </div>
              </div>
            )}
          </div>
        </ProfileSection>

        {/* Professional Information */}
        {(user.occupation || user.professionalSkills) && (
          <ProfileSection title="Professional Information">
            <div className="space-y-4">
              {user.occupation && (
                <div className="flex items-start gap-3">
                  <Briefcase className="w-5 h-5 text-gray-400 mt-0.5" />
                  <div>
                    <p className="text-sm text-gray-500">Occupation</p>
                    <p className="text-gray-900">{user.occupation}</p>
                  </div>
                </div>
              )}

              {user.professionalSkills && (
                <div className="flex items-start gap-3">
                  <Briefcase className="w-5 h-5 text-gray-400 mt-0.5" />
                  <div>
                    <p className="text-sm text-gray-500">Professional Skills</p>
                    <div className="flex flex-wrap gap-2 mt-1">
                      {user.professionalSkills.split(',').map((skill, index) => (
                        <span
                          key={index}
                          className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-sm"
                        >
                          {skill.trim()}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </ProfileSection>
        )}

        {/* Location Information */}
        {(user.state || user.city || user.estate) && (
          <ProfileSection title="Location">
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <MapPin className="w-5 h-5 text-gray-400 mt-0.5" />
                <div>
                  <p className="text-sm text-gray-500">Location</p>
                  <p className="text-gray-900">{user.locationString || 'Not set'}</p>
                </div>
              </div>

              {user.landmark && (
                <div className="flex items-start gap-3">
                  <MapPin className="w-5 h-5 text-gray-400 mt-0.5" />
                  <div>
                    <p className="text-sm text-gray-500">Landmark</p>
                    <p className="text-gray-900">{user.landmark}</p>
                  </div>
                </div>
              )}
            </div>
          </ProfileSection>
        )}

        {/* Actions */}
        <ProfileSection>
          <div className="flex flex-col gap-3">
            <Link
              href="/profile/edit"
              className="flex items-center justify-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <Edit className="w-4 h-4" />
              <span>Edit Profile</span>
            </Link>
            <Link
              href="/profile/cultural"
              className="flex items-center justify-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              <Globe className="w-4 h-4" />
              <span>Cultural Profile</span>
            </Link>
          </div>
        </ProfileSection>
      </div>
    </DashboardLayout>
  );
}


