/**
 * Authentication type definitions
 */

import type { User } from './user';

export interface EmailVerificationResponse {
  user?: User;
  accessToken?: string;
  refreshToken?: string;
  [key: string]: any; // Allow additional properties
}

export interface PhoneVerificationResponse {
  user?: User;
  accessToken?: string;
  refreshToken?: string;
  [key: string]: any; // Allow additional properties
}

