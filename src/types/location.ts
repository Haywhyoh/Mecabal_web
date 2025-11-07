/**
 * Location type definitions
 */

export interface State {
  id: string;
  name: string;
  code: string;
  [key: string]: any; // Allow additional properties
}

export interface LGA {
  id: string;
  name: string;
  code?: string;
  type?: 'LGA' | 'LCDA';
  stateId?: string;
  [key: string]: any; // Allow additional properties
}

export interface Ward {
  id: string;
  name: string;
  lgaId?: string;
  [key: string]: any; // Allow additional properties
}

