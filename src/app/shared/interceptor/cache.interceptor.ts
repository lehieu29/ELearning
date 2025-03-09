// src/app/shared/interceptor/cache.interceptor.ts
import { Injectable } from '@angular/core';
import {
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpInterceptor,
  HttpResponse
} from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { tap, shareReplay } from 'rxjs/operators';

interface CacheEntry {
  response: HttpResponse<any>;
  entryTime: number;
}

@Injectable()
export class CacheInterceptor implements HttpInterceptor {
  private cache = new Map<string, CacheEntry>();
  private maxAge = 5 * 60 * 1000; // 5 minutes cache

  constructor() { }

  intercept(request: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
    // Only cache GET requests
    if (request.method !== 'GET') {
      return next.handle(request);
    }

    // Skip caching for certain endpoints
    if (this.skipCache(request.url)) {
      return next.handle(request);
    }

    // Check if we have a cached response
    const cachedResponse = this.getFromCache(request.url);
    if (cachedResponse) {
      return of(cachedResponse);
    }

    // No cached response, get from network
    return next.handle(request).pipe(
      tap(event => {
        if (event instanceof HttpResponse) {
          this.addToCache(request.url, event);
        }
      }),
      // Use shareReplay to handle parallel requests for same URL
      shareReplay(1)
    );
  }

  private addToCache(url: string, response: HttpResponse<any>): void {
    this.cleanCache();

    const entry: CacheEntry = {
      response: response.clone(),
      entryTime: Date.now()
    };

    this.cache.set(url, entry);
  }

  private getFromCache(url: string): HttpResponse<any> | null {
    const entry = this.cache.get(url);

    if (!entry) {
      return null;
    }

    // Check if the entry is expired
    const isExpired = Date.now() - entry.entryTime > this.maxAge;

    if (isExpired) {
      this.cache.delete(url);
      return null;
    }

    return entry.response;
  }

  private cleanCache(): void {
    const currentTime = Date.now();

    this.cache.forEach((entry, key) => {
      if (currentTime - entry.entryTime > this.maxAge) {
        this.cache.delete(key);
      }
    });
  }

  private skipCache(url: string): boolean {
    // Add URLs that should not be cached
    const skipList = [
      '/api/user/profile',
      '/api/notifications',
      '/api/analytics'
    ];

    return skipList.some(skipUrl => url.includes(skipUrl));
  }
}