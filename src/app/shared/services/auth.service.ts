import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, of, throwError } from 'rxjs';
import { catchError, map, tap } from 'rxjs/operators';
import { HttpService } from './http.service';

interface AuthResponse {
  token: string;
  user: {
    id: string;
    email: string;
    fullName: string;
  };
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly API_URL = 'https://api.example.com'; // Replace with your actual API URL
  private readonly TOKEN_KEY = 'auth_token';
  private readonly USER_KEY = 'user_data';

  constructor(private http: HttpService) { }

  login(email: string, password: string): Observable<boolean> {
    return this.http.post<AuthResponse>(`${this.API_URL}/auth/login`, { email, password })
      .pipe(
        tap(response => this.setSession(response)),
        map(() => true),
        catchError(this.handleError)
      );
  }

  register(fullName: string, email: string, password: string): Observable<boolean> {
    return this.http.post<AuthResponse>(`${this.API_URL}/auth/register`, { fullName, email, password })
      .pipe(
        map(() => true),
        catchError(this.handleError)
      );
  }

  logout(): void {
    localStorage.removeItem(this.TOKEN_KEY);
    localStorage.removeItem(this.USER_KEY);
  }

  isLoggedIn(): boolean {
    const token = this.getToken();
    // Check if token exists and not expired
    if (!token) {
      return false;
    }
    
    // Here you might want to add token expiration check
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      return payload.exp > Date.now() / 1000;
    } catch (e) {
      return false;
    }
  }

  getToken(): string | null {
    return localStorage.getItem(this.TOKEN_KEY);
  }

  getUserData(): any {
    const userData = localStorage.getItem(this.USER_KEY);
    return userData ? JSON.parse(userData) : null;
  }

  private setSession(authResult: AuthResponse): void {
    localStorage.setItem(this.TOKEN_KEY, authResult.token);
    localStorage.setItem(this.USER_KEY, JSON.stringify(authResult.user));
  }

  private handleError(error: HttpErrorResponse): Observable<never> {
    let errorMessage = 'An unknown error occurred';
    
    if (error.error instanceof ErrorEvent) {
      // Client-side error
      errorMessage = `Error: ${error.error.message}`;
    } else {
      // Server-side error
      switch (error.status) {
        case 401:
          errorMessage = 'Invalid credentials';
          break;
        case 409:
          errorMessage = 'Email already exists';
          break;
        case 422:
          errorMessage = 'Validation failed';
          break;
        case 500:
          errorMessage = 'Server error';
          break;
      }
    }
    
    console.error(errorMessage, error);
    return throwError(error);
  }
}