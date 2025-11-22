/**
 * Business type definitions
 */

export enum ServiceArea {
  ESTATE_ONLY = 'estate-only',
  NEIGHBORHOOD = 'neighborhood',
  DISTRICT = 'district',
  CITY_WIDE = 'city-wide',
  STATE_WIDE = 'state-wide',
  // Legacy values for backward compatibility
  TWO_KM = '2km',
  FIVE_KM = '5km',
  TEN_KM = '10km',
  NATIONWIDE = 'nationwide',
}

export enum PricingModel {
  FIXED_RATE = 'fixed-rate',
  HOURLY_RATE = 'hourly-rate',
  PROJECT_BASED = 'project-based',
  NEGOTIABLE = 'negotiable',
  // Legacy values for backward compatibility
  HOURLY = 'hourly',
  PER_ITEM = 'per-item',
  CUSTOM_QUOTE = 'custom-quote',
}

export enum Availability {
  BUSINESS_HOURS = 'business-hours',
  EXTENDED_HOURS = 'extended-hours',
  WEEKEND_AVAILABLE = 'weekend-available',
  TWENTY_FOUR_SEVEN = 'twenty-four-seven',
  FLEXIBLE = 'flexible',
  // Legacy values for backward compatibility
  WEEKDAYS = 'weekdays',
  WEEKENDS = 'weekends',
  CUSTOM = 'custom',
}

export enum InquiryStatus {
  PENDING = 'pending',
  IN_PROGRESS = 'in-progress',
  RESPONDED = 'responded',
  CLOSED = 'closed',
}

export interface BusinessProfile {
  id: string;
  userId: string;
  businessName: string;
  description?: string;
  category: string;
  subcategory?: string;
  serviceArea: ServiceArea | string;
  pricingModel: PricingModel | string;
  availability: Availability | string;
  phoneNumber?: string;
  whatsappNumber?: string;
  businessAddress?: string;
  latitude?: number;
  longitude?: number;
  state?: string;
  city?: string;
  yearsOfExperience: number;
  isVerified: boolean;
  verificationLevel?: 'basic' | 'enhanced' | 'premium';
  profileImageUrl?: string;
  coverImageUrl?: string;
  rating: number | null;
  reviewCount: number;
  completedJobs: number;
  hasInsurance: boolean;
  isActive: boolean;
  paymentMethods?: string[];
  businessHours?: Record<string, { open: string; close: string }>;
  responseTime?: number;
  joinedDate?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface BusinessService {
  id: string;
  businessId: string;
  serviceName: string;
  description?: string;
  priceMin?: number;
  priceMax?: number;
  duration?: string;
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface BusinessInquiry {
  id: string;
  businessId: string;
  customerId: string;
  serviceType?: string;
  subject?: string;
  message: string;
  urgency?: 'low' | 'normal' | 'high' | 'urgent';
  budgetMin?: number;
  budgetMax?: number;
  preferredContact?: 'call' | 'message' | 'whatsapp';
  status: InquiryStatus | string;
  phone?: string;
  email?: string;
  response?: string;
  respondedAt?: string;
  createdAt: string;
  updatedAt?: string;
}

export interface BusinessReview {
  id: string;
  businessId: string;
  userId: string;
  userName?: string;
  userAvatar?: string;
  rating: number;
  comment: string;
  serviceType?: string;
  response?: string;
  respondedAt?: string;
  createdAt: string;
  updatedAt?: string;
}

export interface BusinessCategory {
  id: string;
  name: string;
  description?: string;
  icon?: string;
  color?: string;
  subcategories?: string[];
}

export interface BusinessFilter {
  page?: number;
  limit?: number;
  category?: string;
  serviceArea?: string;
  search?: string;
  latitude?: number;
  longitude?: number;
  radius?: number;
  minRating?: number;
  isVerified?: boolean;
  hasInsurance?: boolean;
  sortBy?: 'rating' | 'distance' | 'recent' | 'completedJobs';
  sortOrder?: 'ASC' | 'DESC';
}

export interface PaginatedBusinesses {
  data: BusinessProfile[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

export interface CreateBusinessProfileDto {
  businessName: string;
  description?: string;
  category: string;
  subcategory?: string;
  serviceArea: ServiceArea | string;
  pricingModel: PricingModel | string;
  availability: Availability | string;
  phoneNumber?: string;
  whatsappNumber?: string;
  businessAddress?: string;
  latitude?: number;
  longitude?: number;
  state?: string;
  city?: string;
  yearsOfExperience: number;
  paymentMethods?: string[];
  hasInsurance?: boolean;
}

export interface UpdateBusinessProfileDto extends Partial<CreateBusinessProfileDto> {}

export interface CreateBusinessServiceDto {
  serviceName: string;
  description?: string;
  priceMin?: number;
  priceMax?: number;
  duration?: string;
  isActive?: boolean;
}

export interface UpdateBusinessServiceDto extends Partial<CreateBusinessServiceDto> {}

