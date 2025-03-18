import { Injectable } from '@angular/core';
import { Observable, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { HttpService } from './http.service';
import { 
  UserPreference, 
  PreferenceSaveResponse 
} from '../models/preference.model';
import { environment } from '@environments/environment';

@Injectable({
  providedIn: 'root'
})
export class PreferenceService extends HttpService {
  
  /**
   * Lấy tùy chọn cá nhân hóa của người dùng
   * Get user's personalization preferences
   * @returns Observable chứa thông tin tùy chọn người dùng
   */
  getUserPreferences(): Observable<UserPreference> {
    return this.get<UserPreference>(`${environment.apiUrl}/users/preferences`)
      .pipe(
        catchError(error => {
          console.error('Lỗi khi tải tùy chọn người dùng:', error);
          return throwError(() => new Error('Không thể tải tùy chọn cá nhân hóa. Vui lòng thử lại sau.'));
        })
      );
  }

  /**
   * Cập nhật tùy chọn cá nhân hóa của người dùng
   * Update user's personalization preferences
   * @param preferences Tùy chọn cá nhân hóa được cập nhật
   * @returns Observable thông báo kết quả cập nhật
   */
  updateUserPreferences(preferences: Partial<UserPreference>): Observable<PreferenceSaveResponse> {
    return this.patch<PreferenceSaveResponse>(`${environment.apiUrl}/users/preferences`, preferences)
      .pipe(
        catchError(error => {
          console.error('Lỗi khi cập nhật tùy chọn người dùng:', error);
          return throwError(() => new Error('Không thể cập nhật tùy chọn cá nhân hóa. Vui lòng thử lại sau.'));
        })
      );
  }

  /**
   * Đặt lại tùy chọn cá nhân hóa về giá trị mặc định
   * Reset personalization preferences to default values
   * @param section Phần cụ thể cần đặt lại, hoặc tất cả nếu không chỉ định
   * @returns Observable thông báo kết quả đặt lại
   */
  resetPreferences(section?: string): Observable<PreferenceSaveResponse> {
    const endpoint = section 
      ? `${environment.apiUrl}/users/preferences/reset?section=${section}`
      : `${environment.apiUrl}/users/preferences/reset`;
    
    return this.post<PreferenceSaveResponse>(endpoint, {})
      .pipe(
        catchError(error => {
          console.error('Lỗi khi đặt lại tùy chọn người dùng:', error);
          return throwError(() => new Error('Không thể đặt lại tùy chọn cá nhân hóa. Vui lòng thử lại sau.'));
        })
      );
  }

  /**
   * Đồng bộ tùy chọn người dùng giữa các thiết bị
   * Sync user preferences across devices
   * @returns Observable thông báo kết quả đồng bộ
   */
  syncPreferencesAcrossDevices(): Observable<PreferenceSaveResponse> {
    return this.post<PreferenceSaveResponse>(`${environment.apiUrl}/users/preferences/sync`, {})
      .pipe(
        catchError(error => {
          console.error('Lỗi khi đồng bộ tùy chọn giữa các thiết bị:', error);
          return throwError(() => new Error('Không thể đồng bộ tùy chọn giữa các thiết bị. Vui lòng thử lại sau.'));
        })
      );
  }

  /**
   * Xuất tùy chọn người dùng dưới dạng file cấu hình
   * Export user preferences as a configuration file
   * @returns Observable chứa nội dung file cấu hình
   */
  exportPreferences(): Observable<Blob> {
    return this.get(`${environment.apiUrl}/users/preferences/export`, 
      { responseType: 'blob' }
    ).pipe(
      catchError(error => {
        console.error('Lỗi khi xuất tùy chọn người dùng:', error);
        return throwError(() => new Error('Không thể xuất tùy chọn cá nhân hóa. Vui lòng thử lại sau.'));
      })
    );
  }

  /**
   * Nhập tùy chọn người dùng từ file cấu hình
   * Import user preferences from a configuration file
   * @param file File cấu hình cần nhập
   * @returns Observable thông báo kết quả nhập
   */
  importPreferences(file: File): Observable<PreferenceSaveResponse> {
    const formData = new FormData();
    formData.append('file', file);

    return this.post<PreferenceSaveResponse>(`${environment.apiUrl}/users/preferences/import`, formData)
      .pipe(
        catchError(error => {
          console.error('Lỗi khi nhập tùy chọn người dùng:', error);
          return throwError(() => new Error('Không thể nhập tùy chọn cá nhân hóa. Vui lòng thử lại sau.'));
        })
      );
  }
}
