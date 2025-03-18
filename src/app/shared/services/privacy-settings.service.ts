import { Injectable } from '@angular/core';
import { Observable, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { HttpService } from './http.service';
import { environment } from '@environments/environment';
import { 
  PrivacySettings, 
  DataExportRequest, 
  DataDeletionRequest 
} from '../models/privacy-settings.model';

@Injectable({
  providedIn: 'root'
})
export class PrivacySettingsService extends HttpService {
  private readonly API_BASE_URL = `${environment.apiUrl}/users/me/privacy`;

  /**
   * Lấy cài đặt quyền riêng tư của người dùng hiện tại
   * Get privacy settings for the current user
   */
  getPrivacySettings(): Observable<PrivacySettings> {
    return this.get<PrivacySettings>(this.API_BASE_URL)
      .pipe(
        map(response => ({
          ...response,
          lastUpdated: new Date(response.lastUpdated)
        })),
        catchError(error => {
          console.error('Lỗi khi lấy cài đặt quyền riêng tư:', error);
          return throwError(() => new Error('Không thể lấy cài đặt quyền riêng tư. Vui lòng thử lại sau.'));
        })
      );
  }

  /**
   * Cập nhật tất cả cài đặt quyền riêng tư của người dùng
   * Update all privacy settings for the user
   * @param settings Cài đặt quyền riêng tư cần cập nhật
   */
  updatePrivacySettings(settings: Partial<PrivacySettings>): Observable<PrivacySettings> {
    return this.patch<PrivacySettings>(this.API_BASE_URL, settings)
      .pipe(
        map(response => ({
          ...response,
          lastUpdated: new Date(response.lastUpdated)
        })),
        catchError(error => {
          console.error('Lỗi khi cập nhật cài đặt quyền riêng tư:', error);
          return throwError(() => new Error('Không thể cập nhật cài đặt quyền riêng tư. Vui lòng thử lại sau.'));
        })
      );
  }

  /**
   * Cập nhật mức độ hiển thị của hồ sơ người dùng
   * Update user profile visibility level
   * @param visibilityLevel Mức độ hiển thị mới
   */
  updateProfileVisibility(visibilityLevel: string): Observable<PrivacySettings> {
    return this.patch<PrivacySettings>(`${this.API_BASE_URL}/profile-visibility`, { profileVisibility: visibilityLevel })
      .pipe(
        map(response => ({
          ...response,
          lastUpdated: new Date(response.lastUpdated)
        })),
        catchError(error => {
          console.error('Lỗi khi cập nhật mức độ hiển thị hồ sơ:', error);
          return throwError(() => new Error('Không thể cập nhật mức độ hiển thị hồ sơ. Vui lòng thử lại sau.'));
        })
      );
  }

  /**
   * Cập nhật cài đặt chia sẻ dữ liệu
   * Update data sharing preferences
   * @param sharingPreferences Tùy chọn chia sẻ dữ liệu mới
   */
  updateDataSharingPreferences(sharingPreferences: Partial<PrivacySettings['dataSharing']>): Observable<PrivacySettings> {
    return this.patch<PrivacySettings>(`${this.API_BASE_URL}/data-sharing`, { dataSharing: sharingPreferences })
      .pipe(
        map(response => ({
          ...response,
          lastUpdated: new Date(response.lastUpdated)
        })),
        catchError(error => {
          console.error('Lỗi khi cập nhật tùy chọn chia sẻ dữ liệu:', error);
          return throwError(() => new Error('Không thể cập nhật tùy chọn chia sẻ dữ liệu. Vui lòng thử lại sau.'));
        })
      );
  }

  /**
   * Cập nhật cài đặt cookie
   * Update cookie preferences
   * @param cookiePreferences Tùy chọn cookie mới
   */
  updateCookiePreferences(cookiePreferences: Partial<PrivacySettings['cookiePreferences']>): Observable<PrivacySettings> {
    return this.patch<PrivacySettings>(`${this.API_BASE_URL}/cookies`, { cookiePreferences })
      .pipe(
        map(response => ({
          ...response,
          lastUpdated: new Date(response.lastUpdated)
        })),
        catchError(error => {
          console.error('Lỗi khi cập nhật tùy chọn cookie:', error);
          return throwError(() => new Error('Không thể cập nhật tùy chọn cookie. Vui lòng thử lại sau.'));
        })
      );
  }

  /**
   * Cập nhật chế độ chia sẻ hoạt động học tập
   * Update learning activity sharing mode
   * @param sharingLevel Mức độ chia sẻ hoạt động học tập mới
   */
  updateLearningActivitySharing(sharingLevel: string): Observable<PrivacySettings> {
    return this.patch<PrivacySettings>(`${this.API_BASE_URL}/learning-activity-sharing`, { learningActivitySharing: sharingLevel })
      .pipe(
        map(response => ({
          ...response,
          lastUpdated: new Date(response.lastUpdated)
        })),
        catchError(error => {
          console.error('Lỗi khi cập nhật chế độ chia sẻ hoạt động học tập:', error);
          return throwError(() => new Error('Không thể cập nhật chế độ chia sẻ hoạt động học tập. Vui lòng thử lại sau.'));
        })
      );
  }

  /**
   * Cập nhật đồng ý tiếp thị
   * Update marketing consent
   * @param consent Giá trị đồng ý tiếp thị mới
   */
  updateMarketingConsent(consent: boolean): Observable<PrivacySettings> {
    return this.patch<PrivacySettings>(`${this.API_BASE_URL}/marketing-consent`, { marketingConsent: consent })
      .pipe(
        map(response => ({
          ...response,
          lastUpdated: new Date(response.lastUpdated)
        })),
        catchError(error => {
          console.error('Lỗi khi cập nhật đồng ý tiếp thị:', error);
          return throwError(() => new Error('Không thể cập nhật đồng ý tiếp thị. Vui lòng thử lại sau.'));
        })
      );
  }

  /**
   * Yêu cầu xuất dữ liệu người dùng
   * Request user data export
   */
  requestDataExport(): Observable<DataExportRequest> {
    return this.post<DataExportRequest>(`${this.API_BASE_URL}/export-data`, {})
      .pipe(
        map(response => ({
          ...response,
          requestDate: new Date(response.requestDate),
          expirationDate: response.expirationDate ? new Date(response.expirationDate) : undefined
        })),
        catchError(error => {
          console.error('Lỗi khi yêu cầu xuất dữ liệu:', error);
          return throwError(() => new Error('Không thể yêu cầu xuất dữ liệu. Vui lòng thử lại sau.'));
        })
      );
  }

  /**
   * Lấy trạng thái của yêu cầu xuất dữ liệu
   * Get status of data export request
   * @param requestId ID của yêu cầu xuất dữ liệu
   */
  getDataExportStatus(requestId: string): Observable<DataExportRequest> {
    return this.get<DataExportRequest>(`${this.API_BASE_URL}/export-data/${requestId}`)
      .pipe(
        map(response => ({
          ...response,
          requestDate: new Date(response.requestDate),
          expirationDate: response.expirationDate ? new Date(response.expirationDate) : undefined
        })),
        catchError(error => {
          console.error('Lỗi khi lấy trạng thái xuất dữ liệu:', error);
          return throwError(() => new Error('Không thể lấy trạng thái xuất dữ liệu. Vui lòng thử lại sau.'));
        })
      );
  }

  /**
   * Yêu cầu xóa dữ liệu người dùng
   * Request user data deletion
   */
  requestDataDeletion(): Observable<DataDeletionRequest> {
    return this.post<DataDeletionRequest>(`${this.API_BASE_URL}/delete-data`, {})
      .pipe(
        map(response => ({
          ...response,
          requestDate: new Date(response.requestDate),
          completionDate: response.completionDate ? new Date(response.completionDate) : undefined
        })),
        catchError(error => {
          console.error('Lỗi khi yêu cầu xóa dữ liệu:', error);
          return throwError(() => new Error('Không thể yêu cầu xóa dữ liệu. Vui lòng thử lại sau.'));
        })
      );
  }

  /**
   * Lấy trạng thái của yêu cầu xóa dữ liệu
   * Get status of data deletion request
   * @param requestId ID của yêu cầu xóa dữ liệu
   */
  getDataDeletionStatus(requestId: string): Observable<DataDeletionRequest> {
    return this.get<DataDeletionRequest>(`${this.API_BASE_URL}/delete-data/${requestId}`)
      .pipe(
        map(response => ({
          ...response,
          requestDate: new Date(response.requestDate),
          completionDate: response.completionDate ? new Date(response.completionDate) : undefined
        })),
        catchError(error => {
          console.error('Lỗi khi lấy trạng thái xóa dữ liệu:', error);
          return throwError(() => new Error('Không thể lấy trạng thái xóa dữ liệu. Vui lòng thử lại sau.'));
        })
      );
  }
}
