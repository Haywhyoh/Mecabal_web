/**
 * Types for onboarding flow
 */

export type OnboardingStep =
  | 'welcome'
  | 'email-registration'
  | 'email-verification'
  | 'phone-verification'
  | 'phone-otp-verification'
  | 'location-setup'
  | 'complete';

export interface OnboardingUser {
  id?: string;
  email: string;
  firstName: string;
  lastName: string;
  phoneNumber?: string;
  phoneVerified?: boolean;
  isVerified?: boolean;
  verificationLevel?: number;
}

export interface OnboardingState {
  currentStep: OnboardingStep;
  user: Partial<OnboardingUser>;
  phoneNumber?: string;
  accessToken?: string;
  refreshToken?: string;
}

export interface LocationData {
  state?: string;
  city?: string;
  estate?: string;
  location?: string;
  landmark?: string;
  address?: string;
  latitude?: number;
  longitude?: number;
}

