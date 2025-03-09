// src/app/shared/models/certificate.model.ts
export interface Certificate {
    id: string;
    userId: string;
    courseId: string;
    courseName: string;
    userName: string;
    instructors: string[];
    issueDate: Date | string;
    expiryDate?: Date | string;
    url: string;
    imageUrl: string;
    verificationCode: string;
    metadata?: {
        duration?: string;
        skills?: string[];
        grade?: string;
    };
}