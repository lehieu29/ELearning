import { Attachment } from "./course.model";

// src/app/shared/models/assignment.model.ts
export interface Assignment {
    id: string;
    lessonId: string;
    title: string;
    description: string;
    dueDate?: Date | string;
    totalPoints: number;
    rubric?: RubricItem[];
    attachments?: Attachment[];
    submissionTypes: ('text' | 'file' | 'link')[];
    maxFileSize?: number; // in MB
    allowedFileTypes?: string[]; // e.g. ['pdf', 'doc', 'jpg']
}

export interface RubricItem {
    id: string;
    criterion: string;
    description: string;
    maxPoints: number;
}

export interface AssignmentSubmission {
    id: string;
    assignmentId: string;
    userId: string;
    submittedAt: Date | string;
    content?: string;
    files?: SubmissionFile[];
    links?: string[];
    status: 'submitted' | 'graded' | 'returned';
    grade?: number;
    feedback?: string;
    rubricScores?: RubricScore[];
}

export interface SubmissionFile {
    id: string;
    name: string;
    type: string;
    size: number;
    url: string;
}

export interface RubricScore {
    rubricItemId: string;
    score: number;
    feedback?: string;
}