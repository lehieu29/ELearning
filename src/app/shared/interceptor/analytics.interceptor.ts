// src/app/shared/interceptor/analytics.interceptor.ts
import { Injectable } from '@angular/core';
import {
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpInterceptor,
  HttpResponse
} from '@angular/common/http';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { AnalyticsService } from '../services/analytics.service'; // Assuming you have an analytics service

@Injectable()
export class AnalyticsInterceptor implements HttpInterceptor {
  constructor(private analyticsService: AnalyticsService) { }

  intercept(request: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
    // Don't track certain endpoints
    if (this.shouldSkip(request.url)) {
      return next.handle(request);
    }

    const startTime = Date.now();

    return next.handle(request).pipe(
      tap({
        next: (event) => {
          if (event instanceof HttpResponse) {
            const endTime = Date.now();
            const duration = endTime - startTime;
            const size = this.getResponseSize(event);

            // Track API usage
            this.analyticsService.trackApiUsage({
              url: request.url,
              method: request.method,
              statusCode: event.status,
              duration,
              size,
              timestamp: new Date().toISOString()
            });
          }
        },
        error: (error) => {
          const endTime = Date.now();
          const duration = endTime - startTime;

          // Track API error
          this.analyticsService.trackApiError({
            url: request.url,
            method: request.method,
            statusCode: error.status,
            message: error.message,
            duration,
            timestamp: new Date().toISOString()
          });
        }
      })
    );
  }

  private shouldSkip(url: string): boolean {
    // Skip analytics/heartbeat endpoints to avoid recursion and noise
    const skipList = [
      '/api/analytics',
      '/api/heartbeat',
      '/api/log'
    ];

    return skipList.some(skipUrl => url.includes(skipUrl));
  }

  private getResponseSize(response: HttpResponse<any>): number {
    // Estimate response size in bytes
    const body = response.body ? JSON.stringify(response.body) : '';
    return body.length;
  }
}