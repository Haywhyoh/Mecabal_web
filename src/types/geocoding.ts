/**
 * Geocoding type definitions
 */

export interface ReverseGeocodeResponse {
  state?: string;
  lga?: string;
  city?: string;
  formattedAddress?: string;
  [key: string]: any; // Allow additional properties
}

