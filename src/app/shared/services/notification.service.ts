// src/app/shared/services/notification.service.ts
import { Injectable } from '@angular/core';
import { Observable, throwError, BehaviorSubject, Subject } from 'rxjs';
import { catchError, map, tap } from 'rxjs/operators';
import { MatSnackBar } from '@angular/material/snack-bar';
import { HttpService } from './http.service';
import { 
  Notification, 
  NotificationPreferences,
  NotificationCategoryPreference,
  NotificationStats,
  NotificationBatch
} from '../models/notification.model';
import { ApiResponse } from '../models/api.model';
import { environment } from '@environments/environment';

@Injectable({
  providedIn: 'root'
})
export class NotificationService {
  // Notification configuration
  private defaultDuration = 5000; // 5 seconds
  private successConfig = { panelClass: ['notification-success'] };
  private errorConfig = { panelClass: ['notification-error'] };
  private warningConfig = { panelClass: ['notification-warning'] };
  private infoConfig = { panelClass: ['notification-info'] };

  // Subject for notification events
  private notificationSource = new Subject<{type: string, message: string}>();
  public notifications$ = this.notificationSource.asObservable();


  private baseUrl = `${environment.apiUrl}/notifications`;
  private unreadCountSubject = new BehaviorSubject<number>(0);
  public unreadCount$ = this.unreadCountSubject.asObservable();
  
  constructor(private httpSV: HttpService, private snackBar: MatSnackBar) {
    this.getNotificationStats().subscribe(
      stats => this.unreadCountSubject.next(stats.unreadCount),
      _ => this.unreadCountSubject.next(0)
    );
  }

  /**
   * Hiển thị thông báo thành công
   * Display success notification
   * @param message Nội dung thông báo
   * @param duration Thời gian hiển thị (mili giây), mặc định 5000ms
   * @returns Observable của sự kiện đóng thông báo
   */
  success(message: string, duration: number = this.defaultDuration): void {
    this.notificationSource.next({type: 'success', message});
    this.snackBar.open(message, 'Đóng', {
      ...this.successConfig,
      duration
    }).afterDismissed();
  }

  /**
   * Hiển thị thông báo lỗi
   * Display error notification
   * @param message Nội dung thông báo
   * @param duration Thời gian hiển thị (mili giây), mặc định 5000ms
   * @returns Observable của sự kiện đóng thông báo
   */
  error(message: string, duration: number = this.defaultDuration): void {
    this.notificationSource.next({type: 'error', message});
    this.snackBar.open(message, 'Đóng', {
      ...this.errorConfig,
      duration
    }).afterDismissed();
  }

  /**
   * Hiển thị thông báo cảnh báo
   * Display warning notification
   * @param message Nội dung thông báo
   * @param duration Thời gian hiển thị (mili giây), mặc định 5000ms
   * @returns Observable của sự kiện đóng thông báo
   */
  warning(message: string, duration: number = this.defaultDuration): void {
    this.notificationSource.next({type: 'warning', message});
    this.snackBar.open(message, 'Đóng', {
      ...this.warningConfig,
      duration
    }).afterDismissed();
  }

  /**
   * Hiển thị thông báo thông tin
   * Display information notification
   * @param message Nội dung thông báo
   * @param duration Thời gian hiển thị (mili giây), mặc định 5000ms
   * @returns Observable của sự kiện đóng thông báo
   */
  info(message: string, duration: number = this.defaultDuration): void {
    this.notificationSource.next({type: 'info', message});
    this.snackBar.open(message, 'Đóng', {
      ...this.infoConfig,
      duration
    }).afterDismissed();
  }

  /**
   * Đóng tất cả các thông báo đang hiển thị
   * Close all displayed notifications
   */
  dismissAll(): void {
    this.snackBar.dismiss();
  }

  /**
   * Hiển thị thông báo xác nhận với các tùy chọn
   * Display confirmation notification with options
   * @param message Nội dung thông báo
   * @param confirmText Văn bản nút xác nhận
   * @param cancelText Văn bản nút hủy
   * @returns Promise trả về true nếu người dùng xác nhận, false nếu hủy
   */
  confirm(message: string, confirmText: string = 'Xác nhận', cancelText: string = 'Hủy'): Promise<boolean> {
    // Đây là phương thức mẫu, cần triển khai dialog xác nhận thực tế
    // This is a placeholder; implement actual confirmation dialog
    return new Promise((resolve) => {
      const snackBarRef = this.snackBar.open(message, confirmText, {
        ...this.infoConfig,
        duration: 0,
        horizontalPosition: 'center',
        verticalPosition: 'top',
      });

      snackBarRef.onAction().subscribe(() => {
        resolve(true);
      });

      snackBarRef.afterDismissed().subscribe(info => {
        if (!info.dismissedByAction) {
          resolve(false);
        }
      });
    });
  }
  
  /**
   * Lấy danh sách thông báo của người dùng hiện tại
   * Get notifications for the current user
   * @param page Số trang
   * @param limit Số lượng thông báo trên mỗi trang
   * @returns Observable chứa danh sách thông báo
   */
  getUserNotifications(page: number = 1, limit: number = 10): Observable<Notification[]> {
    return this.httpSV.get<Notification[]>(`${this.baseUrl}?page=${page}&limit=${limit}`);
  }
  
  /**
   * Lấy danh sách thông báo chưa đọc của người dùng
   * Get unread notifications for the current user
   * @returns Observable chứa danh sách thông báo chưa đọc
   */
  getUnreadNotifications(): Observable<Notification[]> {
    return this.httpSV.get<Notification[]>(`${this.baseUrl}/unread`);
  }
  
  /**
   * Lấy tùy chọn thông báo của người dùng
   * Get notification preferences for the current user
   * @returns Observable chứa tùy chọn thông báo
   */
  getNotificationPreferences(): Observable<NotificationPreferences> {
    return this.httpSV.get<NotificationPreferences>(`${this.baseUrl}/preferences`);
  }
  
  /**
   * Cập nhật tùy chọn thông báo chung
   * Update general notification preferences
   * @param preferences Tùy chọn thông báo mới
   * @returns Observable chứa tùy chọn thông báo đã cập nhật
   */
  updateGeneralPreferences(preferences: {
    emailNotifications: boolean;
    pushNotifications: boolean;
    browserNotifications: boolean;
  }): Observable<NotificationPreferences> {
    return this.httpSV.patch<NotificationPreferences>(`${this.baseUrl}/preferences/general`, preferences);
  }
  
  /**
   * Cập nhật tùy chọn thông báo cho một danh mục cụ thể
   * Update notification preferences for a specific category
   * @param categoryPreference Tùy chọn cho danh mục cụ thể
   * @returns Observable chứa tùy chọn thông báo đã cập nhật
   */
  updateCategoryPreference(categoryPreference: NotificationCategoryPreference): Observable<NotificationPreferences> {
    return this.httpSV.patch<NotificationPreferences>(
      `${this.baseUrl}/preferences/category/${categoryPreference.type}`, 
      categoryPreference
    );
  }
  
  /**
   * Đăng ký nhận thông báo đẩy
   * Register for push notifications
   * @param subscription Thông tin đăng ký từ trình duyệt
   * @returns Observable xác nhận đăng ký
   */
  registerPushNotification(subscription: PushSubscription): Observable<{success: boolean}> {
    return this.httpSV.post<{success: boolean}>(`${this.baseUrl}/push/register`, { subscription });
  }
  
  /**
   * Hủy đăng ký thông báo đẩy
   * Unregister from push notifications
   * @returns Observable xác nhận hủy đăng ký
   */
  unregisterPushNotification(): Observable<{success: boolean}> {
    return this.httpSV.delete<{success: boolean}>(`${this.baseUrl}/push/unregister`);
  }
  
  /**
   * Lấy thống kê thông báo
   * @returns Observable chứa thông tin thống kê thông báo
   */
  getNotificationStats(): Observable<NotificationStats> {
    return this.httpSV.get<ApiResponse<NotificationStats>>('notifications/stats').pipe(
      map(response => {
        if (!response.data) {
          return { userId: '', totalCount: 0, unreadCount: 0, categories: {} };
        }
        return response.data;
      }),
      catchError(error => {
        return throwError(() => new Error(error.error?.message || 'Không thể tải thống kê thông báo'));
      })
    );
  }
  
  /**
   * Lấy danh sách thông báo của người dùng
   * @param page Trang hiện tại
   * @param limit Số lượng thông báo mỗi trang
   * @returns Observable chứa danh sách thông báo và thông tin thống kê
   */
  getNotifications(page: number = 1, limit: number = 10): Observable<NotificationBatch> {
    return this.httpSV.get<ApiResponse<NotificationBatch>>(`notifications?page=${page}&limit=${limit}`).pipe(
      map(response => {
        if (!response.data) {
          return { notifications: [], totalCount: 0, unreadCount: 0 };
        }
        return response.data;
      }),
      tap(batch => {
        this.unreadCountSubject.next(batch.unreadCount);
      }),
      catchError(error => {
        return throwError(() => new Error(error.error?.message || 'Không thể tải thông báo'));
      })
    );
  }
  
  /**
   * Lấy thông tin chi tiết của một thông báo
   * @param id ID của thông báo
   * @returns Observable chứa thông tin chi tiết thông báo
   */
  getNotificationById(id: string): Observable<Notification> {
    return this.httpSV.get<ApiResponse<Notification>>(`notifications/${id}`).pipe(
      map(response => {
        if (!response.data) {
          throw new Error('Không tìm thấy thông báo');
        }
        return response.data;
      }),
      catchError(error => {
        return throwError(() => new Error(error.error?.message || 'Không thể tải thông báo'));
      })
    );
  }
  
  /**
   * Đánh dấu thông báo đã đọc
   * @param id ID của thông báo
   * @returns Observable chứa thông tin thông báo sau khi cập nhật
   */
  markAsRead(id: string): Observable<Notification> {
    return this.httpSV.post<ApiResponse<Notification>>(`notifications/${id}/read`, {}).pipe(
      map(response => {
        if (!response.data) {
          throw new Error('Không thể đánh dấu thông báo đã đọc');
        }
        // Cập nhật số lượng thông báo chưa đọc
        const currentCount = this.unreadCountSubject.value;
        if (currentCount > 0) {
          this.unreadCountSubject.next(currentCount - 1);
        }
        return response.data;
      }),
      catchError(error => {
        return throwError(() => new Error(error.error?.message || 'Không thể đánh dấu thông báo đã đọc'));
      })
    );
  }
  
  /**
   * Đánh dấu tất cả thông báo đã đọc
   * @returns Observable kết quả thành công hay thất bại
   */
  markAllAsRead(): Observable<boolean> {
    return this.httpSV.post<ApiResponse<{ success: boolean }>>('notifications/read-all', {}).pipe(
      map(response => {
        if (response.data?.success) {
          this.unreadCountSubject.next(0);
        }
        return response.data?.success || false;
      }),
      catchError(error => {
        return throwError(() => new Error(error.error?.message || 'Không thể đánh dấu tất cả thông báo đã đọc'));
      })
    );
  }
  
   /**
   * Xóa một thông báo
   * @param id ID của thông báo
   * @returns Observable kết quả thành công hay thất bại
   */
  deleteNotification(id: string): Observable<boolean> {
    return this.httpSV.delete<ApiResponse<{ success: boolean }>>(`notifications/${id}`).pipe(
      map(response => response.data?.success || false),
      catchError(error => {
        return throwError(() => new Error(error.error?.message || 'Không thể xóa thông báo'));
      })
    );
  }
  
  /**
   * Xóa tất cả thông báo
   * @returns Observable kết quả thành công hay thất bại
   */
  clearAllNotifications(): Observable<boolean> {
    return this.httpSV.delete<ApiResponse<{ success: boolean }>>('notifications').pipe(
      map(response => {
        if (response.data?.success) {
          this.unreadCountSubject.next(0);
        }
        return response.data?.success || false;
      }),
      catchError(error => {
        return throwError(() => new Error(error.error?.message || 'Không thể xóa tất cả thông báo'));
      })
    );
  }
}