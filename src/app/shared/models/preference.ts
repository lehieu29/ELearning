// File path: src/app/shared/models/preference.model.ts

export interface UserPreference {
  id: string;
  userId: string;
  theme: ThemePreference;
  language: string;
  accessibility: AccessibilityPreference;
  contentPreferences: ContentPreference;
  displayPreferences: DisplayPreference;
  learningPreferences: LearningPreference;
  lastUpdated: Date;
}

export type ThemePreference = 'light' | 'dark' | 'system';

export interface AccessibilityPreference {
  fontSize: 'small' | 'medium' | 'large' | 'x-large';
  highContrast: boolean;
  reduceMotion: boolean;
  screenReader: boolean;
  closedCaptions: boolean;
  keyboardNavigation: boolean;
}

export interface ContentPreference {
  contentDifficulty: 'beginner' | 'intermediate' | 'advanced' | 'all';
  showCompletedContent: boolean;
  autoPlayVideos: boolean;
  defaultVideoQuality: 'auto' | '360p' | '480p' | '720p' | '1080p';
  defaultPlaybackSpeed: 0.5 | 0.75 | 1 | 1.25 | 1.5 | 1.75 | 2;
}

export interface DisplayPreference {
  dashboardLayout: 'standard' | 'compact' | 'detailed';
  showProgressBars: boolean;
  showTimeEstimates: boolean;
  showCompletionPercentages: boolean;
  defaultCourseView: 'grid' | 'list';
  defaultSortBy: 'recent' | 'title' | 'progress' | 'difficulty';
}

export interface LearningPreference {
  learningStyle: 'visual' | 'auditory' | 'reading' | 'kinesthetic' | 'mixed';
  preferredContentTypes: ContentType[];
  studyReminders: boolean;
  studyReminderFrequency: 'daily' | 'weekdays' | 'weekends' | 'custom';
  studySessionLength: number; // in minutes
  breakReminders: boolean;
  breakReminderInterval: number; // in minutes
}

export type ContentType = 'video' | 'reading' | 'quiz' | 'interactive' | 'project';

export interface PreferenceSaveResponse {
  success: boolean;
  message?: string;
  preference?: UserPreference;
}