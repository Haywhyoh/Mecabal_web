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
  [key: string]: any; // Allow additional properties
}

