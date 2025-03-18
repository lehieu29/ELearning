// src/app/shared/models/note.model.ts
export interface Note {
    id: string;
    courseId: string;
    userId: string;
    lessonId?: string;
    title: string;
    content: string;
    tags?: string[];
    color?: string;
    pinned: boolean;
    createdAt: Date | string;
    updatedAt: Date | string;
}