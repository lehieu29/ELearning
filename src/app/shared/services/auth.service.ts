import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, of, throwError } from 'rxjs';
import { catchError, map, tap } from 'rxjs/operators';
import { Router } from '@angular/router';
import { HttpService } from './http.service';
import { User } from '../models/user.model';
import { AuthResponse, LoginRequest, RegisterRequest } from '../models/auth.model';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly TOKEN_KEY = 'auth_token';
  private readonly REFRESH_TOKEN_KEY = 'refresh_token';
  private readonly USER_KEY = 'user_data';
  
  private currentUserSubject = new BehaviorSubject<User | null>(null);
  public currentUser$ = this.currentUserSubject.asObservable();
  
  constructor(
    private http: HttpService,
    private router: Router
  ) {
    this.loadUserFromStorage();
  }
  
  /**
   * Tải thông tin người dùng từ localStorage khi khởi tạo service
   */
  private loadUserFromStorage(): void {
    const userData = localStorage.getItem(this.USER_KEY);
    if (userData) {
      try {
        const user = JSON.parse(userData);
        this.currentUserSubject.next(user);
      } catch (e) {
        localStorage.removeItem(this.USER_KEY);
      }
    }
  }
  
  /**
   * Đăng nhập người dùng
   * @param credentials Thông tin đăng nhập (email và mật khẩu)
   * @returns Observable chứa thông tin người dùng sau khi đăng nhập thành công
   */
  login(credentials: LoginRequest): Observable<User> {
    return this.http.post<AuthResponse>('auth/login', credentials).pipe(
      tap(response => this.handleAuthResponse(response)),
      map(response => response.user),
      catchError(error => {
        console.error('Đăng nhập thất bại', error);
        return throwError(() => new Error(error.error?.message || 'Đăng nhập thất bại'));
      })
    );
  }
  
  /**
   * Đăng ký tài khoản mới
   * @param userData Thông tin đăng ký (họ tên, email, mật khẩu)
   * @returns Observable chứa thông tin người dùng sau khi đăng ký thành công
   */
  register(userData: RegisterRequest): Observable<User> {
    return this.http.post<AuthResponse>('auth/register', userData).pipe(
      tap(response => this.handleAuthResponse(response)),
      map(response => response.user),
      catchError(error => {
        console.error('Đăng ký thất bại', error);
        return throwError(() => new Error(error.error?.message || 'Đăng ký thất bại'));
      })
    );
  }
  
  /**
   * Đăng xuất người dùng
   */
  logout(): void {
    // Gọi API đăng xuất nếu cần
    this.http.post('auth/logout', {}).subscribe({
      next: () => this.handleLogout(),
      error: () => this.handleLogout()
    });
  }
  
  /**
   * Xử lý đăng xuất - xóa thông tin người dùng khỏi localStorage và chuyển hướng về trang đăng nhập
   */
  private handleLogout(): void {
    localStorage.removeItem(this.TOKEN_KEY);
    localStorage.removeItem(this.REFRESH_TOKEN_KEY);
    localStorage.removeItem(this.USER_KEY);
    this.currentUserSubject.next(null);
    this.router.navigate(['/auth/login']);
  }
  
  /**
   * Làm mới token xác thực
   * @returns Observable chứa token mới
   */
  refreshToken(): Observable<string> {
    const refreshToken = localStorage.getItem(this.REFRESH_TOKEN_KEY);
    
    if (!refreshToken) {
      return throwError(() => new Error('Không có refresh token'));
    }
    
    return this.http.post<AuthResponse>('auth/refresh-token', { refreshToken }).pipe(
      tap(response => this.handleAuthResponse(response)),
      map(response => response.token),
      catchError(error => {
        this.handleLogout();
        return throwError(() => new Error('Phiên đăng nhập hết hạn'));
      })
    );
  }
  
  /**
   * Gửi yêu cầu khôi phục mật khẩu
   * @param email Email đăng nhập
   * @returns Observable kết quả thành công hay thất bại
   */
  forgotPassword(email: string): Observable<boolean> {
    return this.http.post<{ success: boolean }>('auth/forgot-password', { email }).pipe(
      map(response => response.success),
      catchError(error => {
        return throwError(() => new Error(error.error?.message || 'Không thể gửi hướng dẫn khôi phục mật khẩu'));
      })
    );
  }
  
  /**
   * Đặt lại mật khẩu mới
   * @param token Token xác thực từ email khôi phục
   * @param newPassword Mật khẩu mới
   * @returns Observable kết quả thành công hay thất bại
   */
  resetPassword(token: string, newPassword: string): Observable<boolean> {
    return this.http.post<{ success: boolean }>('auth/reset-password', { token, newPassword }).pipe(
      map(response => response.success),
      catchError(error => {
        return throwError(() => new Error(error.error?.message || 'Không thể đặt lại mật khẩu'));
      })
    );
  }
  
  /**
   * Thay đổi mật khẩu của người dùng đã đăng nhập
   * @param oldPassword Mật khẩu cũ
   * @param newPassword Mật khẩu mới
   * @returns Observable kết quả thành công hay thất bại
   */
  changePassword(oldPassword: string, newPassword: string): Observable<boolean> {
    return this.http.post<{ success: boolean }>('auth/change-password', { oldPassword, newPassword }).pipe(
      map(response => response.success),
      catchError(error => {
        return throwError(() => new Error(error.error?.message || 'Không thể thay đổi mật khẩu'));
      })
    );
  }
  
  /**
   * Kiểm tra người dùng đã đăng nhập hay chưa
   * @returns true nếu đã đăng nhập, false nếu chưa
   */
  isLoggedIn(): boolean {
    return !!this.getToken() && !!this.currentUserSubject.value;
  }
  
  /**
   * Lấy token xác thực từ localStorage
   * @returns Token xác thực hoặc null nếu chưa đăng nhập
   */
  getToken(): string | null {
    return localStorage.getItem(this.TOKEN_KEY);
  }
  
  /**
   * Lấy thông tin người dùng hiện tại
   * @returns Thông tin người dùng hoặc null nếu chưa đăng nhập
   */
  getUserData(): User | null {
    return this.currentUserSubject.value;
  }
  
  /**
   * Kiểm tra người dùng có quyền được chỉ định hay không
   * @param role Quyền cần kiểm tra
   * @returns true nếu có quyền, false nếu không
   */
  hasRole(role: string): boolean {
    const user = this.currentUserSubject.value;
    return user ? user.roles.includes(role) : false;
  }
  
  /**
   * Cập nhật thông tin người dùng
   * @param userData Thông tin cần cập nhật
   * @returns Observable chứa thông tin người dùng sau khi cập nhật
   */
  updateUserProfile(userData: Partial<User>): Observable<User> {
    return this.http.put<User>('user/profile', userData).pipe(
      tap(updatedUser => {
        const currentUser = this.currentUserSubject.value;
        if (currentUser) {
          const mergedUser = { ...currentUser, ...updatedUser };
          localStorage.setItem(this.USER_KEY, JSON.stringify(mergedUser));
          this.currentUserSubject.next(mergedUser);
        }
      }),
      catchError(error => {
        return throwError(() => new Error(error.error?.message || 'Không thể cập nhật thông tin'));
      })
    );
  }
  
  /**
   * Xử lý phản hồi xác thực từ server
   * @param response Phản hồi xác thực từ server
   */
  private handleAuthResponse(response: AuthResponse): void {
    localStorage.setItem(this.TOKEN_KEY, response.token);
    localStorage.setItem(this.REFRESH_TOKEN_KEY, response.refreshToken);
    localStorage.setItem(this.USER_KEY, JSON.stringify(response.user));
    this.currentUserSubject.next(response.user);
  }
}