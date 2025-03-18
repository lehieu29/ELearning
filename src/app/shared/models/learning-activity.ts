// File path: src/app/shared/models/learning-activity.model.ts
export interface LearningActivity {
  id: string;
  userId: string;
  courseId: string;
  courseName: string;
  courseImage?: string;
  activityType: ActivityType;
  lessonId?: string;
  lessonName?: string;
  quizId?: string;
  quizName?: string;
  assignmentId?: string;
  assignmentName?: string;
  duration: number; // in minutes
  completedAt: Date | string;
  progress?: number; // as percentage
  score?: number;
  status: 'completed' | 'in-progress' | 'failed';
}

export type ActivityType = 
  'lesson_viewed' | 
  'lesson_completed' | 
  'quiz_attempted' | 
  'quiz_completed' |
  'assignment_submitted' | 
  'project_completed' | 
  'course_enrolled' | 
  'course_completed' |
  'discussion_participated' |
  'certificate_earned';

export interface ActivityFilters {
  startDate: Date | null;
  endDate: Date | null;
  courseId?: string;
  activityTypes?: ActivityType[];
  status?: 'completed' | 'in-progress' | 'failed' | 'all';
}

export interface ActivityStats {
  totalActivities: number;
  totalTimeSpent: number; // in minutes
  coursesCovered: number;
  lessonsCompleted: number;
  quizzesCompleted: number;
  assignmentsSubmitted: number;
}