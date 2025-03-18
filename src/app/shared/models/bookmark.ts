// src/app/shared/models/bookmark.model.ts
export interface Bookmark {
    id: string;
    courseId: string;
    userId: string;
    contentId: string;
    contentType: 'lesson' | 'quiz' | 'assignment' | 'resource' | 'other';
    title: string;
    timestamp?: number; // For video bookmarks
    note?: string;
    createdAt: Date | string;
    updatedAt?: Date | string;
}