/**
 * API Client for MeCabal Backend
 * Handles all authentication and onboarding API calls
 */

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

class ApiClient {
  private baseUrl: string;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    try {
      const url = `${this.baseUrl}${endpoint}`;
      const token = typeof window !== 'undefined' ? localStorage.getItem('accessToken') : null;

      const response = await fetch(url, {
        ...options,
        headers: {
          'Content-Type': 'application/json',
          ...(token && { Authorization: `Bearer ${token}` }),
          ...options.headers,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        return {
          success: false,
          error: data.error || data.message || 'Request failed',
        };
      }

      return {
        success: true,
        data,
        ...data,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Network error',
      };
    }
  }

  // Email OTP Methods
  async sendEmailOTP(email: string, purpose: 'registration' | 'login' | 'password_reset' = 'registration') {
    return this.request('/auth/email/send-otp', {
      method: 'POST',
      body: JSON.stringify({ email, purpose }),
    });
  }

  async verifyEmailOTP(
    email: string,
    otpCode: string,
    userData?: {
      first_name: string;
      last_name: string;
      preferred_language?: string;
    }
  ) {
    return this.request('/auth/complete-email-verification', {
      method: 'POST',
      body: JSON.stringify({
        email,
        otpCode,
        ...userData,
        preferred_language: userData?.preferred_language || 'en',
      }),
    });
  }

  // Phone OTP Methods
  async sendPhoneOTP(
    phone: string,
    purpose: 'registration' | 'login' | 'password_reset' = 'registration',
    method: 'sms' | 'whatsapp' = 'sms',
    email?: string
  ) {
    return this.request('/auth/phone/send-otp', {
      method: 'POST',
      body: JSON.stringify({ phone, purpose, method, email }),
    });
  }

  async verifyPhoneOTP(
    phoneNumber: string,
    otpCode: string,
    purpose: 'registration' | 'login' | 'password_reset' = 'registration'
  ) {
    return this.request('/auth/phone/verify-otp', {
      method: 'POST',
      body: JSON.stringify({
        phoneNumber,
        otpCode,
        purpose,
        deviceInfo: {
          deviceType: 'web',
          userAgent: typeof window !== 'undefined' ? navigator.userAgent : '',
        },
      }),
    });
  }

  // Location Setup
  async setupLocation(
    locationData: {
      state?: string;
      city?: string;
      estate?: string;
      location?: string;
      landmark?: string;
      address?: string;
      latitude?: number;
      longitude?: number;
      completeRegistration: boolean;
    }
  ) {
    return this.request('/auth/location/setup', {
      method: 'POST',
      body: JSON.stringify(locationData),
    });
  }

  // User Profile
  async getCurrentUser() {
    return this.request('/auth/me');
  }
}

export const apiClient = new ApiClient(API_BASE_URL);

