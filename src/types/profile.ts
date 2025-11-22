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

export enum LanguageProficiency {
  BEGINNER = 'beginner',
  INTERMEDIATE = 'intermediate',
  ADVANCED = 'advanced',
  NATIVE = 'native',
}

export interface UserLanguage {
  id: string;
  languageId: string;
  name: string;
  nativeName?: string;
  proficiency: LanguageProficiency;
}

export interface Language {
  id: string;
  name: string;
  nativeName: string;
  greeting?: string;
  description?: string;
  speakersCount?: number;
  regions?: string[];
  isMajor?: boolean;
}

export interface UserPrivacySettings {
  showCulturalBackground: boolean;
  showLanguages: boolean;
  showProfessionalCategory: boolean;
  showStateOfOrigin: boolean;
  allowCulturalMatching: boolean;
}

export interface CulturalProfile {
  id: string;
  userId: string;
  stateOfOrigin?: {
    id: string;
    name: string;
    region: string;
  };
  culturalBackground?: {
    id: string;
    name: string;
    region: string;
    description?: string;
  };
  professional?: {
    categoryId: string;
    category: string;
    title: string;
  };
  languages: UserLanguage[];
  privacySettings: UserPrivacySettings;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface ReferenceData {
  states: Array<{
    id: string;
    name: string;
    region: string;
    capital?: string;
    lgas?: string[];
    population?: number;
    areaSqKm?: number;
  }>;
  languages: Language[];
  culturalBackgrounds: CulturalBackground[];
  professionalCategories: ProfessionalCategory[];
}

export interface ProfileCompletion {
  percentage: number;
  missingFields: string[];
}

