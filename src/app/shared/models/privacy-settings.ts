// File path: src/app/shared/models/privacy-settings.model.ts

export interface PrivacySettings {
  id: string;
  userId: string;
  profileVisibility: ProfileVisibilityLevel;
  dataSharing: DataSharingPreferences;
  cookiePreferences: CookiePreferences;
  marketingConsent: boolean;
  learningActivitySharing: LearningActivitySharingLevel;
  lastUpdated: Date;
}

export enum ProfileVisibilityLevel {
  PUBLIC = 'public',         // Visible to everyone
  CONNECTIONS = 'connections', // Visible to connections only
  PRIVATE = 'private'        // Visible to only yourself
}

export enum LearningActivitySharingLevel {
  ALL = 'all',              // Share all learning activities
  ACHIEVEMENTS_ONLY = 'achievements_only', // Share only achievements
  NONE = 'none'             // Don't share any learning activity
}

export interface DataSharingPreferences {
  shareWithPartners: boolean;        // Share with educational partners
  shareWithEmployers: boolean;       // Share with potential employers
  shareForResearch: boolean;         // Share for educational research
  shareForPersonalization: boolean;  // Share for personalized learning
}

export interface CookiePreferences {
  allowEssential: boolean;           // Always true, can't be disabled
  allowAnalytics: boolean;           // Allow analytics cookies
  allowFunctional: boolean;          // Allow functional cookies
  allowAdvertising: boolean;         // Allow advertising cookies
}

export interface DataExportRequest {
  id: string;
  userId: string;
  requestDate: Date;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  dataUrl?: string;
  expirationDate?: Date;
}

export interface DataDeletionRequest {
  id: string;
  userId: string;
  requestDate: Date;
  status: 'pending' | 'processing' | 'completed' | 'rejected';
  rejectionReason?: string;
  completionDate?: Date;
}