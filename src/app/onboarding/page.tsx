'use client';

import React from 'react';
import { OnboardingProvider, useOnboarding } from '@/contexts/OnboardingContext';
import WelcomeScreen from '@/components/onboarding/WelcomeScreen';
import LoginForm from '@/components/onboarding/LoginForm';
import EmailRegistrationForm from '@/components/onboarding/EmailRegistrationForm';
import EmailVerificationForm from '@/components/onboarding/EmailVerificationForm';
import PhoneVerificationForm from '@/components/onboarding/PhoneVerificationForm';
import PhoneOTPVerificationForm from '@/components/onboarding/PhoneOTPVerificationForm';
import LocationSetupForm from '@/components/onboarding/LocationSetupForm';
import EstateSelectionForm from '@/components/onboarding/EstateSelectionForm';
import ProfileSetupForm from '@/components/onboarding/ProfileSetupForm';

function OnboardingContent() {
  const { currentStep } = useOnboarding();

  const renderStep = () => {
    switch (currentStep) {
      case 'welcome':
        return <WelcomeScreen />;
      case 'login':
        return <LoginForm />;
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
      case 'estate-selection':
        return <EstateSelectionForm />;
      case 'profile-setup':
        return <ProfileSetupForm />;
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

