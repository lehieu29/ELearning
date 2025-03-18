import { Injectable } from '@angular/core';
import { Observable, throwError, of } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { HttpService } from '@app/shared/services/http.service';
import { NotificationService } from '@app/shared/services/notification.service';
import { environment } from '@environments/environment';
import { 
  AccountSettings,
  EmailNotificationSettings,
  PasswordUpdateData,
  EmailVerificationResult,
  SecuritySettingsResponse,
  SessionInfo
} from '../models/account-settings.model';

@Injectable({
  providedIn: 'root'
})
export class AccountSettingsService extends HttpService {
  private apiUrl = `${environment.apiUrl}/account`;

  /**
   * Lấy thông tin cài đặt tài khoản
   * Get account settings information
   * @returns Observable của đối tượng AccountSettings
   */
  getAccountSettings(): Observable<AccountSettings> {
    return this.get<AccountSettings>(`${this.apiUrl}/settings`).pipe(
      catchError(error => {
        this.notificationService.error('Không thể tải cài đặt tài khoản');
        return throwError(() => error);
      })
    );
  }

  /**
   * Cập nhật thông tin cài đặt tài khoản
   * Update account settings information
   * @param settings Đối tượng cài đặt tài khoản cần cập nhật
   * @returns Observable của đối tượng AccountSettings đã cập nhật
   */
  updateAccountSettings(settings: Partial<AccountSettings>): Observable<AccountSettings> {
    return this.put<AccountSettings>(`${this.apiUrl}/settings`, settings).pipe(
      catchError(error => {
        this.notificationService.error('Không thể cập nhật cài đặt tài khoản');
        return throwError(() => error);
      })
    );
  }

  /**
   * Cập nhật mật khẩu
   * Update password
   * @param passwordData Dữ liệu cập nhật mật khẩu
   * @returns Observable với kết quả cập nhật
   */
  updatePassword(passwordData: PasswordUpdateData): Observable<{ success: boolean, message: string }> {
    return this.put<{ success: boolean, message: string }>(`${this.apiUrl}/password`, passwordData).pipe(
      catchError(error => {
        if (error.status === 400) {
          this.notificationService.error(error.error.message || 'Mật khẩu không hợp lệ');
        } else {
          this.notificationService.error('Không thể cập nhật mật khẩu');
        }
        return throwError(() => error);
      })
    );
  }

  /**
   * Gửi email xác thực
   * Send verification email
   * @param email Địa chỉ email cần xác thực
   * @returns Observable với kết quả gửi email
   */
  sendVerificationEmail(email: string): Observable<{ success: boolean, message: string }> {
    return this.post<{ success: boolean, message: string }>(`${this.apiUrl}/verify-email`, { email }).pipe(
      catchError(error => {
        this.notificationService.error('Không thể gửi email xác thực');
        return throwError(() => error);
      })
    );
  }

  /**
   * Xác thực email
   * Verify email
   * @param token Mã thông báo xác thực
   * @returns Observable với kết quả xác thực
   */
  verifyEmail(token: string): Observable<EmailVerificationResult> {
    return this.get<EmailVerificationResult>(`${this.apiUrl}/verify-email/${token}`).pipe(
      catchError(error => {
        this.notificationService.error('Không thể xác thực email');
        return throwError(() => error);
      })
    );
  }

  /**
   * Cập nhật cài đặt thông báo email
   * Update email notification settings
   * @param settings Cài đặt thông báo email cần cập nhật
   * @returns Observable với cài đặt đã cập nhật
   */
  updateEmailNotifications(settings: EmailNotificationSettings): Observable<EmailNotificationSettings> {
    return this.put<EmailNotificationSettings>(`${this.apiUrl}/notifications`, settings).pipe(
      catchError(error => {
        this.notificationService.error('Không thể cập nhật cài đặt thông báo');
        return throwError(() => error);
      })
    );
  }

  /**
   * Bật/tắt xác thực hai yếu tố
   * Enable/disable two-factor authentication
   * @param enable True để bật, false để tắt
   * @returns Observable với kết quả
   */
  toggleTwoFactorAuth(enable: boolean): Observable<{ success: boolean, message: string }> {
    return this.put<{ success: boolean, message: string }>(`${this.apiUrl}/two-factor`, { enable }).pipe(
      catchError(error => {
        this.notificationService.error('Không thể cập nhật xác thực hai yếu tố');
        return throwError(() => error);
      })
    );
  }

  /**
   * Lấy thông tin bảo mật của tài khoản
   * Get account security information
   * @returns Observable với thông tin bảo mật
   */
  getSecuritySettings(): Observable<SecuritySettingsResponse> {
    return this.get<SecuritySettingsResponse>(`${this.apiUrl}/security`).pipe(
      catchError(error => {
        this.notificationService.error('Không thể tải thông tin bảo mật');
        return throwError(() => error);
      })
    );
  }

  /**
   * Đóng phiên đăng nhập từ xa
   * Terminate remote session
   * @param sessionId ID của phiên cần đóng
   * @returns Observable với kết quả
   */
  terminateSession(sessionId: string): Observable<{ success: boolean }> {
    return this.delete<{ success: boolean }>(`${this.apiUrl}/sessions/${sessionId}`).pipe(
      catchError(error => {
        this.notificationService.error('Không thể đóng phiên');
        return throwError(() => error);
      })
    );
  }

  /**
   * Đóng tất cả các phiên đăng nhập khác
   * Terminate all other sessions
   * @returns Observable với kết quả
   */
  terminateAllOtherSessions(): Observable<{ success: boolean, terminatedCount: number }> {
    return this.delete<{ success: boolean, terminatedCount: number }>(`${this.apiUrl}/sessions`).pipe(
      catchError(error => {
        this.notificationService.error('Không thể đóng các phiên khác');
        return throwError(() => error);
      })
    );
  }

  /**
   * Yêu cầu xóa tài khoản
   * Request account deletion
   * @returns Observable với kết quả
   */
  requestAccountDeletion(): Observable<{ success: boolean, message: string }> {
    return this.post<{ success: boolean, message: string }>(`${this.apiUrl}/deletion-request`, {}).pipe(
      catchError(error => {
        this.notificationService.error('Không thể yêu cầu xóa tài khoản');
        return throwError(() => error);
      })
    );
  }

  /**
   * Xác nhận xóa tài khoản
   * Confirm account deletion
   * @param token Mã thông báo xác nhận
   * @param password Mật khẩu để xác nhận
   * @returns Observable với kết quả
   */
  confirmAccountDeletion(token: string, password: string): Observable<{ success: boolean, message: string }> {
    return this.post<{ success: boolean, message: string }>(`${this.apiUrl}/deletion-confirm`, { token, password }).pipe(
      catchError(error => {
        this.notificationService.error('Không thể xác nhận xóa tài khoản');
        return throwError(() => error);
      })
    );
  }
}
