// src/app/shared/models/resource.model.ts
export interface Resource {
  id: string;
  courseId: string;
  title: string;
  description?: string;
  type: 'document' | 'video' | 'link' | 'code' | 'dataset' | 'other';
  url: string;
  fileSize?: number; // In bytes
  fileType?: string;
  thumbnailUrl?: string;
  tags?: string[];
  isDownloadable: boolean;
  isRequired: boolean;
  createdAt: Date | string;
  updatedAt?: Date | string;
}