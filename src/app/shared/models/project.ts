// src/app/shared/models/project.model.ts
export interface Project {
  id: string;
  courseId: string;
  title: string;
  description: string;
  requirements: string;
  rubric: ProjectRubric[];
  dueDate: Date | string;
  submissionTypes: ('code' | 'document' | 'image' | 'link' | 'video')[];
  maxFileSize: number; // In bytes
  allowedFileExtensions: string[];
  maxSubmissions: number;
  allowResubmission: boolean;
  status: 'draft' | 'published' | 'archived';
  createdAt: Date | string;
  updatedAt: Date | string;
}

export interface ProjectRubric {
  id: string;
  title: string;
  description: string;
  maxPoints: number;
  criteria: string[];
}