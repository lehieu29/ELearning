// File path: src/app/shared/models/resume.model.ts

export interface Resume {
  id?: string;
  userId: string;
  title: string;
  createdAt: Date;
  updatedAt: Date;
  isPublished: boolean;
  templateId: string;
  sections: ResumeSection[];
  personalInfo: PersonalInfo;
  contactInfo: ContactInfo;
  socialLinks: SocialLink[];
  summary: string;
}

export interface PersonalInfo {
  firstName: string;
  lastName: string;
  jobTitle: string;
  photo?: string;
}

export interface ContactInfo {
  email: string;
  phone?: string;
  location?: string;
  website?: string;
}

export interface SocialLink {
  platform: 'linkedin' | 'github' | 'twitter' | 'other';
  url: string;
  customLabel?: string;
}

export interface ResumeSection {
  id: string;
  type: ResumeSectionType;
  title: string;
  order: number;
  isVisible: boolean;
  items: ResumeSectionItem[];
}

export type ResumeSectionType = 
  'education' | 
  'experience' | 
  'skills' | 
  'projects' | 
  'courses' | 
  'certificates' | 
  'custom';

export interface ResumeSectionItem {
  id: string;
  title: string;
  subtitle?: string;
  startDate?: Date | string;
  endDate?: Date | string;
  isCurrent?: boolean;
  description?: string;
  location?: string;
  url?: string;
  tags?: string[];
  courseId?: string;
  certificateId?: string;
}

export interface EducationItem extends ResumeSectionItem {
  degree: string;
  institution: string;
  fieldOfStudy?: string;
  gpa?: string;
}

export interface ExperienceItem extends ResumeSectionItem {
  company: string;
  position: string;
  responsibilities: string[];
}

export interface SkillItem extends ResumeSectionItem {
  proficiency?: number; // 1-5 or percentage
  category?: string;
}

export interface ProjectItem extends ResumeSectionItem {
  role?: string;
  technologies?: string[];
  courseId?: string;
}

export interface CourseItem extends ResumeSectionItem {
  provider: string;
  completionDate?: Date | string;
  skills?: string[];
}

export interface CertificateItem extends ResumeSectionItem {
  issuer: string;
  credentialId?: string;
  issueDate: Date | string;
  expirationDate?: Date | string;
}

export interface ResumeTemplate {
  id: string;
  name: string;
  previewImage: string;
  description: string;
  category: 'simple' | 'professional' | 'creative' | 'modern';
  isPremium: boolean;
}

export interface ResumeExportOptions {
  format: 'pdf' | 'docx' | 'txt' | 'json';
  includePhoto: boolean;
  colorScheme?: string;
  fontFamily?: string;
  fontSize?: string;
}