import { Injectable } from '@angular/core';
import { Observable, throwError } from 'rxjs';
import { catchError, map, tap } from 'rxjs/operators';
import { HttpService } from './http.service';
import { Device, DeviceActivity, DeviceAuthResponse, DeviceManagementStats } from '../models/device.model';
import { environment } from '@environments/environment';
import { NotificationService } from './notification.service';

@Injectable({
  providedIn: 'root'
})
export class DeviceManagementService extends HttpService {
  private apiUrl = `${environment.apiUrl}/user/devices`;
  
  constructor(private notificationService: NotificationService) {
    super();
  }

  /**
   * Lấy danh sách thiết bị được kết nối với tài khoản
   * Fetches the list of devices connected to the account
   */
  getDevices(): Observable<Device[]> {
    return this.get<Device[]>(this.apiUrl)
      .pipe(
        map(devices => devices.map(device => ({
          ...device,
          lastActive: new Date(device.lastActive),
          dateAdded: new Date(device.dateAdded)
        }))),
        catchError(error => {
          console.error('Lỗi khi lấy danh sách thiết bị:', error);
          return throwError(() => new Error('Không thể lấy danh sách thiết bị. Vui lòng thử lại sau.'));
        })
      );
  }

  /**
   * Lấy thông tin chi tiết của một thiết bị
   * Gets detailed information about a specific device
   * @param deviceId ID của thiết bị
   */
  getDeviceDetails(deviceId: string): Observable<Device> {
    return this.get<Device>(`${this.apiUrl}/${deviceId}`)
      .pipe(
        map(device => ({
          ...device,
          lastActive: new Date(device.lastActive),
          dateAdded: new Date(device.dateAdded)
        })),
        catchError(error => {
          console.error(`Lỗi khi lấy chi tiết thiết bị ${deviceId}:`, error);
          return throwError(() => new Error('Không thể lấy thông tin chi tiết thiết bị.'));
        })
      );
  }

  /**
   * Lấy lịch sử hoạt động của một thiết bị
   * Gets activity history for a specific device
   * @param deviceId ID của thiết bị
   * @param limit Số lượng hoạt động tối đa
   */
  getDeviceActivity(deviceId: string, limit: number = 10): Observable<DeviceActivity[]> {
    return this.get<DeviceActivity[]>(`${this.apiUrl}/${deviceId}/activity`, { params: { limit: limit.toString() } })
      .pipe(
        map(activities => activities.map(activity => ({
          ...activity,
          timestamp: new Date(activity.timestamp)
        }))),
        catchError(error => {
          console.error(`Lỗi khi lấy lịch sử hoạt động của thiết bị ${deviceId}:`, error);
          return throwError(() => new Error('Không thể lấy lịch sử hoạt động thiết bị.'));
        })
      );
  }

  /**
   * Đổi tên thiết bị
   * Renames a device
   * @param deviceId ID của thiết bị
   * @param newName Tên mới cho thiết bị
   */
  renameDevice(deviceId: string, newName: string): Observable<Device> {
    return this.patch<Device>(`${this.apiUrl}/${deviceId}`, { deviceName: newName })
      .pipe(
        tap(() => {
          this.notificationService.success('Đổi tên thiết bị thành công.');
        }),
        catchError(error => {
          console.error(`Lỗi khi đổi tên thiết bị ${deviceId}:`, error);
          this.notificationService.error('Không thể đổi tên thiết bị. Vui lòng thử lại sau.');
          return throwError(() => new Error('Không thể đổi tên thiết bị.'));
        })
      );
  }

  /**
   * Đăng xuất thiết bị từ xa
   * Logs out the device remotely
   * @param deviceId ID của thiết bị
   */
  logoutDevice(deviceId: string): Observable<{ success: boolean }> {
    return this.post<{ success: boolean }>(`${this.apiUrl}/${deviceId}/logout`, {})
      .pipe(
        tap(response => {
          if (response.success) {
            this.notificationService.success('Đã đăng xuất khỏi thiết bị thành công.');
          }
        }),
        catchError(error => {
          console.error(`Lỗi khi đăng xuất thiết bị ${deviceId}:`, error);
          this.notificationService.error('Không thể đăng xuất khỏi thiết bị. Vui lòng thử lại sau.');
          return throwError(() => new Error('Không thể đăng xuất khỏi thiết bị.'));
        })
      );
  }

  /**
   * Xóa thiết bị khỏi danh sách
   * Removes the device from the list
   * @param deviceId ID của thiết bị
   */
  removeDevice(deviceId: string): Observable<{ success: boolean }> {
    return this.delete<{ success: boolean }>(`${this.apiUrl}/${deviceId}`)
      .pipe(
        tap(response => {
          if (response.success) {
            this.notificationService.success('Đã xóa thiết bị thành công.');
          }
        }),
        catchError(error => {
          console.error(`Lỗi khi xóa thiết bị ${deviceId}:`, error);
          this.notificationService.error('Không thể xóa thiết bị. Vui lòng thử lại sau.');
          return throwError(() => new Error('Không thể xóa thiết bị.'));
        })
      );
  }

  /**
   * Đánh dấu thiết bị là đáng tin cậy hoặc không
   * Marks a device as trusted or untrusted
   * @param deviceId ID của thiết bị
   * @param isTrusted Trạng thái đáng tin cậy
   */
  setDeviceTrustStatus(deviceId: string, isTrusted: boolean): Observable<Device> {
    return this.patch<Device>(`${this.apiUrl}/${deviceId}/trust`, { isTrusted })
      .pipe(
        tap(() => {
          const message = isTrusted 
            ? 'Đã đánh dấu thiết bị là đáng tin cậy.' 
            : 'Đã hủy đánh dấu thiết bị là đáng tin cậy.';
          this.notificationService.success(message);
        }),
        catchError(error => {
          console.error(`Lỗi khi thay đổi trạng thái tin cậy của thiết bị ${deviceId}:`, error);
          this.notificationService.error('Không thể thay đổi trạng thái tin cậy của thiết bị.');
          return throwError(() => new Error('Không thể thay đổi trạng thái tin cậy của thiết bị.'));
        })
      );
  }

  /**
   * Lấy thống kê về thiết bị
   * Gets statistics about devices
   */
  getDeviceStats(): Observable<DeviceManagementStats> {
    return this.get<DeviceManagementStats>(`${this.apiUrl}/stats`)
      .pipe(
        catchError(error => {
          console.error('Lỗi khi lấy thống kê thiết bị:', error);
          return throwError(() => new Error('Không thể lấy thông tin thống kê thiết bị.'));
        })
      );
  }
}
