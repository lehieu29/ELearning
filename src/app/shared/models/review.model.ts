// src/app/shared/models/review.model.ts
export interface Review {
    id: string;
    courseId: string;
    userId: string;
    userName: string;
    userAvatar?: string;
    rating: number;
    title?: string;
    content: string;
    createdAt: Date | string;
    updatedAt?: Date | string;
    helpful: number;
    responses?: ReviewResponse[];
}

export interface ReviewResponse {
    id: string;
    reviewId: string;
    userId: string;
    userName: string;
    userRole: 'instructor' | 'admin' | 'student';
    content: string;
    createdAt: Date | string;
}

export interface RatingBreakdown {
    average: number;
    count: number;
    distribution: {
        '5': number;
        '4': number;
        '3': number;
        '2': number;
        '1': number;
    };
}