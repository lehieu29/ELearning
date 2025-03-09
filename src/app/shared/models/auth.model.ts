import { User } from "./user.model";

// src/app/shared/models/auth.model.ts
export interface LoginRequest {
    email: string;
    password: string;
    rememberMe?: boolean;
}

export interface RegisterRequest {
    fullName: string;
    email: string;
    password: string;
    termsAccepted: boolean;
}

export interface AuthResponse {
    token: string;
    refreshToken: string;
    user: User;
    expiresIn: number;
}

export interface PasswordResetRequest {
    email: string;
}

export interface PasswordChangeRequest {
    oldPassword: string;
    newPassword: string;
}