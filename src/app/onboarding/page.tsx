'use client';

import React from 'react';
import { OnboardingProvider, useOnboarding } from '@/contexts/OnboardingContext';
import WelcomeScreen from '@/components/onboarding/WelcomeScreen';
import EmailRegistrationForm from '@/components/onboarding/EmailRegistrationForm';
import EmailVerificationForm from '@/components/onboarding/EmailVerificationForm';
import PhoneVerificationForm from '@/components/onboarding/PhoneVerificationForm';
import PhoneOTPVerificationForm from '@/components/onboarding/PhoneOTPVerificationForm';
import LocationSetupForm from '@/components/onboarding/LocationSetupForm';

function OnboardingContent() {
  const { currentStep } = useOnboarding();

  const renderStep = () => {
    switch (currentStep) {
      case 'welcome':
        return <WelcomeScreen />;
      case 'email-registration':
        return <EmailRegistrationForm />;
      case 'email-verification':
        return <EmailVerificationForm />;
      case 'phone-verification':
        return <PhoneVerificationForm />;
      case 'phone-otp-verification':
        return <PhoneOTPVerificationForm />;
      case 'location-setup':
        return <LocationSetupForm />;
      default:
        return <WelcomeScreen />;
    }
  };

  return (
    <div className="min-h-screen">
      {renderStep()}
    </div>
  );
}

export default function OnboardingPage() {
  return (
    <OnboardingProvider>
      <OnboardingContent />
    </OnboardingProvider>
  );
}

