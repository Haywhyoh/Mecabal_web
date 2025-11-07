/**
 * Neighborhood type definitions
 */

export interface Neighborhood {
  id: string;
  name: string;
  type: 'AREA' | 'ESTATE' | 'COMMUNITY';
  description?: string;
  isGated?: boolean;
  boundaries?: {
    type: 'Polygon';
    coordinates: number[][][];
  };
  centerLatitude?: number;
  centerLongitude?: number;
  radiusMeters?: number;
  createdBy?: string;
  createdAt?: string;
  lga?: {
    id?: string;
    name: string;
  };
  memberCount?: number;
  [key: string]: any; // Allow additional properties
}

