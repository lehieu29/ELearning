import { Instructor } from "./instructor.model";

// src/app/shared/models/course.model.ts
export interface Course {
    id: string;
    title: string;
    subtitle?: string;
    description: string;
    thumbnail: string;
    level: 'beginner' | 'intermediate' | 'advanced' | 'all-levels';
    category: string;
    subcategory?: string;
    tags: string[];
    duration: number; // in minutes
    price: number;
    discountPrice?: number;
    rating: number;
    reviewsCount: number;
    studentsCount: number;
    language: string;
    instructors: Instructor[];
    createdAt: Date | string;
    updatedAt: Date | string;
    status: 'draft' | 'published' | 'archived';
    featured: boolean;
    requirements: string[];
    outcomes: string[];
    syllabus: CourseSyllabus;
}

export interface CourseSyllabus {
    sections: CourseSection[];
    totalLessons: number;
    totalDuration: number; // in minutes
}

export interface CourseSection {
    id: string;
    title: string;
    description?: string;
    order: number;
    lessons: Lesson[];
    duration: number; // in minutes
}

export interface Lesson {
    id: string;
    title: string;
    description?: string;
    order: number;
    type: 'video' | 'reading' | 'quiz' | 'assignment' | 'discussion';
    duration: number; // in minutes
    isPreview: boolean;
    status: 'locked' | 'available' | 'completed';
    contentUrl?: string;
    videoUrl?: string;
    attachments?: Attachment[];
}

export interface Attachment {
    id: string;
    title: string;
    type: 'pdf' | 'image' | 'file' | 'link';
    url: string;
    size?: number; // in bytes
}

export interface CourseProgress {
    courseId: string;
    userId: string;
    completedLessons: string[]; // Lesson IDs
    progress: number; // Percentage
    lastAccessedLessonId?: string;
    startedAt: Date | string;
    completedAt?: Date | string;
    certificateId?: string;
    quizScores: QuizScore[];
}

export interface QuizScore {
    quizId: string;
    score: number;
    maxScore: number;
    passed: boolean;
    attempts: number;
    completedAt: Date | string;
}