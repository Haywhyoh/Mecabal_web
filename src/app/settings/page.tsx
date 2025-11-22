'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { LogOut, Mail, Phone, Shield, Bell, Trash2, AlertTriangle } from 'lucide-react';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import ProfileSection from '@/components/profile/ProfileSection';
import { apiClient } from '@/lib/api';
import type { User } from '@/types/user';

export default function SettingsPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showDeactivateConfirm, setShowDeactivateConfirm] = useState(false);
  const [isDeactivating, setIsDeactivating] = useState(false);

  useEffect(() => {
    loadUser();
  }, []);

  const loadUser = async () => {
    try {
      setIsLoading(true);
      const response = await apiClient.getCurrentUserProfile();
      if (response.success && response.data) {
        setUser(response.data as User);
      }
    } catch (err) {
      console.error('Failed to load user:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = () => {
    if (confirm('Are you sure you want to sign out?')) {
      localStorage.removeItem('accessToken');
      router.push('/onboarding');
    }
  };

  const handleDeactivate = async () => {
    if (!confirm('Are you sure you want to deactivate your account? This action cannot be undone.')) {
      return;
    }

    setIsDeactivating(true);
    try {
      const response = await apiClient.deactivateAccount();
      if (response.success) {
        alert('Your account has been deactivated. You will be signed out.');
        localStorage.removeItem('accessToken');
        router.push('/onboarding');
      } else {
        alert(response.error || 'Failed to deactivate account');
      }
    } catch (err) {
      alert('An error occurred while deactivating your account');
    } finally {
      setIsDeactivating(false);
      setShowDeactivateConfirm(false);
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
        <div className="sticky top-0 z-10 bg-white/80 backdrop-blur-sm border-b border-gray-200 px-4 py-3">
          <h1 className="text-xl font-bold text-gray-900">Settings</h1>
        </div>

        {/* Account Settings */}
        <ProfileSection title="Account Settings">
          <div className="space-y-4">
            <div className="flex items-center justify-between py-2">
              <div className="flex items-center gap-3">
                <Mail className="w-5 h-5 text-gray-400" />
                <div>
                  <p className="font-medium text-gray-900">Email</p>
                  <p className="text-sm text-gray-500">{user?.email}</p>
                </div>
              </div>
              <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full">
                Verified
              </span>
            </div>

            {user?.phoneNumber && (
              <div className="flex items-center justify-between py-2">
                <div className="flex items-center gap-3">
                  <Phone className="w-5 h-5 text-gray-400" />
                  <div>
                    <p className="font-medium text-gray-900">Phone</p>
                    <p className="text-sm text-gray-500">{user.phoneNumber}</p>
                  </div>
                </div>
                {user.phoneVerified ? (
                  <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full">
                    Verified
                  </span>
                ) : (
                  <span className="text-xs bg-yellow-100 text-yellow-700 px-2 py-1 rounded-full">
                    Not Verified
                  </span>
                )}
              </div>
            )}

            <div className="pt-2 border-t border-gray-200">
              <p className="text-sm text-gray-500 mb-2">
                To change your email or phone number, please contact support.
              </p>
            </div>
          </div>
        </ProfileSection>

        {/* Privacy Settings */}
        <ProfileSection title="Privacy">
          <div className="space-y-4">
            <div className="flex items-center justify-between py-2">
              <div className="flex items-center gap-3">
                <Shield className="w-5 h-5 text-gray-400" />
                <div>
                  <p className="font-medium text-gray-900">Profile Visibility</p>
                  <p className="text-sm text-gray-500">Control who can see your profile information</p>
                </div>
              </div>
              <button
                onClick={() => router.push('/profile/cultural')}
                className="text-sm text-green-600 hover:text-green-700 font-medium"
              >
                Manage →
              </button>
            </div>

            <div className="pt-2 border-t border-gray-200">
              <p className="text-sm text-gray-500">
                Your profile information is only shared with verified neighbors in your estate.
                You can control individual field visibility in your Cultural Profile settings.
              </p>
            </div>
          </div>
        </ProfileSection>

        {/* Notifications */}
        <ProfileSection title="Notifications">
          <div className="space-y-4">
            <div className="flex items-center justify-between py-2">
              <div className="flex items-center gap-3">
                <Bell className="w-5 h-5 text-gray-400" />
                <div>
                  <p className="font-medium text-gray-900">Notification Preferences</p>
                  <p className="text-sm text-gray-500">Manage how you receive notifications</p>
                </div>
              </div>
              <span className="text-sm text-gray-500">Coming soon</span>
            </div>
          </div>
        </ProfileSection>

        {/* Account Actions */}
        <ProfileSection title="Account Actions">
          <div className="space-y-4">
            <button
              onClick={handleLogout}
              className="w-full flex items-center justify-between p-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <div className="flex items-center gap-3">
                <LogOut className="w-5 h-5 text-gray-400" />
                <span className="font-medium text-gray-900">Sign Out</span>
              </div>
              <span className="text-gray-400">›</span>
            </button>

            <button
              onClick={() => setShowDeactivateConfirm(true)}
              className="w-full flex items-center justify-between p-3 border border-red-300 rounded-lg hover:bg-red-50 transition-colors"
            >
              <div className="flex items-center gap-3">
                <Trash2 className="w-5 h-5 text-red-600" />
                <span className="font-medium text-red-600">Deactivate Account</span>
              </div>
              <span className="text-red-400">›</span>
            </button>

            {showDeactivateConfirm && (
              <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
                <div className="flex items-start gap-3 mb-3">
                  <AlertTriangle className="w-5 h-5 text-red-600 mt-0.5" />
                  <div className="flex-1">
                    <p className="font-medium text-red-900 mb-1">Deactivate Account</p>
                    <p className="text-sm text-red-700 mb-3">
                      This will deactivate your account. You can reactivate it later by logging in.
                    </p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={handleDeactivate}
                    disabled={isDeactivating}
                    className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 text-sm font-medium"
                  >
                    {isDeactivating ? 'Deactivating...' : 'Confirm Deactivation'}
                  </button>
                  <button
                    onClick={() => setShowDeactivateConfirm(false)}
                    className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 text-sm font-medium"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}
          </div>
        </ProfileSection>

        {/* Footer Info */}
        <ProfileSection>
          <div className="text-center text-sm text-gray-500">
            <p>Need help? Contact support at support@mecabal.com</p>
          </div>
        </ProfileSection>
      </div>
    </DashboardLayout>
  );
}


