// src/app/shared/models/user.model.ts
export interface User {
    id: string;
    email: string;
    fullName: string;
    avatar?: string;
    bio?: string;
    roles: string[];
    joinDate: Date | string;
    lastActive?: Date | string;
    isVerified: boolean;
    preferences?: UserPreferences;
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