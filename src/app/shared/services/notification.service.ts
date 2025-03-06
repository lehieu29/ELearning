// src/app/shared/services/notification.service.ts
import { Injectable } from '@angular/core';
import { Observable, throwError, BehaviorSubject } from 'rxjs';
import { catchError, map, tap } from 'rxjs/operators';
import { HttpService } from './http.service';
import { Notification } from '../models/notification.model';
import { NotificationPreferences } from '../models/notification.model';
import { NotificationStats } from '../models/notification.model';
import { NotificationBatch } from '../models/notification.model';
import { ApiResponse } from '../models/api.model';

@Injectable({
  providedIn: 'root'
})
export class NotificationService {
  private unreadCountSubject = new BehaviorSubject<number>(0);
  public unreadCount$ = this.unreadCountSubject.asObservable();
  
  constructor(private http: HttpService) {
    this.getNotificationStats().subscribe(
      stats => this.unreadCountSubject.next(stats.unreadCount),
      _ => this.unreadCountSubject.next(0)
    );
  }
  
  /**
   * Lấy danh sách thông báo của người dùng
   * @param page Trang hiện tại
   * @param limit Số lượng thông báo mỗi trang
   * @returns Observable chứa danh sách thông báo và thông tin thống kê
   */
  getNotifications(page: number = 1, limit: number = 10): Observable<NotificationBatch> {
    return this.http.get<ApiResponse<NotificationBatch>>(`notifications?page=${page}&limit=${limit}`).pipe(
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
    return this.http.get<ApiResponse<Notification>>(`notifications/${id}`).pipe(
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
    return this.http.post<ApiResponse<Notification>>(`notifications/${id}/read`, {}).pipe(
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
    return this.http.post<ApiResponse<{ success: boolean }>>('notifications/read-all', {}).pipe(
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
    return this.http.delete<ApiResponse<{ success: boolean }>>(`notifications/${id}`).pipe(
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
    return this.http.delete<ApiResponse<{ success: boolean }>>('notifications').pipe(
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
  
  /**
   * Lấy thống kê thông báo
   * @returns Observable chứa thông tin thống kê thông báo
   */
  getNotificationStats(): Observable<NotificationStats> {
    return this.http.get<ApiResponse<NotificationStats>>('notifications/stats').pipe(
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
   * Lấy tùy chọn thông báo của người dùng
   * @returns Observable chứa tùy chọn thông báo
   */
  getNotificationPreferences(): Observable<NotificationPreferences> {
    return this.http.get<ApiResponse<NotificationPreferences>>('notifications/preferences').pipe(
      map(response => {
        if (!response.data) {
          throw new Error('Không tìm thấy tùy chọn thông báo');
        }
        return response.data;
      }),
      catchError(error => {
        return throwError(() => new Error(error.error?.message || 'Không thể tải tùy chọn thông báo'));
      })
    );
  }
  
  /**
   * Cập nhật tùy chọn thông báo
   * @param preferences Tùy chọn thông báo cần cập nhật
   * @returns Observable chứa tùy chọn thông báo sau khi cập nhật
   */
  updateNotificationPreferences(preferences: Partial<NotificationPreferences>): Observable<NotificationPreferences> {
    return this.http.put<ApiResponse<NotificationPreferences>>('notifications/preferences', preferences).pipe(
      map(response => {
        if (!response.data) {
          throw new Error('Không thể cập nhật tùy chọn');
        }
        return response.data;
      }),
      catchError(error => {
        return throwError(() => new Error(error.error?.message || 'Không thể cập nhật tùy chọn thông báo'));
      })
    );
  }
}