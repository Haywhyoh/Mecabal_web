/**
 * User type definitions
 */

export interface User {
  id: string;
  email?: string;
  firstName?: string;
  lastName?: string;
  phoneNumber?: string;
  isVerified?: boolean;
  phoneVerified?: boolean;
  primaryLocationId?: string;
  // Profile fields
  stateOfOriginId?: string;
  culturalBackgroundId?: string;
  professionalCategoryId?: string;
  professionalTitle?: string;
  occupation?: string;
  [key: string]: any; // Allow additional properties
}

