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
          'ngrok-skip-browser-warning': '69420', // Bypass ngrok browser warning
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

  // Location Service Methods
  async getStates() {
    return this.request('/location/states');
  }

  async getLGAsByState(stateId: string) {
    if (!stateId) {
      console.error('getLGAsByState called with empty stateId');
      return {
        success: false,
        error: 'State ID is required',
      };
    }
    console.log('getLGAsByState called with stateId:', stateId);
    const endpoint = `/location/states/${stateId}/lgas`;
    console.log('Full endpoint:', endpoint);
    return this.request(endpoint);
  }

  async getWardsByLGA(lgaId: string) {
    return this.request(`/location/lgas/${lgaId}/wards`);
  }

  async getNeighborhoodsByWard(wardId: string) {
    return this.request(`/location/wards/${wardId}/neighborhoods`);
  }

  async searchNeighborhoods(params: {
    query?: string;
    stateId?: string;
    lgaId?: string;
    type?: string;
    limit?: number;
  }) {
    const queryParams = new URLSearchParams();
    if (params.query) queryParams.append('query', params.query);
    if (params.stateId) queryParams.append('stateId', params.stateId);
    if (params.lgaId) queryParams.append('lgaId', params.lgaId);
    if (params.type) queryParams.append('type', params.type);
    if (params.limit) queryParams.append('limit', params.limit.toString());

    return this.request(`/location/neighborhoods/search?${queryParams.toString()}`);
  }

  async recommendNeighborhoods(params: {
    latitude: number;
    longitude: number;
    radius?: number;
    limit?: number;
  }) {
    const queryParams = new URLSearchParams();
    queryParams.append('latitude', params.latitude.toString());
    queryParams.append('longitude', params.longitude.toString());
    if (params.radius) queryParams.append('radius', params.radius.toString());
    if (params.limit) queryParams.append('limit', params.limit.toString());

    return this.request(`/location/neighborhoods/recommend?${queryParams.toString()}`);
  }

  // Geocoding Methods
  async reverseGeocode(latitude: number, longitude: number) {
    const queryParams = new URLSearchParams();
    queryParams.append('latitude', latitude.toString());
    queryParams.append('longitude', longitude.toString());

    return this.request(`/location/geocoding/reverse?${queryParams.toString()}`);
  }
}

export const apiClient = new ApiClient(API_BASE_URL);

