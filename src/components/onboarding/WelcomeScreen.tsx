'use client';

import React from 'react';
import { Mail, Phone, ArrowRight } from 'lucide-react';
import { useOnboarding } from '@/contexts/OnboardingContext';

export default function WelcomeScreen() {
  const { setCurrentStep } = useOnboarding();

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
            className="w-full flex items-center justify-between p-4 bg-white border-2 border-gray-200 rounded-xl hover:border-green-600 hover:bg-green-50 transition-all duration-200 group"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center group-hover:bg-green-600 transition-colors">
                <Mail className="w-5 h-5 text-green-600 group-hover:text-white transition-colors" />
              </div>
              <span className="text-lg font-semibold text-gray-900">Continue with Email</span>
            </div>
            <ArrowRight className="w-5 h-5 text-gray-400 group-hover:text-green-600 transition-colors" />
          </button>

          <button
            onClick={() => setCurrentStep('phone-verification')}
            className="w-full flex items-center justify-between p-4 bg-white border-2 border-gray-200 rounded-xl hover:border-green-600 hover:bg-green-50 transition-all duration-200 group"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center group-hover:bg-green-600 transition-colors">
                <Phone className="w-5 h-5 text-green-600 group-hover:text-white transition-colors" />
              </div>
              <span className="text-lg font-semibold text-gray-900">Continue with Phone</span>
            </div>
            <ArrowRight className="w-5 h-5 text-gray-400 group-hover:text-green-600 transition-colors" />
          </button>
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

