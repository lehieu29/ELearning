import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, retry } from 'rxjs/operators';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class HttpService {
  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) { }

  /**
   * Configures the HTTP headers for requests
   */
  private getHttpHeaders(): HttpHeaders {
    return new HttpHeaders({
      'Content-Type': 'application/json',
      'Accept': 'application/json'
      // Add any additional headers here, such as authorization
      // 'Authorization': `Bearer ${this.authService.getToken()}`
    });
  }

  /**
   * Handles HTTP errors
   */
  private handleError(error: any) {
    let errorMessage = '';
    if (error.error instanceof ErrorEvent) {
      // Client-side error
      errorMessage = `Error: ${error.error.message}`;
    } else {
      // Server-side error
      errorMessage = `Error Code: ${error.status}\nMessage: ${error.message}`;
    }
    console.error(errorMessage);
    return throwError(() => new Error(errorMessage));
  }

  /**
   * Performs a GET request
   * @param endpoint The API endpoint
   * @param params Optional query parameters
   * @returns Observable with the response data
   */
  get<T>(endpoint: string, params?: any): Observable<T> {
    const options = {
      headers: this.getHttpHeaders(),
      params: new HttpParams({ fromObject: params || {} })
    };

    return this.http.get<T>(`${this.apiUrl}/${endpoint}`, options)
      .pipe(
        retry(1),
        catchError(this.handleError)
      );
  }

  /**
   * Performs a POST request
   * @param endpoint The API endpoint
   * @param data The data to send in the request body
   * @returns Observable with the response data
   */
  post<T>(endpoint: string, data: any): Observable<T> {
    return this.http.post<T>(`${this.apiUrl}/${endpoint}`, data, {
      headers: this.getHttpHeaders()
    }).pipe(
      catchError(this.handleError)
    );
  }

  /**
   * Performs a PUT request
   * @param endpoint The API endpoint
   * @param data The data to send in the request body
   * @returns Observable with the response data
   */
  put<T>(endpoint: string, data: any): Observable<T> {
    return this.http.put<T>(`${this.apiUrl}/${endpoint}`, data, {
      headers: this.getHttpHeaders()
    }).pipe(
      catchError(this.handleError)
    );
  }

  /**
   * Performs a DELETE request
   * @param endpoint The API endpoint
   * @returns Observable with the response data
   */
  delete<T>(endpoint: string): Observable<T> {
    return this.http.delete<T>(`${this.apiUrl}/${endpoint}`, {
      headers: this.getHttpHeaders()
    }).pipe(
      catchError(this.handleError)
    );
  }

  /**
   * Performs a PATCH request
   * @param endpoint The API endpoint
   * @param data The data to send in the request body
   * @returns Observable with the response data
   */
  patch<T>(endpoint: string, data: any): Observable<T> {
    return this.http.patch<T>(`${this.apiUrl}/${endpoint}`, data, {
      headers: this.getHttpHeaders()
    }).pipe(
      catchError(this.handleError)
    );
  }
}