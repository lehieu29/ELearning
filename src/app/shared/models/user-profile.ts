// File path: src/app/features/profile/models/user-profile.model.ts
export interface UserProfile {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  avatar?: string;
  phoneNumber?: string;
  title?: string;
  company?: string;
  location?: {
    country: string;
    city?: string;
  };
  biography?: string;
  websiteUrl?: string;
  createdAt: Date;
  updatedAt: Date;
  preferences?: {
    language: string;
    timezone: string;
    receiveEmails: boolean;
    darkMode: boolean;
  };
}

export interface ProfileUpdateResponse {
  success: boolean;
  message: string;
  user?: UserProfile;
  errors?: any;
}