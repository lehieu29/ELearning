// File path: src/app/shared/models/goal.model.ts

export interface Goal {
  id: string;
  userId: string;
  title: string;
  description?: string;
  category: GoalCategory;
  type: GoalType;
  status: GoalStatus;
  priority: GoalPriority;
  progress: number; // 0-100
  createdAt: Date;
  targetDate?: Date;
  completedAt?: Date;
  tasks?: GoalTask[];
  relatedCourseIds?: string[];
  relatedSkills?: string[];
  metrics?: GoalMetric[];
}

export interface GoalTask {
  id: string;
  title: string;
  completed: boolean;
  dueDate?: Date;
}

export interface GoalMetric {
  id: string;
  name: string;
  targetValue: number;
  currentValue: number;
  unit: string;
}

export type GoalCategory = 
  'career' | 
  'skills' | 
  'certification' | 
  'course' | 
  'project' | 
  'personal';

export type GoalType = 
  'completion' | 
  'mastery' | 
  'habit' | 
  'milestone';

export type GoalStatus = 
  'not_started' | 
  'in_progress' | 
  'completed' | 
  'overdue' | 
  'paused';

export type GoalPriority = 
  'high' | 
  'medium' | 
  'low';

export interface GoalStatistics {
  totalGoals: number;
  completedGoals: number;
  inProgressGoals: number;
  notStartedGoals: number;
  overdueGoals: number;
  completionRate: number;
}

export interface GoalFilter {
  category?: GoalCategory;
  status?: GoalStatus;
  priority?: GoalPriority;
  timeframe?: 'all' | 'this_week' | 'this_month' | 'this_quarter' | 'this_year' | 'overdue';
  search?: string;
}