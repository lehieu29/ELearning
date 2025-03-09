// src/app/shared/models/api.model.ts
export interface ApiResponse<T> {
    success: boolean;
    data?: T;
    error?: ApiError;
    pagination?: PaginationInfo;
}

export interface ApiError {
    code: string;
    message: string;
    details?: any;
}

export interface PaginationInfo {
    currentPage: number;
    totalPages: number;
    pageSize: number;
    totalItems: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
}

export interface QueryParams {
    page?: number;
    limit?: number;
    sort?: string;
    order?: 'asc' | 'desc';
    search?: string;
    filter?: any;
    include?: string[];
}