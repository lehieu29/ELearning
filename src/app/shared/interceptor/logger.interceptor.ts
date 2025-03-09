// src/app/shared/interceptor/logger.interceptor.ts
import { Injectable } from '@angular/core';
import {
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpInterceptor,
  HttpResponse,
  HttpErrorResponse
} from '@angular/common/http';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { environment } from '@environments/environment';

@Injectable()
export class LoggerInterceptor implements HttpInterceptor {
  constructor() { }

  intercept(request: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
    // Only log in development
    if (environment.production) {
      return next.handle(request);
    }

    const startTime = Date.now();
    let status: string;

    return next.handle(request).pipe(
      tap({
        next: (event) => {
          if (event instanceof HttpResponse) {
            status = 'succeeded';
            const endTime = Date.now();
            const duration = endTime - startTime;
            console.log(`%c${request.method} ${request.urlWithParams}`, 'color: green',
              `\nStatus: ${event.status} ${status} in ${duration}ms`,
              `\nResponse:`, event.body);
          }
        },
        error: (error: HttpErrorResponse) => {
          status = 'failed';
          const endTime = Date.now();
          const duration = endTime - startTime;
          console.log(`%c${request.method} ${request.urlWithParams}`, 'color: red',
            `\nStatus: ${error.status} ${status} in ${duration}ms`,
            `\nResponse:`, error.message);
        }
      })
    );
  }
}