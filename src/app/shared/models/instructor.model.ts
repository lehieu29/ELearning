// src/app/shared/models/instructor.model.ts
export interface Instructor {
    id: string;
    fullName: string;
    avatar: string;
    bio: string;
    expertise: string[];
    rating: number;
    coursesCount: number;
    studentsCount: number;
    socialLinks?: {
        website?: string;
        github?: string;
        linkedin?: string;
        twitter?: string;
    };
}

export interface InstructorStats {
    totalStudents: number;
    totalCourses: number;
    totalRevenue: number;
    averageRating: number;
    reviewsCount: number;
    popularCourses: {
        courseId: string;
        title: string;
        studentsCount: number;
        revenue: number;
    }[];
    monthlyEnrollments: {
        month: string;
        enrollments: number;
    }[];
}