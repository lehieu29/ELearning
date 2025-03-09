// src/app/shared/interceptor/api-url.interceptor.ts
import { Injectable } from '@angular/core';
import {
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpInterceptor
} from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '@environments/environment';

@Injectable()
export class ApiUrlInterceptor implements HttpInterceptor {
  constructor() { }

  intercept(request: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
    // Skip for absolute URLs
    if (request.url.startsWith('http') || request.url.startsWith('//')) {
      return next.handle(request);
    }

    // Skip for assets/local files
    if (request.url.startsWith('assets/') || request.url.startsWith('./')) {
      return next.handle(request);
    }

    // Prepend API base URL
    const apiReq = request.clone({
      url: `${environment.apiUrl}/${request.url.replace(/^\//, '')}`
    });

    return next.handle(apiReq);
  }
}