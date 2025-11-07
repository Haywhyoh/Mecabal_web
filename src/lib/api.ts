/**
 * API Client for MeCabal Backend
 * Handles all authentication and onboarding API calls
 */

import type { User } from '@/types/user';
import type { Neighborhood } from '@/types/neighborhood';
import type { ReverseGeocodeResponse } from '@/types/geocoding';
import type { State, LGA, Ward } from '@/types/location';
import type { EmailVerificationResponse, PhoneVerificationResponse, LocationSetupResponse, GoogleAuthResponse } from '@/types/auth';

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
    return this.request<EmailVerificationResponse>('/auth/complete-email-verification', {
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
    return this.request<PhoneVerificationResponse>('/auth/phone/verify-otp', {
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
      stateId: string;
      lgaId: string;
      neighborhoodId?: string;
      cityTown?: string;
      address?: string;
      latitude?: number;
      longitude?: number;
      completeRegistration: boolean;
    }
  ) {
    return this.request<LocationSetupResponse>('/auth/location/setup', {
      method: 'POST',
      body: JSON.stringify(locationData),
    });
  }

  // User Profile
  async getCurrentUser() {
    return this.request<User>('/auth/me');
  }

  // Location Service Methods
  async getStates() {
    return this.request<State[]>('/location/states');
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
    return this.request<LGA[]>(endpoint);
  }

  async getWardsByLGA(lgaId: string) {
    return this.request<Ward[]>(`/location/lgas/${lgaId}/wards`);
  }

  async getNeighborhoodsByWard(wardId: string) {
    return this.request<Neighborhood[]>(`/location/wards/${wardId}/neighborhoods`);
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

    return this.request<Neighborhood[]>(`/location/neighborhoods/search?${queryParams.toString()}`);
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

    return this.request<{ recommendations?: Array<{ neighborhood: Neighborhood }> }>(`/location/neighborhoods/recommend?${queryParams.toString()}`);
  }

  // Create Neighborhood
  async createNeighborhood(data: {
    name: string;
    type: 'AREA' | 'ESTATE' | 'COMMUNITY';
    lgaId: string;
    centerLatitude?: number;
    centerLongitude?: number;
    isGated?: boolean;
    description?: string;
    boundaries?: {
      type: 'Polygon';
      coordinates: number[][][];
    };
  }) {
    return this.request('/location/neighborhoods/create', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  // Update Neighborhood Boundaries
  async updateNeighborhoodBoundaries(neighborhoodId: string, boundaries: {
    type: 'Polygon';
    coordinates: number[][][];
  }) {
    return this.request(`/location/neighborhoods/${neighborhoodId}`, {
      method: 'PUT',
      body: JSON.stringify({ boundaries }),
    });
  }

  // Get Neighborhoods with Boundaries
  async getNeighborhoodsWithBoundaries(lgaId: string) {
    return this.request<Neighborhood[]>(`/location/lgas/${lgaId}/neighborhoods?includeBoundaries=true`);
  }

  // Get Neighborhood by ID
  async getNeighborhoodById(id: string) {
    return this.request<Neighborhood>(`/location/neighborhoods/${id}`);
  }

  // Get All Neighborhoods
  async getAllNeighborhoods(params?: {
    lgaId?: string;
    stateId?: string;
    type?: 'AREA' | 'ESTATE' | 'COMMUNITY';
    isGated?: boolean;
    limit?: number;
    offset?: number;
  }) {
    const queryParams = new URLSearchParams();
    if (params?.lgaId) queryParams.append('lgaId', params.lgaId);
    if (params?.stateId) queryParams.append('stateId', params.stateId);
    if (params?.type) queryParams.append('type', params.type);
    if (params?.isGated !== undefined) queryParams.append('isGated', params.isGated.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    if (params?.offset) queryParams.append('offset', params.offset.toString());

    const queryString = queryParams.toString();
    return this.request(`/location/neighborhoods${queryString ? `?${queryString}` : ''}`);
  }

  // Update Neighborhood
  async updateNeighborhood(id: string, data: {
    name?: string;
    type?: 'AREA' | 'ESTATE' | 'COMMUNITY';
    isGated?: boolean;
    description?: string;
    boundaries?: {
      type: 'Polygon';
      coordinates: number[][][];
    };
    requiresVerification?: boolean;
    adminUserId?: string;
  }) {
    return this.request(`/location/neighborhoods/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  // Delete Neighborhood
  async deleteNeighborhood(id: string) {
    return this.request(`/location/neighborhoods/${id}`, {
      method: 'DELETE',
    });
  }

  // Geocoding Methods
  async reverseGeocode(latitude: number, longitude: number) {
    const queryParams = new URLSearchParams();
    queryParams.append('latitude', latitude.toString());
    queryParams.append('longitude', longitude.toString());

    return this.request<ReverseGeocodeResponse>(`/location/geocoding/reverse?${queryParams.toString()}`);
  }

  // Google OAuth Methods
  async googleAuthWeb(idToken: string) {
    return this.request<GoogleAuthResponse>('/auth/google/web', {
      method: 'POST',
      body: JSON.stringify({ idToken }),
    });
  }
}

export const apiClient = new ApiClient(API_BASE_URL);

