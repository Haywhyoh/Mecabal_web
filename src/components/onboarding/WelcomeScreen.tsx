'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { Mail, Phone, Loader2 } from 'lucide-react';
import { useOnboarding } from '@/contexts/OnboardingContext';
import { initializeGoogleSignIn, loadGoogleScript } from '@/lib/google-auth';
import { apiClient } from '@/lib/api';
import { useRouter } from 'next/navigation';

export default function WelcomeScreen() {
  const { setCurrentStep, setTokens, updateUser } = useOnboarding();
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [googleError, setGoogleError] = useState<string | null>(null);
  const [googleButtonRef, setGoogleButtonRef] = useState<HTMLDivElement | null>(null);
  const router = useRouter();

  const handleGoogleSignIn = useCallback(async (idToken: string) => {
    try {
      setIsGoogleLoading(true);
      setGoogleError(null);

      console.log('🔵 Google sign-in initiated with ID token');

      // Send ID token to backend
      const response = await apiClient.googleAuthWeb(idToken);

      console.log('🔵 Google auth response:', response);

      if (!response.success) {
        throw new Error(response.error || 'Google authentication failed');
      }

      // Extract data from ApiResponse
      if (!response.data) {
        throw new Error('Invalid response: missing data');
      }

      const { accessToken, refreshToken, user, isNewUser } = response.data;

      if (!accessToken || !refreshToken) {
        throw new Error('Missing authentication tokens');
      }

      // Store tokens
      setTokens(accessToken, refreshToken);

      // Update user context - handle Google auth response structure
      if (user) {
        updateUser({
          id: user.id,
          email: user.email,
          firstName: user.firstName || user.name?.split(' ')[0] || '',
          lastName: user.lastName || user.name?.split(' ').slice(1).join(' ') || '',
          phoneNumber: user.phoneNumber ?? undefined,
          phoneVerified: user.phoneVerified || false,
          isVerified: user.isVerified || user.isEmailVerified || user.verified_email || false,
        });
      }

      // Check if user needs to complete onboarding
      // Google users might not have phone verified yet
      const needsOnboarding = isNewUser || !user?.isVerified || !user?.phoneVerified;
      
      console.log('🔵 Onboarding check:', { isNewUser, isVerified: user?.isVerified, phoneVerified: user?.phoneVerified, needsOnboarding });

      if (needsOnboarding) {
        // New user or incomplete profile - proceed to phone verification
        setCurrentStep('phone-verification');
      } else {
        // User is fully verified - redirect to dashboard
        router.push('/dashboard');
      }
    } catch (error) {
      console.error('❌ Google authentication error:', error);
      setGoogleError(
        error instanceof Error ? error.message : 'Failed to sign in with Google'
      );
    } finally {
      setIsGoogleLoading(false);
    }
  }, [setTokens, updateUser, setCurrentStep, router]);

  useEffect(() => {
    // Initialize Google Sign-In when component mounts
    const initGoogle = async () => {
      try {
        await loadGoogleScript();
        await initializeGoogleSignIn(handleGoogleSignIn, (error) => {
          console.error('Google Sign-In error:', error);
          setGoogleError(error.message);
          setIsGoogleLoading(false);
        });
      } catch (error) {
        console.error('Failed to initialize Google Sign-In:', error);
        setGoogleError('Failed to initialize Google Sign-In');
      }
    };

    initGoogle();
  }, [handleGoogleSignIn]);

  // Render Google button when ref is available
  useEffect(() => {
    if (!googleButtonRef) return;

    const renderButton = async () => {
      try {
        await loadGoogleScript();
        
        if (!window.google?.accounts?.id) {
          throw new Error('Google Identity Services not available');
        }

        // Clear the div first
        googleButtonRef.innerHTML = '';

        // Re-initialize to ensure callback is set
        await initializeGoogleSignIn(handleGoogleSignIn, (error) => {
          console.error('Google Sign-In error:', error);
          setGoogleError(error.message);
          setIsGoogleLoading(false);
        });

        // Render the Google button
        window.google.accounts.id.renderButton(googleButtonRef, {
          type: 'standard',
          theme: 'outline',
          size: 'large',
          text: 'signin_with',
          shape: 'rectangular',
          logo_alignment: 'left',
          width: '100%',
        });
      } catch (error) {
        console.error('Failed to render Google button:', error);
        setGoogleError('Failed to initialize Google Sign-In button');
      }
    };

    renderButton();
  }, [googleButtonRef, handleGoogleSignIn]);



  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-white px-6">
      <div className="max-w-md w-full">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Welcome to MeCabal
          </h1>
          <p className="text-lg text-gray-600">
            Join your neighborhood community and connect with neighbors
          </p>
        </div>

        <div className="space-y-4">
          <button
            onClick={() => setCurrentStep('email-registration')}
            className="w-full flex items-center justify-center gap-3 p-4 bg-green-600 text-white rounded-xl hover:bg-green-700 transition-all duration-200 font-semibold"
          >
            <Mail className="w-5 h-5" />
            <span>Continue with Email</span>
          </button>

          <button
            onClick={() => setCurrentStep('phone-verification')}
            className="w-full flex items-center justify-center gap-3 p-4 bg-white border-2 border-gray-300 text-gray-900 rounded-xl hover:bg-gray-50 transition-all duration-200 font-semibold"
          >
            <Phone className="w-5 h-5" />
            <span>Continue with Phone</span>
          </button>

          <div
            ref={setGoogleButtonRef}
            className="w-full flex items-center justify-center"
            style={{ minHeight: '48px' }}
          >
            {isGoogleLoading && (
              <div className="w-full flex items-center justify-center gap-3 p-4 bg-white border-2 border-gray-300 text-gray-900 rounded-xl">
                <Loader2 className="w-5 h-5 animate-spin" />
                <span>Signing in...</span>
              </div>
            )}
          </div>

          {googleError && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-600">{googleError}</p>
            </div>
          )}
        </div>

        <p className="text-sm text-gray-500 text-center mt-8">
          Already have an account?{' '}
          <button
            onClick={() => setCurrentStep('email-registration')}
            className="text-green-600 hover:text-green-700 font-medium"
          >
            Sign in
          </button>
        </p>
      </div>
    </div>
  );
}

