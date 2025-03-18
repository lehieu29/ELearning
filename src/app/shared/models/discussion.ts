// src/app/shared/models/discussion.model.ts
export interface Discussion {
  id: string;
  courseId: string;
  title: string;
  content: string;
  authorId: string;
  authorName: string;
  authorAvatar?: string;
  isPinned: boolean;
  isLocked: boolean;
  viewCount: number;
  commentCount: number;
  lastActivityAt: Date | string;
  createdAt: Date | string;
  updatedAt: Date | string;
  tags?: string[];
}

export interface Comment {
  id: string;
  discussionId: string;
  parentId?: string; // For threaded comments
  authorId: string;
  authorName: string;
  authorAvatar?: string;
  content: string;
  mentionedUsers?: string[]; // User IDs mentioned in comment
  isInstructor: boolean;
  isBestAnswer: boolean;
  upvotes: number;
  createdAt: Date | string;
  updatedAt?: Date | string;
  replies?: Comment[]; // For threaded display
}