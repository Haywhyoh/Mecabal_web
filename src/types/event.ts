/**
 * Events Type Definitions
 * Matching backend DTOs from events-service
 */

// ==================== INTERFACES ====================

export interface EventLocation {
  name: string;
  address: string;
  latitude: number;
  longitude: number;
  landmark?: string;
}

export interface EventMedia {
  id: string;
  url: string;
  type: 'image' | 'video';
  caption?: string;
  displayOrder: number;
}

export interface EventCategory {
  id: number;
  name: string;
  icon: string;
  colorCode: string;
  description?: string;
}

export interface EventOrganizer {
  id: string;
  firstName: string;
  lastName: string;
  fullName: string;
  profilePictureUrl?: string;
  trustScore: number;
  isVerified: boolean;
  phoneNumber?: string;
}

export interface Event {
  id: string;
  title: string;
  description: string;
  eventDate: string; // YYYY-MM-DD format
  startTime: string; // HH:mm format
  endTime?: string; // HH:mm format
  timezone: string;
  location: EventLocation;
  isFree: boolean;
  price?: number;
  currency: string;
  formattedPrice: string;
  maxAttendees?: number;
  allowGuests: boolean;
  requireVerification: boolean;
  ageRestriction?: string;
  languages: string[];
  isPrivate: boolean;
  coverImageUrl?: string;
  status: 'draft' | 'published' | 'cancelled' | 'completed';
  viewsCount: number;
  attendeesCount: number;
  specialRequirements?: string;
  createdAt: string;
  updatedAt: string;
  category: EventCategory;
  organizer: EventOrganizer;
  media: EventMedia[];
  userRsvpStatus?: 'going' | 'maybe' | 'not_going';
  canRsvp: boolean;
  isAtCapacity: boolean;
  isUpcoming: boolean;
  isToday: boolean;
  durationString?: string;
}

// ==================== DTOs ====================

export interface CreateEventDto {
  categoryId: number;
  title: string;
  description: string;
  eventDate: string; // YYYY-MM-DD
  startTime: string; // HH:mm
  endTime?: string; // HH:mm
  location: EventLocation;
  isFree: boolean;
  price?: number;
  maxAttendees?: number;
  allowGuests?: boolean;
  requireVerification?: boolean;
  ageRestriction?: string;
  languages?: string[];
  isPrivate?: boolean;
  coverImageUrl?: string;
  media?: EventMediaDto[];
  specialRequirements?: string;
}

export interface EventMediaDto {
  url: string;
  type: 'image' | 'video';
  caption?: string;
  displayOrder?: number;
}

export interface UpdateEventDto extends Partial<CreateEventDto> {}

export interface EventFilterDto {
  page?: number;
  limit?: number;
  categoryId?: number;
  status?: 'draft' | 'published' | 'cancelled' | 'completed';
  search?: string;
  dateFrom?: string; // YYYY-MM-DD
  dateTo?: string; // YYYY-MM-DD
  neighborhoodId?: string;
  isFree?: boolean;
  sortBy?: 'createdAt' | 'eventDate' | 'attendeesCount';
  sortOrder?: 'ASC' | 'DESC';
}

export interface RsvpDto {
  rsvpStatus: 'going' | 'maybe' | 'not_going';
  guestsCount?: number;
}

export interface AttendeeFilterDto {
  page?: number;
  limit?: number;
  rsvpStatus?: 'going' | 'maybe' | 'not_going';
  search?: string;
}

// ==================== RESPONSE TYPES ====================

export interface PaginatedResponse<T> {
  data: T[];
  meta: PaginationMeta;
}

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

export interface EventAttendee {
  id: string;
  rsvpStatus: 'going' | 'maybe' | 'not_going';
  guestsCount: number;
  rsvpAt: string;
  checkedIn: boolean;
  checkedInAt?: string;
  user: {
    id: string;
    firstName: string;
    lastName: string;
    fullName: string;
    profilePictureUrl?: string;
    trustScore: number;
    isVerified: boolean;
  };
}

// ==================== EVENT CATEGORIES ====================

export const EVENT_CATEGORIES: EventCategory[] = [
  { id: 1, name: 'Religious Services', icon: 'church', colorCode: '#7B68EE' },
  { id: 2, name: 'Cultural Festivals', icon: 'party-popper', colorCode: '#FF6B35' },
  { id: 3, name: 'Community Events', icon: 'account-group', colorCode: '#4CAF50' },
  { id: 4, name: 'Sports & Fitness', icon: 'dumbbell', colorCode: '#FF9800' },
  { id: 5, name: 'Educational', icon: 'school', colorCode: '#2196F3' },
  { id: 6, name: 'Business & Networking', icon: 'briefcase', colorCode: '#9C27B0' },
  { id: 7, name: 'Entertainment', icon: 'music', colorCode: '#E91E63' },
  { id: 8, name: 'Food & Dining', icon: 'food', colorCode: '#FF5722' },
  { id: 9, name: 'Health & Wellness', icon: 'heart-pulse', colorCode: '#00BCD4' },
  { id: 10, name: 'Technology', icon: 'laptop', colorCode: '#607D8B' },
];

