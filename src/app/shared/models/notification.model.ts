// src/app/shared/models/notification.model.ts
export interface Notification {
    id: string;
    userId: string;
    type: NotificationType;
    title: string;
    message: string;
    data?: NotificationData;
    isRead: boolean;
    createdAt: Date | string;
    expiresAt?: Date | string;
    priority?: 'low' | 'medium' | 'high';
    channel?: ('email' | 'push' | 'in-app')[];
}

export type NotificationType =
    'course_update' |
    'assignment_reminder' |
    'assignment_graded' |
    'discussion_reply' |
    'certificate_issued' |
    'announcement' |
    'enrollment_confirmed' |
    'quiz_graded' |
    'message_received' |
    'deadline_approaching' |
    'new_course_available' |
    'course_completed' |
    'payment_success' |
    'payment_failed' |
    'system';

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

export interface NotificationPreferences {
    userId: string;
    channels: {
        email: boolean;
        push: boolean;
        inApp: boolean;
    };
    categories: {
        [key in NotificationType]?: {
            enabled: boolean;
            channels?: ('email' | 'push' | 'in-app')[];
        };
    };
    quiet_hours?: {
        enabled: boolean;
        start: string; // 24h format, e.g. "22:00"
        end: string; // 24h format, e.g. "08:00"
        exceptions?: NotificationType[]; // Notification types that override quiet hours
    };
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