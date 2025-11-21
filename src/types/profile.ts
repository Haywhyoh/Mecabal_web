/**
 * Profile type definitions
 */

export interface CulturalBackground {
  id: string;
  name: string;
  region?: string;
  description?: string;
  traditions?: any;
  populationEstimate?: number;
}

export interface ProfessionalCategory {
  id: string;
  category: string;
  titles: string[];
  icon?: string;
  displayOrder?: number;
}

