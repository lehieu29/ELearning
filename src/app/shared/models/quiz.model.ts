// src/app/shared/models/quiz.model.ts
export interface Quiz {
    id: string;
    lessonId: string;
    title: string;
    description?: string;
    timeLimit?: number; // in minutes, undefined for no limit
    passingScore: number;
    maxAttempts?: number; // undefined for unlimited
    randomizeQuestions: boolean;
    showAnswers: boolean;
    questions: Question[];
}

export type QuestionType = 'multiple-choice' | 'single-choice' | 'true-false' | 'fill-blank' | 'matching' | 'essay';

export interface Question {
    id: string;
    content: string;
    type: QuestionType;
    points: number;
    options?: QuestionOption[];
    correctAnswer?: string | string[]; // Depends on question type
    explanation?: string;
}

export interface QuestionOption {
    id: string;
    content: string;
    isCorrect?: boolean;
}

export interface QuizAttempt {
    id: string;
    quizId: string;
    userId: string;
    startedAt: Date | string;
    completedAt?: Date | string;
    timeSpent?: number; // in seconds
    score: number;
    maxScore: number;
    passed: boolean;
    answers: QuizAnswer[];
}

export interface QuizAnswer {
    questionId: string;
    answer: string | string[];
    isCorrect: boolean;
    points: number;
    feedback?: string;
}