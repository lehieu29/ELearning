// src/app/shared/interceptor/error.interceptor.ts
import { Injectable } from '@angular/core';
import {
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpInterceptor,
  HttpErrorResponse
} from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { ToastService } from '../services/toast.service'; // Assuming you have a toast service

@Injectable()
export class ErrorInterceptor implements HttpInterceptor {
  constructor(private toastService: ToastService) {}

  intercept(request: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
    return next.handle(request).pipe(
      catchError((error: HttpErrorResponse) => {
        let errorMessage = 'An unknown error occurred';
        
        // Don't show error for canceled requests - fix for the type error
        if ((error as any)?.name === 'CanceledError') {
          return throwError(() => error);
        }
        
        // Client-side error
        if (error.error instanceof ErrorEvent) {
          errorMessage = `Error: ${error.error.message}`;
        } 
        // Server-side error
        else {
          // Custom error handling based on status code
          switch (error.status) {
            case 400: // Bad request
              errorMessage = error.error?.message || 'Bad request';
              break;
            case 401: // Unauthorized
              errorMessage = 'Session expired. Please login again.';
              break;
            case 403: // Forbidden
              errorMessage = 'You do not have permission to access this resource';
              break;
            case 404: // Not found
              errorMessage = 'Resource not found';
              break;
            case 422: // Unprocessable entity (validation errors)
              errorMessage = this.formatValidationErrors(error.error?.errors) || 'Validation error';
              break;
            case 429: // Too many requests
              errorMessage = 'Too many requests. Please try again later.';
              break;
            case 500: // Server error
              errorMessage = 'Internal server error. Please try again later.';
              break;
            case 503: // Service unavailable
              errorMessage = 'Service temporarily unavailable. Please try again later.';
              break;
            default:
              errorMessage = `Error ${error.status}: ${error.error?.message || error.statusText}`;
          }
        }
        
        // Don't show error toast for specific endpoints
        if (!this.shouldSuppressToast(request.url)) {
          this.toastService.error(errorMessage);
        }
        
        // Log error to console in development mode
        console.error('HTTP Error:', error);
        
        return throwError(() => error);
      })
    );
  }
  
  private formatValidationErrors(errors: any): string {
    if (!errors) return null;
    
    if (typeof errors === 'string') {
      return errors;
    }
    
    // Handle array of errors
    if (Array.isArray(errors)) {
      return errors.join('. ');
    }
    
    // Handle object of errors
    if (typeof errors === 'object') {
      return Object.values(errors)
        .map(err => Array.isArray(err) ? err.join('. ') : err)
        .join('. ');
    }
    
    return null;
  }
  
  private shouldSuppressToast(url: string): boolean {
    // Add URLs for which you don't want to show error toasts
    const suppressList = [
      '/api/heartbeat',
      '/api/analytics'
    ];
    
    return suppressList.some(suppressUrl => url.includes(suppressUrl));
  }
}