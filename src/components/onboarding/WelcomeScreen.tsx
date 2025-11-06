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
  const router = useRouter();

  const handleGoogleSignIn = useCallback(async (idToken: string) => {
    try {
      setIsGoogleLoading(true);
      setGoogleError(null);

      // Send ID token to backend
      const response = await apiClient.googleAuthWeb(idToken);

      if (!response.success || !response.data) {
        throw new Error(response.error || 'Google authentication failed');
      }

      const { accessToken, refreshToken, user, isNewUser } = response.data;

      // Store tokens
      if (accessToken && refreshToken) {
        setTokens(accessToken, refreshToken);
      }

      // Update user context
      if (user) {
        updateUser({
          id: user.id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          phoneNumber: user.phoneNumber,
          phoneVerified: user.phoneVerified,
          isVerified: user.isVerified,
        });
      }

      // Check if user needs to complete onboarding
      if (isNewUser || !user?.isVerified || !user?.phoneVerified) {
        // New user or incomplete profile - proceed to phone verification
        setCurrentStep('phone-verification');
      } else {
        // User is fully verified - redirect to dashboard
        router.push('/dashboard');
      }
    } catch (error) {
      console.error('Google authentication error:', error);
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
        });
      } catch (error) {
        console.error('Failed to initialize Google Sign-In:', error);
        setGoogleError('Failed to initialize Google Sign-In');
      }
    };

    initGoogle();
  }, [handleGoogleSignIn]);


  const handleGoogleButtonClick = async () => {
    try {
      setIsGoogleLoading(true);
      setGoogleError(null);

      // Trigger Google Sign-In prompt
      await loadGoogleScript();
      
      if (window.google?.accounts?.id) {
        window.google.accounts.id.prompt();
      } else {
        throw new Error('Google Sign-In not available');
      }
    } catch (error) {
      console.error('Failed to trigger Google Sign-In:', error);
      setGoogleError('Failed to start Google Sign-In');
      setIsGoogleLoading(false);
    }
  };

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

          <button
            onClick={handleGoogleButtonClick}
            disabled={isGoogleLoading}
            className="w-full flex items-center justify-center gap-3 p-4 bg-white border-2 border-gray-300 text-gray-900 rounded-xl hover:bg-gray-50 transition-all duration-200 font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isGoogleLoading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
            )}
            <span>{isGoogleLoading ? 'Signing in...' : 'Sign in with Google'}</span>
          </button>

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

