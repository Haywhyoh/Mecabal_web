'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { OnboardingStep, OnboardingUser, LocationData } from '@/types/onboarding';

interface OnboardingContextType {
  currentStep: OnboardingStep;
  user: Partial<OnboardingUser>;
  phoneNumber?: string;
  locationData?: LocationData;
  isLoginMode: boolean;
  setCurrentStep: (step: OnboardingStep) => void;
  updateUser: (userData: Partial<OnboardingUser>) => void;
  setPhoneNumber: (phone: string) => void;
  setLocationData: (data: LocationData) => void;
  updateLocationData: (data: Partial<LocationData>) => void;
  setTokens: (accessToken: string, refreshToken: string) => void;
  setIsLoginMode: (isLogin: boolean) => void;
  resetOnboarding: () => void;
}

const OnboardingContext = createContext<OnboardingContextType | undefined>(undefined);

export function OnboardingProvider({ children }: { children: ReactNode }) {
  const [currentStep, setCurrentStep] = useState<OnboardingStep>('welcome');
  const [user, setUser] = useState<Partial<OnboardingUser>>({});
  const [phoneNumber, setPhoneNumber] = useState<string>();
  const [locationData, setLocationData] = useState<LocationData>();
  const [isLoginMode, setIsLoginMode] = useState(false);

  // Load from session storage on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedStep = sessionStorage.getItem('onboarding_step') as OnboardingStep;
      const savedUser = sessionStorage.getItem('onboarding_user');
      const savedPhone = sessionStorage.getItem('onboarding_phone');
      const savedLocation = sessionStorage.getItem('onboarding_location');
      const savedLoginMode = sessionStorage.getItem('onboarding_login_mode');

      if (savedStep) setCurrentStep(savedStep);
      if (savedUser) setUser(JSON.parse(savedUser));
      if (savedPhone) setPhoneNumber(savedPhone);
      if (savedLocation) setLocationData(JSON.parse(savedLocation));
      if (savedLoginMode) setIsLoginMode(savedLoginMode === 'true');
    }
  }, []);

  // Save to session storage on change
  useEffect(() => {
    if (typeof window !== 'undefined') {
      sessionStorage.setItem('onboarding_step', currentStep);
    }
  }, [currentStep]);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      if (Object.keys(user).length > 0) {
        sessionStorage.setItem('onboarding_user', JSON.stringify(user));
      }
    }
  }, [user]);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      if (phoneNumber) {
        sessionStorage.setItem('onboarding_phone', phoneNumber);
      }
    }
  }, [phoneNumber]);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      if (locationData) {
        sessionStorage.setItem('onboarding_location', JSON.stringify(locationData));
      }
    }
  }, [locationData]);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      sessionStorage.setItem('onboarding_login_mode', isLoginMode.toString());
    }
  }, [isLoginMode]);

  const updateUser = (userData: Partial<OnboardingUser>) => {
    setUser((prev) => ({ ...prev, ...userData }));
  };

  const setTokens = (accessToken: string, refreshToken: string) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('accessToken', accessToken);
      localStorage.setItem('refreshToken', refreshToken);
    }
  };

  const resetOnboarding = () => {
    setCurrentStep('welcome');
    setUser({});
    setPhoneNumber(undefined);
    setLocationData(undefined);
    setIsLoginMode(false);
    if (typeof window !== 'undefined') {
      sessionStorage.removeItem('onboarding_step');
      sessionStorage.removeItem('onboarding_user');
      sessionStorage.removeItem('onboarding_phone');
      sessionStorage.removeItem('onboarding_location');
      sessionStorage.removeItem('onboarding_login_mode');
    }
  };

  // Helper to update location data with estate
  const updateLocationData = (data: Partial<LocationData>) => {
    setLocationData((prev) => ({ ...prev, ...data }));
  };

  return (
    <OnboardingContext.Provider
      value={{
        currentStep,
        user,
        phoneNumber,
        locationData,
        isLoginMode,
        setCurrentStep,
        updateUser,
        setPhoneNumber,
        setLocationData,
        updateLocationData,
        setTokens,
        setIsLoginMode,
        resetOnboarding,
      }}
    >
      {children}
    </OnboardingContext.Provider>
  );
}

export function useOnboarding() {
  const context = useContext(OnboardingContext);
  if (context === undefined) {
    throw new Error('useOnboarding must be used within an OnboardingProvider');
  }
  return context;
}

