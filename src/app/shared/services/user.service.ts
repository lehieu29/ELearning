import { Injectable } from '@angular/core';
import { Observable, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { HttpService } from './http.service';
import { User } from '../models/user.model';
import { UserProfile, UserPreferences } from '../models/user.model';
import { ApiResponse } from '../models/api.model';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  constructor(private http: HttpService) {}
  
  /**
   * Lấy thông tin chi tiết hồ sơ người dùng
   * @returns Observable chứa thông tin hồ sơ người dùng
   */
  getUserProfile(): Observable<UserProfile> {
    return this.http.get<ApiResponse<UserProfile>>('user/profile').pipe(
      map(response => {
        if (!response.data) {
          throw new Error('Không tìm thấy hồ sơ người dùng');
        }
        return response.data;
      }),
      catchError(error => {
        return throwError(() => new Error(error.error?.message || 'Không thể tải hồ sơ người dùng'));
      })
    );
  }
  
  /**
   * Cập nhật thông tin hồ sơ người dùng
   * @param profileData Thông tin cần cập nhật
   * @returns Observable chứa thông tin hồ sơ sau khi cập nhật
   */
  updateProfile(profileData: Partial<UserProfile>): Observable<UserProfile> {
    return this.http.put<ApiResponse<UserProfile>>('user/profile', profileData).pipe(
      map(response => {
        if (!response.data) {
          throw new Error('Không thể cập nhật hồ sơ');
        }
        return response.data;
      }),
      catchError(error => {
        return throwError(() => new Error(error.error?.message || 'Không thể cập nhật hồ sơ'));
      })
    );
  }
  
  /**
   * Tải lên ảnh đại diện mới
   * @param file File ảnh đại diện
   * @returns Observable chứa URL ảnh đại diện mới
   */
  uploadProfilePicture(file: File): Observable<{ avatarUrl: string }> {
    const formData = new FormData();
    formData.append('avatar', file);
    
    return this.http.post<ApiResponse<{ avatarUrl: string }>>('user/profile/avatar', formData).pipe(
      map(response => {
        if (!response.data) {
          throw new Error('Không thể tải lên ảnh đại diện');
        }
        return response.data;
      }),
      catchError(error => {
        return throwError(() => new Error(error.error?.message || 'Không thể tải lên ảnh đại diện'));
      })
    );
  }
  
  /**
   * Lấy tùy chọn cá nhân của người dùng
   * @returns Observable chứa thông tin tùy chọn cá nhân
   */
  getUserPreferences(): Observable<UserPreferences> {
    return this.http.get<ApiResponse<UserPreferences>>('user/preferences').pipe(
      map(response => {
        if (!response.data) {
          throw new Error('Không tìm thấy tùy chọn cá nhân');
        }
        return response.data;
      }),
      catchError(error => {
        return throwError(() => new Error(error.error?.message || 'Không thể tải tùy chọn cá nhân'));
      })
    );
  }
  
  /**
   * Cập nhật tùy chọn cá nhân
   * @param preferences Thông tin tùy chọn cần cập nhật
   * @returns Observable chứa thông tin tùy chọn sau khi cập nhật
   */
  updatePreferences(preferences: Partial<UserPreferences>): Observable<UserPreferences> {
    return this.http.put<ApiResponse<UserPreferences>>('user/preferences', preferences).pipe(
      map(response => {
        if (!response.data) {
          throw new Error('Không thể cập nhật tùy chọn');
        }
        return response.data;
      }),
      catchError(error => {
        return throwError(() => new Error(error.error?.message || 'Không thể cập nhật tùy chọn cá nhân'));
      })
    );
  }
  
  /**
   * Xóa tài khoản người dùng
   * @returns Observable kết quả thành công hay thất bại
   */
  deleteAccount(): Observable<boolean> {
    return this.http.delete<ApiResponse<{ success: boolean }>>('user/account').pipe(
      map(response => response.data?.success || false),
      catchError(error => {
        return throwError(() => new Error(error.error?.message || 'Không thể xóa tài khoản'));
      })
    );
  }
  
  /**
   * Lấy thông tin hồ sơ công khai của người dùng khác
   * @param userId ID của người dùng cần xem
   * @returns Observable chứa thông tin hồ sơ công khai
   */
  getPublicProfile(userId: string): Observable<Partial<UserProfile>> {
    return this.http.get<ApiResponse<Partial<UserProfile>>>(`users/${userId}/profile`).pipe(
      map(response => {
        if (!response.data) {
          throw new Error('Không tìm thấy hồ sơ người dùng');
        }
        return response.data;
      }),
      catchError(error => {
        return throwError(() => new Error(error.error?.message || 'Không thể tải hồ sơ công khai'));
      })
    );
  }
}