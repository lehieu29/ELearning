// src/app/shared/models/notification.model.ts
export interface Notification {
    id: string;
    userId: string;
    title: string;
    message: string;
    type: NotificationType;
    isRead: boolean;
    createdAt: Date;
    link?: string;
    metadata?: Record<string, any>;
}

export type NotificationType =
    'course_update' |
    'assignment_reminder' |
    'assignment_graded' |
    'certificate_issued' |
    'forum_reply' |
    'forum_mention' |
    'system_announcement' |
    'promotion' |
    'achievement' |
    'account_security';

export interface NotificationPreferences {
    id: string;
    userId: string;
    emailNotifications: boolean;
    pushNotifications: boolean;
    browserNotifications: boolean;
    categories: NotificationCategoryPreference[];
}

export interface NotificationCategoryPreference {
    type: NotificationType;
    email: boolean;
    push: boolean;
    browser: boolean;
}

export interface NotificationData {
    // Common fields
    actionUrl?: string;
    imageUrl?: string;

    // Course related
    courseId?: string;
    courseName?: string;

    // Lesson related
    lessonId?: string;
    lessonName?: string;

    // Assignment related
    assignmentId?: string;
    assignmentName?: string;
    dueDate?: Date | string;
    grade?: number;

    // Discussion related
    discussionId?: string;
    discussionTitle?: string;
    replyId?: string;
    authorName?: string;

    // Quiz related
    quizId?: string;
    quizName?: string;
    score?: number;

    // Certificate related
    certificateId?: string;

    // Payment related
    paymentId?: string;
    amount?: number;
    currency?: string;

    // User related
    fromUserId?: string;
    fromUserName?: string;
    fromUserAvatar?: string;

    // Custom data
    [key: string]: any;
}

export interface NotificationStats {
    userId: string;
    totalCount: number;
    unreadCount: number;
    categories: {
        [key in NotificationType]?: number;
    };
}

export interface NotificationBatch {
    notifications: Notification[];
    totalCount: number;
    unreadCount: number;
}