// src/app/shared/models/discussion.model.ts
export interface DiscussionThread {
    id: string;
    courseId: string;
    lessonId?: string;
    title: string;
    content: string;
    author: {
        id: string;
        name: string;
        avatar?: string;
        role: 'student' | 'instructor' | 'admin';
    };
    createdAt: Date | string;
    updatedAt?: Date | string;
    pinnedBy?: string;
    isPinned: boolean;
    upvotes: number;
    repliesCount: number;
    viewsCount: number;
    tags?: string[];
    status: 'open' | 'answered' | 'closed';
}

export interface DiscussionReply {
    id: string;
    threadId: string;
    content: string;
    author: {
        id: string;
        name: string;
        avatar?: string;
        role: 'student' | 'instructor' | 'admin';
    };
    createdAt: Date | string;
    updatedAt?: Date | string;
    isAnswer: boolean;
    upvotes: number;
    parentReplyId?: string;
}