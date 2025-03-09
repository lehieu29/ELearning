// src/app/shared/interceptor/loading.interceptor.ts
import { Injectable } from '@angular/core';
import {
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpInterceptor
} from '@angular/common/http';
import { Observable } from 'rxjs';
import { finalize } from 'rxjs/operators';
import { LoadingService } from '../services/loading.service'; // Assuming you have a loading service

@Injectable()
export class LoadingInterceptor implements HttpInterceptor {
  private totalRequests = 0;
  
  constructor(private loadingService: LoadingService) {}

  intercept(request: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
    // Skip showing loader for specific endpoints
    if (this.shouldSkip(request.url)) {
      return next.handle(request);
    }
    
    this.totalRequests++;
    this.loadingService.setLoading(true);
    
    return next.handle(request).pipe(
      finalize(() => {
        this.totalRequests--;
        if (this.totalRequests === 0) {
          this.loadingService.setLoading(false);
        }
      })
    );
  }
  
  private shouldSkip(url: string): boolean {
    // Add URLs that shouldn't trigger the loading indicator
    const skipUrls = [
      '/api/heartbeat',
      '/api/analytics',
      '/api/user/activity',
      '/api/notifications/check'
    ];
    
    return skipUrls.some(skipUrl => url.includes(skipUrl));
  }
}