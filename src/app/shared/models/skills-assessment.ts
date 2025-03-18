// File path: src/app/shared/models/skills-assessment.model.ts

export interface Skill {
  id: string;
  name: string;
  category: string;
  proficiencyLevel: number; // 0-100
  lastAssessedDate?: Date;
  description?: string;
  relevantCourses?: RelevantCourse[];
}

export interface SkillCategory {
  id: string;
  name: string;
  description?: string;
  skills?: Skill[];
  iconClass?: string;
}

export interface Assessment {
  id: string;
  title: string;
  description: string;
  skillCategory: string;
  questionCount: number;
  estimatedTimeMinutes: number;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  skills: string[]; // skill IDs
  completionStatus?: 'not-started' | 'in-progress' | 'completed';
  completedDate?: Date;
  score?: number;
}

export interface RelevantCourse {
  id: string;
  title: string;
  skillRelevance: number; // 0-100
  level: 'beginner' | 'intermediate' | 'advanced';
  enrolled?: boolean;
}

export interface AssessmentQuestion {
  id: string;
  text: string;
  type: 'multiple-choice' | 'coding' | 'true-false';
  options?: string[];
  correctAnswer?: string | string[];
  codeLanguage?: string;
  codeTemplate?: string;
  timeSeconds?: number;
}

export interface AssessmentResult {
  assessmentId: string;
  completedDate: Date;
  overallScore: number;
  skillResults: {
    skillId: string;
    skillName: string;
    score: number;
    recommendations?: string[];
  }[];
}