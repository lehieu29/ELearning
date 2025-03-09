// src/app/shared/interceptor/retry.interceptor.ts
import { Injectable } from '@angular/core';
import {
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpInterceptor,
  HttpErrorResponse
} from '@angular/common/http';
import { Observable, throwError, timer } from 'rxjs';
import { retryWhen, mergeMap, finalize } from 'rxjs/operators';

@Injectable()
export class RetryInterceptor implements HttpInterceptor {
  constructor() { }

  intercept(request: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
    // Only retry GET requests
    if (request.method !== 'GET') {
      return next.handle(request);
    }

    return next.handle(request).pipe(
      retryWhen(errors =>
        errors.pipe(
          mergeMap((error, index) => {
            // Max 3 retries
            const retryAttempt = index + 1;

            // If max retries reached or not an error we want to retry on, throw error
            if (
              retryAttempt > 3 ||
              error.status === 400 ||
              error.status === 401 ||
              error.status === 403 ||
              error.status === 404
            ) {
              return throwError(() => error);
            }

            console.log(`Retry attempt ${retryAttempt} for ${request.url}`);

            // Exponential backoff: 1s, 2s, 4s
            const retryDelay = retryAttempt * 1000;
            return timer(retryDelay);
          }),
          finalize(() => console.log(`Done retrying ${request.url}`))
        )
      )
    );
  }
}