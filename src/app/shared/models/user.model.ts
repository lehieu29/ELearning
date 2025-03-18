// src/app/shared/models/user.model.ts
export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  profileImage?: string;
  biography?: string;
  jobTitle?: string;
  company?: string;
  location?: string;
  phone?: string;
  website?: string;
  timeZone?: string;
  language?: string;
  interests?: string[];
  skills?: {
    name: string;
    level: 'beginner' | 'intermediate' | 'advanced' | 'expert';
  }[];
  isProfilePublic: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface UserProfileUpdateRequest {
  firstName?: string;
  lastName?: string;
  biography?: string;
  jobTitle?: string;
  company?: string;
  location?: string;
  phone?: string;
  website?: string;
  timeZone?: string;
  language?: string;
  interests?: string[];
  isProfilePublic?: boolean;
}

export interface UserPreferences {
    emailNotifications: boolean;
    pushNotifications: boolean;
    darkMode: boolean;
    language: string;
    timeZone: string;
}

export interface UserStats {
    coursesEnrolled: number;
    coursesCompleted: number;
    certificatesEarned: number;
    totalLearningHours: number;
    averageScore: number;
    streakDays: number;
}

export interface UserProfile extends User {
    stats: UserStats;
    socialLinks?: {
        website?: string;
        github?: string;
        linkedin?: string;
        twitter?: string;
    };
}