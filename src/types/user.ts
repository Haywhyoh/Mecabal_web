/**
 * User type definitions
 */

export interface User {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  phoneNumber?: string;
  profilePictureUrl?: string;
  dateOfBirth?: string | Date;
  gender?: 'male' | 'female' | 'other';
  isVerified: boolean;
  phoneVerified: boolean;
  identityVerified?: boolean;
  addressVerified?: boolean;
  trustScore?: number;
  verificationLevel?: string;
  verificationBadge?: string;
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
  primaryLocationId?: string;
  // Profile fields
  stateOfOriginId?: string;
  culturalBackgroundId?: string;
  professionalCategoryId?: string;
  professionalTitle?: string;
  isActive?: boolean;
  memberSince?: Date;
  lastLoginAt?: Date;
  createdAt?: Date;
  updatedAt?: Date;
  // Computed properties
  fullName?: string;
  locationString?: string;
  joinDate?: string;
  profileCompleteness?: number;
  [key: string]: any; // Allow additional properties
}

