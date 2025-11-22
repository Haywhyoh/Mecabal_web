/**
 * API Client for MeCabal Backend
 * Handles all authentication and onboarding API calls
 */

import type { User } from '@/types/user';
import type { Neighborhood } from '@/types/neighborhood';
import type { ReverseGeocodeResponse } from '@/types/geocoding';
import type { State, LGA, Ward } from '@/types/location';
import type { EmailVerificationResponse, PhoneVerificationResponse, LocationSetupResponse, GoogleAuthResponse } from '@/types/auth';
import type { CulturalBackground, ProfessionalCategory, ReferenceData } from '@/types/profile';
import type {
  BusinessProfile,
  BusinessService,
  BusinessInquiry,
  BusinessReview,
  BusinessCategory,
  BusinessFilter,
  PaginatedBusinesses,
  CreateBusinessProfileDto,
  UpdateBusinessProfileDto,
  CreateBusinessServiceDto,
  UpdateBusinessServiceDto,
} from '@/types/business';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
  statusCode?: number;
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
          // Only add ngrok header in development
          ...(process.env.NODE_ENV === 'development' && {
            'ngrok-skip-browser-warning': '69420',
          }),
          ...(token && { Authorization: `Bearer ${token}` }),
          ...options.headers,
        },
      });

      // Handle empty responses (e.g., 204 No Content)
      const contentType = response.headers.get('content-type');
      let data: any = null;
      
      if (contentType && contentType.includes('application/json')) {
        try {
          data = await response.json();
        } catch (jsonError) {
          // Response might be empty JSON
          data = null;
        }
      }

      // Handle different status codes
      if (!response.ok) {
        const statusCode = response.status;
        const errorMessage = data?.error || data?.message || `Request failed with status ${statusCode}`;
        
        // Handle service unavailable (503) - service is down
        if (statusCode === 503) {
          return {
            success: false,
            error: 'Service is currently unavailable. Please try again later.',
            statusCode,
          };
        }
        
        return {
          success: false,
          error: errorMessage,
          statusCode, // Include status code for better error handling
        };
      }

      return {
        success: true,
        data,
        ...data,
      };
    } catch (error) {
      // Handle network errors or JSON parsing errors
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
      estateId?: string;
      stateOfOriginId?: string;
      culturalBackgroundId?: string;
      professionalCategoryId?: string;
      professionalTitle?: string;
      occupation?: string;
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

  /**
   * Complete email login after OTP verification
   * POST /auth/complete-email-login
   */
  async completeEmailLogin(email: string, otpCode: string) {
    return this.request<EmailVerificationResponse>('/auth/complete-email-login', {
      method: 'POST',
      body: JSON.stringify({ email, otpCode }),
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
      estateId?: string;
      cityTown?: string;
      address?: string;
      latitude?: number;
      longitude?: number;
      completeRegistration: boolean;
      // Profile fields
      stateOfOriginId?: string;
      culturalBackgroundId?: string;
      professionalCategoryId?: string;
      professionalTitle?: string;
      occupation?: string;
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

  // Estate Search (gated estates only)
  async searchEstates(params: {
    query?: string;
    stateId?: string;
    lgaId?: string;
    limit?: number;
  }) {
    const queryParams = new URLSearchParams();
    if (params.query) queryParams.append('query', params.query);
    if (params.stateId) queryParams.append('stateId', params.stateId);
    if (params.lgaId) queryParams.append('lgaId', params.lgaId);
    if (params.limit) queryParams.append('limit', params.limit.toString());

    return this.request<Neighborhood[]>(`/auth/location/estates?${queryParams.toString()}`);
  }

  // Profile Reference Data
  async getCulturalBackgrounds() {
    // Try to get from reference-data endpoint, fallback to direct endpoint if needed
    return this.request<{
      states?: any[];
      culturalBackgrounds?: CulturalBackground[];
      professionalCategories?: ProfessionalCategory[];
      languages?: any[];
    }>('/cultural-profile/reference-data').then((response) => {
      if (response.success && response.data?.culturalBackgrounds) {
        return {
          success: true,
          data: response.data.culturalBackgrounds,
        };
      }
      return response;
    });
  }

  async getProfessionalCategories() {
    // Try to get from reference-data endpoint, fallback to direct endpoint if needed
    return this.request<{
      states?: any[];
      culturalBackgrounds?: CulturalBackground[];
      professionalCategories?: ProfessionalCategory[];
      languages?: any[];
    }>('/cultural-profile/reference-data').then((response) => {
      if (response.success && response.data?.professionalCategories) {
        return {
          success: true,
          data: response.data.professionalCategories,
        };
      }
      return response;
    });
  }

  async getReferenceData() {
    return this.request<ReferenceData>('/cultural-profile/reference-data');
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

  /**
   * Logout user
   * POST /auth/logout
   */
  async logout() {
    return this.request<{ message: string }>('/auth/logout', {
      method: 'POST',
    });
  }

  /**
   * Refresh access token
   * POST /auth/refresh
   */
  async refreshToken() {
    const refreshToken = typeof window !== 'undefined' ? localStorage.getItem('refreshToken') : null;
    if (!refreshToken) {
      return {
        success: false,
        error: 'No refresh token available',
      };
    }
    return this.request<{ accessToken: string; refreshToken: string }>('/auth/refresh', {
      method: 'POST',
      body: JSON.stringify({ refreshToken }),
    });
  }

  // User Profile Methods
  /**
   * Get current user profile
   * GET /users/me
   */
  async getCurrentUserProfile() {
    return this.request<User>('/users/me');
  }

  /**
   * Update current user profile
   * PUT /users/me
   */
  async updateUserProfile(data: {
    firstName?: string;
    lastName?: string;
    email?: string;
    phoneNumber?: string;
    dateOfBirth?: string;
    gender?: string;
    bio?: string;
    occupation?: string;
    professionalSkills?: string;
    culturalBackground?: string;
    nativeLanguages?: string;
    preferredLanguage?: string;
    state?: string;
    city?: string;
    estate?: string;
    landmark?: string;
    address?: string;
  }) {
    return this.request<User>('/users/me', {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  /**
   * Get profile completion status
   * GET /users/me/completion
   */
  async getProfileCompletion() {
    return this.request<{
      percentage: number;
      missingFields: string[];
    }>('/users/me/completion');
  }

  /**
   * Upload user avatar
   * POST /users/me/avatar
   */
  async uploadAvatar(file: File) {
    try {
      const url = `${this.baseUrl}/users/me/avatar`;
      const token = typeof window !== 'undefined' ? localStorage.getItem('accessToken') : null;

      const formData = new FormData();
      formData.append('avatar', file);

      const response = await fetch(url, {
        method: 'POST',
        headers: {
          // Don't set Content-Type, let browser set it with boundary for multipart/form-data
          ...(process.env.NODE_ENV === 'development' && {
            'ngrok-skip-browser-warning': '69420',
          }),
          ...(token && { Authorization: `Bearer ${token}` }),
        },
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        return {
          success: false,
          error: data.error || data.message || 'Upload failed',
        };
      }

      return {
        success: true,
        data: data.avatarUrl ? { avatarUrl: data.avatarUrl } : data,
        ...data,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Network error',
      };
    }
  }

  /**
   * Delete user avatar
   * DELETE /users/me/avatar
   */
  async deleteAvatar() {
    return this.request<{ message: string }>('/users/me/avatar', {
      method: 'DELETE',
    });
  }

  /**
   * Get cultural profile for user
   * GET /cultural-profile/:userId
   */
  async getCulturalProfile(userId: string) {
    return this.request('/cultural-profile/' + userId);
  }

  /**
   * Create or update cultural profile
   * POST /cultural-profile/:userId
   */
  async createOrUpdateCulturalProfile(
    userId: string,
    data: {
      stateOfOriginId: string;
      culturalBackgroundId: string;
      professionalCategoryId: string;
      professionalTitle: string;
      languages: Array<{
        languageId: string;
        proficiency: 'beginner' | 'intermediate' | 'advanced' | 'native';
      }>;
      privacySettings: {
        showCulturalBackground: boolean;
        showLanguages: boolean;
        showProfessionalCategory: boolean;
        showStateOfOrigin: boolean;
        allowCulturalMatching: boolean;
      };
    }
  ) {
    return this.request('/cultural-profile/' + userId, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  /**
   * Update cultural profile
   * PUT /cultural-profile/:userId
   */
  async updateCulturalProfile(
    userId: string,
    data: {
      stateOfOriginId?: string;
      culturalBackgroundId?: string;
      professionalCategoryId?: string;
      professionalTitle?: string;
      languages?: Array<{
        languageId: string;
        proficiency: 'beginner' | 'intermediate' | 'advanced' | 'native';
      }>;
      privacySettings?: {
        showCulturalBackground?: boolean;
        showLanguages?: boolean;
        showProfessionalCategory?: boolean;
        showStateOfOrigin?: boolean;
        allowCulturalMatching?: boolean;
      };
    }
  ) {
    return this.request('/cultural-profile/' + userId, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  /**
   * Deactivate user account
   * DELETE /users/me
   */
  async deactivateAccount() {
    return this.request<{ message: string }>('/users/me', {
      method: 'DELETE',
    });
  }

  // ==================== Business Profile APIs ====================
  // Note: These routes go through the API gateway which routes /business/* to business-service
  // The gateway strips the /business prefix and forwards to the service

  /**
   * Normalize business profile data to ensure rating and reviewCount are always numbers
   */
  private normalizeBusinessProfile(business: any): BusinessProfile {
    if (!business) return business;
    
    return {
      ...business,
      rating: business.rating !== null && business.rating !== undefined
        ? (typeof business.rating === 'string' ? parseFloat(business.rating) : Number(business.rating)) || 0
        : 0,
      reviewCount: Number(business.reviewCount) || 0,
      completedJobs: Number(business.completedJobs) || 0,
      yearsOfExperience: Number(business.yearsOfExperience) || 0,
    };
  }

  /**
   * Register a new business profile
   * POST /business/register
   */
  async registerBusiness(data: CreateBusinessProfileDto) {
    const response = await this.request<BusinessProfile>('/business/register', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    
    if (response.success && response.data) {
      response.data = this.normalizeBusinessProfile(response.data);
    }
    
    return response;
  }

  /**
   * Get current user's business profile
   * GET /business/my-business
   * Returns null if user has no business profile (404)
   */
  async getMyBusiness() {
    try {
      const response = await this.request<BusinessProfile>('/business/my-business');
      
      // Handle 404 as "no business found" - return null like mobile app
      if (!response.success && response.statusCode === 404) {
        return {
          success: true,
          data: null as any, // Return null to indicate no business found
        };
      }
      
      // Normalize business data
      if (response.success && response.data) {
        response.data = this.normalizeBusinessProfile(response.data);
      }
      
      return response;
    } catch (error) {
      // Handle network errors
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch business profile',
      };
    }
  }

  /**
   * Get business profile by ID
   * GET /business/:id
   */
  async getBusinessById(id: string) {
    const response = await this.request<BusinessProfile>(`/business/${id}`);
    
    if (response.success && response.data) {
      response.data = this.normalizeBusinessProfile(response.data);
    }
    
    return response;
  }

  /**
   * Update business profile
   * PUT /business/:id
   */
  async updateBusiness(id: string, data: UpdateBusinessProfileDto) {
    const response = await this.request<BusinessProfile>(`/business/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
    
    if (response.success && response.data) {
      response.data = this.normalizeBusinessProfile(response.data);
    }
    
    return response;
  }

  /**
   * Update business online/offline status
   * PUT /business/:id/status
   */
  async updateBusinessStatus(id: string, isActive: boolean) {
    const response = await this.request<BusinessProfile>(`/business/${id}/status`, {
      method: 'PUT',
      body: JSON.stringify({ isActive }),
    });
    
    if (response.success && response.data) {
      response.data = this.normalizeBusinessProfile(response.data);
    }
    
    return response;
  }

  /**
   * Delete business profile
   * DELETE /business/:id
   */
  async deleteBusiness(id: string) {
    return this.request<{ message: string }>(`/business/${id}`, {
      method: 'DELETE',
    });
  }

  // ==================== Business Services APIs ====================

  /**
   * Add a new service to a business
   * POST /business-services/:businessId
   */
  async createBusinessService(businessId: string, data: CreateBusinessServiceDto) {
    return this.request<BusinessService>(`/business-services/${businessId}`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  /**
   * Get all services for a business
   * GET /business-services/business/:businessId
   */
  async getBusinessServices(businessId: string) {
    return this.request<BusinessService[]>(`/business-services/business/${businessId}`);
  }

  /**
   * Get business service by ID
   * GET /business-services/:id
   */
  async getBusinessServiceById(id: string) {
    return this.request<BusinessService>(`/business-services/${id}`);
  }

  /**
   * Update business service
   * PUT /business-services/:id
   */
  async updateBusinessService(id: string, data: UpdateBusinessServiceDto) {
    return this.request<BusinessService>(`/business-services/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  /**
   * Toggle service active status
   * PUT /business-services/:id/toggle-active
   */
  async toggleServiceActive(id: string) {
    return this.request<BusinessService>(`/business-services/${id}/toggle-active`, {
      method: 'PUT',
    });
  }

  /**
   * Delete business service
   * DELETE /business-services/:id
   */
  async deleteBusinessService(id: string) {
    return this.request<{ message: string }>(`/business-services/${id}`, {
      method: 'DELETE',
    });
  }

  // ==================== Business Search APIs ====================

  /**
   * Search businesses
   * GET /search?query=...
   */
  async searchBusinesses(filter: BusinessFilter = {}) {
    const queryParams = new URLSearchParams();
    Object.entries(filter).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        queryParams.append(key, value.toString());
      }
    });
    const queryString = queryParams.toString();
    const response = await this.request<PaginatedBusinesses>(`/search${queryString ? `?${queryString}` : ''}`);
    
    // Normalize businesses in paginated response
    if (response.success && response.data) {
      const paginatedData = response.data as any;
      if (Array.isArray(paginatedData.data)) {
        paginatedData.data = paginatedData.data.map((business: any) => 
          this.normalizeBusinessProfile(business)
        );
      } else if (Array.isArray(paginatedData)) {
        // If response is just an array
        response.data = {
          data: paginatedData.map((business: any) => 
            this.normalizeBusinessProfile(business)
          ),
          total: paginatedData.length,
          page: 1,
          limit: paginatedData.length,
          totalPages: 1,
          hasNext: false,
          hasPrev: false,
        } as PaginatedBusinesses;
      }
    }
    
    return response;
  }

  /**
   * Get featured businesses
   * GET /search/featured
   */
  async getFeaturedBusinesses(limit: number = 10) {
    const response = await this.request<BusinessProfile[]>(`/search/featured?limit=${limit}`);
    
    if (response.success && response.data) {
      if (Array.isArray(response.data)) {
        response.data = response.data.map((business: any) => 
          this.normalizeBusinessProfile(business)
        ) as BusinessProfile[];
      }
    }
    
    return response;
  }

  /**
   * Get trending businesses
   * GET /search/trending
   */
  async getTrendingBusinesses(limit: number = 10) {
    const response = await this.request<BusinessProfile[]>(`/search/trending?limit=${limit}`);
    
    if (response.success && response.data) {
      if (Array.isArray(response.data)) {
        response.data = response.data.map((business: any) => 
          this.normalizeBusinessProfile(business)
        ) as BusinessProfile[];
      }
    }
    
    return response;
  }

  /**
   * Get businesses by service area
   * GET /search/by-service-area
   */
  async getBusinessesByServiceArea(params: {
    latitude: number;
    longitude: number;
    radius?: number;
    serviceArea?: string;
    limit?: number;
  }) {
    const queryParams = new URLSearchParams();
    queryParams.append('latitude', params.latitude.toString());
    queryParams.append('longitude', params.longitude.toString());
    if (params.radius) queryParams.append('radius', params.radius.toString());
    if (params.serviceArea) queryParams.append('serviceArea', params.serviceArea);
    if (params.limit) queryParams.append('limit', params.limit.toString());
    const response = await this.request<BusinessProfile[]>(`/search/by-service-area?${queryParams.toString()}`);
    
    if (response.success && response.data) {
      if (Array.isArray(response.data)) {
        response.data = response.data.map((business: any) => 
          this.normalizeBusinessProfile(business)
        ) as BusinessProfile[];
      }
    }
    
    return response;
  }

  // ==================== Business Category APIs ====================

  /**
   * Get all business categories
   * GET /categories
   */
  async getBusinessCategories() {
    return this.request<BusinessCategory[]>('/categories');
  }

  /**
   * Get subcategories for a category
   * GET /categories/:id/subcategories
   */
  async getSubcategories(categoryId: string) {
    return this.request<string[]>(`/categories/${categoryId}/subcategories`);
  }

  /**
   * Search categories
   * GET /categories/search?query=...
   */
  async searchCategories(query: string) {
    return this.request<BusinessCategory[]>(`/categories/search?query=${encodeURIComponent(query)}`);
  }

  // ==================== Business Inquiry APIs ====================

  /**
   * Get business inquiries
   * GET /business/:businessId/inquiries
   */
  async getBusinessInquiries(businessId: string, params?: {
    page?: number;
    limit?: number;
    status?: string;
    sortBy?: string;
    sortOrder?: 'ASC' | 'DESC';
  }) {
    const queryParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          queryParams.append(key, value.toString());
        }
      });
    }
    const queryString = queryParams.toString();
    return this.request<{
      inquiries: BusinessInquiry[];
      total: number;
      page: number;
      limit: number;
    }>(`/business/${businessId}/inquiries${queryString ? `?${queryString}` : ''}`);
  }

  /**
   * Create business inquiry
   * POST /business/:businessId/inquiries
   */
  async createBusinessInquiry(businessId: string, data: {
    serviceType?: string;
    subject?: string;
    message: string;
    urgency?: 'low' | 'normal' | 'high' | 'urgent';
    budgetMin?: number;
    budgetMax?: number;
    preferredContact?: 'call' | 'message' | 'whatsapp';
    phone?: string;
    email?: string;
  }) {
    return this.request<BusinessInquiry>(`/business/${businessId}/inquiries`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  /**
   * Respond to inquiry
   * POST /business/:businessId/inquiries/:inquiryId/respond
   */
  async respondToInquiry(businessId: string, inquiryId: string, data: {
    message: string;
  }) {
    return this.request<BusinessInquiry>(`/business/${businessId}/inquiries/${inquiryId}/respond`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  /**
   * Update inquiry status
   * PUT /business/:businessId/inquiries/:inquiryId/status
   */
  async updateInquiryStatus(businessId: string, inquiryId: string, status: string) {
    return this.request<BusinessInquiry>(`/business/${businessId}/inquiries/${inquiryId}/status`, {
      method: 'PUT',
      body: JSON.stringify({ status }),
    });
  }

  /**
   * Get inquiry stats
   * GET /business/:businessId/inquiries/stats
   */
  async getInquiryStats(businessId: string) {
    return this.request<{
      total: number;
      pending: number;
      inProgress: number;
      responded: number;
      closed: number;
    }>(`/business/${businessId}/inquiries/stats`);
  }

  // ==================== Business Review APIs ====================

  /**
   * Get business reviews
   * GET /business/:businessId/reviews
   */
  async getBusinessReviews(businessId: string, params?: {
    page?: number;
    limit?: number;
    rating?: number;
    sortBy?: string;
    sortOrder?: 'ASC' | 'DESC';
  }) {
    const queryParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          queryParams.append(key, value.toString());
        }
      });
    }
    const queryString = queryParams.toString();
    return this.request<{
      reviews: BusinessReview[];
      total: number;
      averageRating: number;
      page: number;
      limit: number;
    }>(`/business/${businessId}/reviews${queryString ? `?${queryString}` : ''}`);
  }

  /**
   * Create business review
   * POST /business/:businessId/reviews
   */
  async createReview(businessId: string, data: {
    rating: number;
    comment: string;
    serviceType?: string;
  }) {
    return this.request<BusinessReview>(`/business/${businessId}/reviews`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  /**
   * Respond to review
   * POST /business/:businessId/reviews/:reviewId/respond
   */
  async respondToReview(businessId: string, reviewId: string, response: string) {
    return this.request<BusinessReview>(`/business/${businessId}/reviews/${reviewId}/respond`, {
      method: 'POST',
      body: JSON.stringify({ response }),
    });
  }

  /**
   * Get review stats
   * GET /business/:businessId/reviews/stats
   */
  async getReviewStats(businessId: string) {
    return this.request<{
      averageRating: number;
      totalReviews: number;
      ratingDistribution: {
        5: number;
        4: number;
        3: number;
        2: number;
        1: number;
      };
    }>(`/business/${businessId}/reviews/stats`);
  }

  // ==================== SOCIAL SERVICE API METHODS ====================

  /**
   * Posts API Methods
   */

  /**
   * Get posts with filtering and pagination
   * GET /social/posts
   */
  async getPosts(filters?: {
    page?: number;
    limit?: number;
    postType?: 'general' | 'event' | 'alert' | 'marketplace' | 'lost_found' | 'help';
    privacyLevel?: 'neighborhood' | 'group' | 'public';
    categoryId?: number;
    userId?: string;
    search?: string;
    startDate?: string;
    endDate?: string;
    isPinned?: boolean;
    isApproved?: boolean;
    sortBy?: 'createdAt' | 'updatedAt' | 'title';
    sortOrder?: 'ASC' | 'DESC';
    helpCategory?: 'errand' | 'task' | 'recommendation' | 'advice' | 'borrow';
    urgency?: 'low' | 'medium' | 'high';
  }) {
    const queryParams = new URLSearchParams();
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          queryParams.append(key, value.toString());
        }
      });
    }
    const queryString = queryParams.toString();
    return this.request(`/social/posts${queryString ? `?${queryString}` : ''}`);
  }

  /**
   * Get a single post by ID
   * GET /social/posts/:id
   */
  async getPostById(id: string) {
    return this.request(`/social/posts/${id}`);
  }

  /**
   * Create a new post
   * POST /social/posts
   */
  async createPost(data: {
    title?: string;
    content: string;
    postType: 'general' | 'event' | 'alert' | 'marketplace' | 'lost_found' | 'help';
    privacyLevel: 'neighborhood' | 'group' | 'public';
    categoryId?: number;
    expiresAt?: string;
    media?: Array<{ url: string; type: 'image' | 'video'; caption?: string }>;
    isPinned?: boolean;
    helpCategory?: 'errand' | 'task' | 'recommendation' | 'advice' | 'borrow';
    urgency?: 'low' | 'medium' | 'high';
    budget?: string;
    deadline?: string;
    borrowDuration?: 'few_hours' | 'day' | 'few_days' | 'week';
    borrowItem?: string;
    itemCondition?: string;
    taskType?: string;
    estimatedDuration?: string;
  }) {
    return this.request('/social/posts', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  /**
   * Update a post
   * PUT /social/posts/:id
   */
  async updatePost(id: string, data: {
    title?: string;
    content?: string;
    postType?: 'general' | 'event' | 'alert' | 'marketplace' | 'lost_found' | 'help';
    privacyLevel?: 'neighborhood' | 'group' | 'public';
    categoryId?: number;
    expiresAt?: string;
    media?: Array<{ url: string; type: 'image' | 'video'; caption?: string }>;
    isPinned?: boolean;
    helpCategory?: 'errand' | 'task' | 'recommendation' | 'advice' | 'borrow';
    urgency?: 'low' | 'medium' | 'high';
    budget?: string;
    deadline?: string;
  }) {
    return this.request(`/social/posts/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  /**
   * Delete a post
   * DELETE /social/posts/:id
   */
  async deletePost(id: string) {
    return this.request(`/social/posts/${id}`, {
      method: 'DELETE',
    });
  }

  /**
   * Pin or unpin a post
   * POST /social/posts/:id/pin
   */
  async pinPost(id: string, isPinned: boolean) {
    return this.request(`/social/posts/${id}/pin?isPinned=${isPinned}`, {
      method: 'POST',
    });
  }

  /**
   * Get post categories
   * GET /social/posts/categories
   */
  async getPostCategories() {
    try {
      const response = await this.request('/social/posts/categories');
      
      // Handle errors gracefully
      if (!response.success) {
        console.error('Failed to fetch post categories:', response.error);
        // Return empty array instead of failing completely
        return {
          success: true,
          data: [] as any[],
        };
      }
      
      return response;
    } catch (error) {
      console.error('Error fetching post categories:', error);
      // Return empty array on error to prevent UI crashes
      return {
        success: true,
        data: [] as any[],
      };
    }
  }

  /**
   * Comments API Methods
   */

  /**
   * Get comments for a post
   * GET /social/comments/posts/:postId
   */
  async getPostComments(postId: string) {
    return this.request(`/social/comments/posts/${postId}`);
  }

  /**
   * Create a comment on a post
   * POST /social/comments/posts/:postId
   */
  async createComment(postId: string, data: {
    content: string;
    parentCommentId?: string;
    media?: Array<{ url: string; type: 'image' | 'video'; caption?: string }>;
  }) {
    return this.request(`/social/comments/posts/${postId}`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  /**
   * Update a comment
   * PUT /social/comments/:commentId
   */
  async updateComment(commentId: string, data: {
    content: string;
  }) {
    return this.request(`/social/comments/${commentId}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  /**
   * Delete a comment
   * DELETE /social/comments/:commentId
   */
  async deleteComment(commentId: string) {
    return this.request(`/social/comments/${commentId}`, {
      method: 'DELETE',
    });
  }

  /**
   * Get replies to a comment
   * GET /social/comments/:commentId/replies
   */
  async getCommentReplies(commentId: string) {
    return this.request(`/social/comments/${commentId}/replies`);
  }

  /**
   * Get comment statistics for a post
   * GET /social/comments/posts/:postId/stats
   */
  async getCommentStats(postId: string) {
    return this.request(`/social/comments/posts/${postId}/stats`);
  }

  /**
   * Reactions API Methods
   */

  /**
   * Add or update reaction to a post
   * POST /social/reactions/posts/:postId
   */
  async addReaction(postId: string, reactionType: 'like' | 'love' | 'laugh' | 'angry' | 'sad') {
    return this.request(`/social/reactions/posts/${postId}`, {
      method: 'POST',
      body: JSON.stringify({ type: reactionType }),
    });
  }

  /**
   * Remove reaction from a post
   * DELETE /social/reactions/posts/:postId
   */
  async removeReaction(postId: string) {
    return this.request(`/social/reactions/posts/${postId}`, {
      method: 'DELETE',
    });
  }

  /**
   * Get all reactions for a post
   * GET /social/reactions/posts/:postId
   */
  async getPostReactions(postId: string) {
    return this.request(`/social/reactions/posts/${postId}`);
  }

  /**
   * Get reaction counts for a post
   * GET /social/reactions/posts/:postId/counts
   */
  async getPostReactionCounts(postId: string) {
    return this.request(`/social/reactions/posts/${postId}/counts`);
  }

  /**
   * Get reaction statistics for a post
   * GET /social/reactions/posts/:postId/stats
   */
  async getPostReactionStats(postId: string) {
    return this.request(`/social/reactions/posts/${postId}/stats`);
  }

  /**
   * Media API Methods
   */

  /**
   * Upload media files
   * POST /social/media/upload
   */
  async uploadMedia(files: File[], options?: {
    type?: string;
    caption?: string;
    quality?: string;
    maxWidth?: number;
    maxHeight?: number;
  }) {
    try {
      const url = `${this.baseUrl}/social/media/upload`;
      const token = typeof window !== 'undefined' ? localStorage.getItem('accessToken') : null;

      const formData = new FormData();
      files.forEach((file) => {
        formData.append('files', file);
      });
      if (options?.type) formData.append('type', options.type);
      if (options?.caption) formData.append('caption', options.caption);
      if (options?.quality) formData.append('quality', options.quality);
      if (options?.maxWidth) formData.append('maxWidth', options.maxWidth.toString());
      if (options?.maxHeight) formData.append('maxHeight', options.maxHeight.toString());

      const response = await fetch(url, {
        method: 'POST',
        headers: {
          ...(process.env.NODE_ENV === 'development' && {
            'ngrok-skip-browser-warning': '69420',
          }),
          ...(token && { Authorization: `Bearer ${token}` }),
        },
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        return {
          success: false,
          error: data.error || data.message || 'Upload failed',
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

  /**
   * Get media files with filtering
   * GET /social/media
   */
  async getMedia(filters?: {
    type?: string;
    userId?: string;
    limit?: number;
    offset?: number;
  }) {
    const queryParams = new URLSearchParams();
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          queryParams.append(key, value.toString());
        }
      });
    }
    const queryString = queryParams.toString();
    return this.request(`/social/media${queryString ? `?${queryString}` : ''}`);
  }

  /**
   * Get a single media file by ID
   * GET /social/media/:id
   */
  async getMediaById(id: string) {
    return this.request(`/social/media/${id}`);
  }

  /**
   * Delete a media file
   * DELETE /social/media/:id
   */
  async deleteMedia(id: string) {
    return this.request(`/social/media/${id}`, {
      method: 'DELETE',
    });
  }

  /**
   * Moderation API Methods
   */

  /**
   * Report content for moderation
   * POST /social/moderation/report/:contentType/:contentId
   */
  async reportContent(
    contentType: 'post' | 'comment',
    contentId: string,
    data: {
      reason: 'spam' | 'harassment' | 'inappropriate_content' | 'false_information' | 'hate_speech' | 'violence' | 'copyright_violation' | 'privacy_violation' | 'other';
      details?: string;
    }
  ) {
    return this.request(`/social/moderation/report/${contentType}/${contentId}`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }
}

export const apiClient = new ApiClient(API_BASE_URL);

