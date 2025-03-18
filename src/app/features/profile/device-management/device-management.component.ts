import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { BaseComponent } from '@app/shared/components/base/base-component';
import { DeviceManagementService } from '@app/shared/services/device-management.service';
import { NotificationService } from '@app/shared/services/notification.service';
import { takeUntil, finalize, catchError } from 'rxjs/operators';
import { of } from 'rxjs';
import * as dayjsImport from 'dayjs';
import { Device, DeviceActivity, DeviceManagementStats } from '@shared/models/device';

@Component({
  selector: 'app-device-management',
  templateUrl: './device-management.component.html'
})
export class DeviceManagementComponent extends BaseComponent implements OnInit {
  
  dayjs = (date: any) => (dayjsImport as any)(date);

  // Danh sách thiết bị và trạng thái
  devices: Device[] = [];
  selectedDevice: Device | null = null;
  deviceActivities: DeviceActivity[] = [];
  isLoadingDevices = true;
  isLoadingActivities = false;
  isLoadingStats = true;
  error = '';
  deviceStats: DeviceManagementStats | null = null;

  // Quản lý modal
  showDeviceDetailsModal = false;
  showRenameDeviceModal = false;
  showConfirmLogoutModal = false;
  showConfirmRemoveModal = false;
  
  // Form đổi tên thiết bị
  renameDeviceForm: FormGroup;
  isProcessing = false;

  /**
   * Khởi tạo component với các dependency cần thiết
   * Initialize component with necessary dependencies
   * @param deviceService Service quản lý thiết bị
   * @param fb FormBuilder để tạo form
   * @param notificationService Service hiển thị thông báo
   */
  constructor(
    private deviceService: DeviceManagementService,
    private fb: FormBuilder,
    private notificationService: NotificationService
  ) {
    super();
    
    this.renameDeviceForm = this.fb.group({
      newName: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(50)]]
    });
  }

  /**
   * Khởi tạo component, tải dữ liệu thiết bị
   * Initialize component, load device data
   */
  ngOnInit(): void {
    this.loadDevices();
    this.loadDeviceStats();
  }

  /**
   * Tải danh sách thiết bị từ API
   * Load list of devices from API
   */
  loadDevices(): void {
    this.isLoadingDevices = true;
    this.error = '';
    
    this.deviceService.getDevices()
      .pipe(
        takeUntil(this._onDestroySub),
        finalize(() => {
          this.isLoadingDevices = false;
        }),
        catchError(error => {
          this.error = 'Không thể tải danh sách thiết bị. Vui lòng thử lại sau.';
          console.error('Lỗi khi tải danh sách thiết bị:', error);
          return of([]);
        })
      )
      .subscribe(devices => {
        this.devices = devices;
      });
  }

  /**
   * Tải thống kê thiết bị từ API
   * Load device statistics from API
   */
  loadDeviceStats(): void {
    this.isLoadingStats = true;
    
    this.deviceService.getDeviceStats()
      .pipe(
        takeUntil(this._onDestroySub),
        finalize(() => {
          this.isLoadingStats = false;
        }),
        catchError(error => {
          console.error('Lỗi khi tải thống kê thiết bị:', error);
          return of(null);
        })
      )
      .subscribe(stats => {
        this.deviceStats = stats;
      });
  }

  /**
   * Tải hoạt động của thiết bị được chọn
   * Load activities for the selected device
   */
  loadDeviceActivities(deviceId: string): void {
    this.isLoadingActivities = true;
    
    this.deviceService.getDeviceActivity(deviceId)
      .pipe(
        takeUntil(this._onDestroySub),
        finalize(() => {
          this.isLoadingActivities = false;
        }),
        catchError(error => {
          console.error(`Lỗi khi tải hoạt động của thiết bị ${deviceId}:`, error);
          this.notificationService.error('Không thể tải lịch sử hoạt động thiết bị.');
          return of([]);
        })
      )
      .subscribe(activities => {
        this.deviceActivities = activities;
      });
  }

  /**
   * Hiển thị chi tiết thiết bị
   * Show device details
   * @param device Thiết bị được chọn
   */
  showDeviceDetails(device: Device): void {
    this.selectedDevice = device;
    this.loadDeviceActivities(device.id);
    this.showDeviceDetailsModal = true;
  }

  /**
   * Mở modal đổi tên thiết bị
   * Open rename device modal
   * @param device Thiết bị cần đổi tên
   */
  openRenameModal(device: Device): void {
    this.selectedDevice = device;
    this.renameDeviceForm.patchValue({ newName: device.deviceName });
    this.showRenameDeviceModal = true;
  }

  /**
   * Xác nhận đổi tên thiết bị
   * Confirm device rename
   */
  confirmRenameDevice(): void {
    if (this.renameDeviceForm.invalid || !this.selectedDevice) {
      return;
    }
    
    const newName = this.renameDeviceForm.get('newName')?.value;
    this.isProcessing = true;
    
    this.deviceService.renameDevice(this.selectedDevice.id, newName)
      .pipe(
        takeUntil(this._onDestroySub),
        finalize(() => {
          this.isProcessing = false;
        }),
        catchError(error => {
          console.error(`Lỗi khi đổi tên thiết bị ${this.selectedDevice?.id}:`, error);
          return of(null);
        })
      )
      .subscribe(updatedDevice => {
        if (updatedDevice) {
          // Cập nhật thiết bị trong danh sách
          const index = this.devices.findIndex(d => d.id === this.selectedDevice?.id);
          if (index !== -1) {
            this.devices[index] = updatedDevice;
          }
          
          this.closeModals();
        }
      });
  }

  /**
   * Mở modal xác nhận đăng xuất thiết bị
   * Open logout confirmation modal
   * @param device Thiết bị cần đăng xuất
   */
  openLogoutConfirmation(device: Device): void {
    this.selectedDevice = device;
    this.showConfirmLogoutModal = true;
  }

  /**
   * Xác nhận đăng xuất khỏi thiết bị
   * Confirm logout from device
   */
  confirmLogoutDevice(): void {
    if (!this.selectedDevice) {
      return;
    }
    
    this.isProcessing = true;
    
    this.deviceService.logoutDevice(this.selectedDevice.id)
      .pipe(
        takeUntil(this._onDestroySub),
        finalize(() => {
          this.isProcessing = false;
        }),
        catchError(error => {
          console.error(`Lỗi khi đăng xuất thiết bị ${this.selectedDevice?.id}:`, error);
          return of({ success: false });
        })
      )
      .subscribe(response => {
        if (response.success) {
          // Cập nhật trạng thái thiết bị trong danh sách
          const index = this.devices.findIndex(d => d.id === this.selectedDevice?.id);
          if (index !== -1) {
            this.devices[index] = {
              ...this.devices[index],
              isCurrent: false,
              lastActive: new Date()
            };
          }
          
          this.closeModals();
          this.loadDevices(); // Tải lại danh sách thiết bị
        }
      });
  }

  /**
   * Mở modal xác nhận xóa thiết bị
   * Open remove device confirmation modal
   * @param device Thiết bị cần xóa
   */
  openRemoveConfirmation(device: Device): void {
    this.selectedDevice = device;
    this.showConfirmRemoveModal = true;
  }

  /**
   * Xác nhận xóa thiết bị
   * Confirm device removal
   */
  confirmRemoveDevice(): void {
    if (!this.selectedDevice) {
      return;
    }
    
    this.isProcessing = true;
    
    this.deviceService.removeDevice(this.selectedDevice.id)
      .pipe(
        takeUntil(this._onDestroySub),
        finalize(() => {
          this.isProcessing = false;
        }),
        catchError(error => {
          console.error(`Lỗi khi xóa thiết bị ${this.selectedDevice?.id}:`, error);
          return of({ success: false });
        })
      )
      .subscribe(response => {
        if (response.success) {
          // Xóa thiết bị khỏi danh sách
          this.devices = this.devices.filter(d => d.id !== this.selectedDevice?.id);
          this.loadDeviceStats(); // Tải lại thống kê thiết bị
          this.closeModals();
        }
      });
  }

  /**
   * Thay đổi trạng thái đáng tin cậy của thiết bị
   * Toggle trusted status of device
   * @param device Thiết bị cần thay đổi
   */
  toggleTrustedStatus(device: Device): void {
    const newStatus = !device.isTrusted;
    
    this.deviceService.setDeviceTrustStatus(device.id, newStatus)
      .pipe(
        takeUntil(this._onDestroySub),
        catchError(error => {
          console.error(`Lỗi khi thay đổi trạng thái tin cậy của thiết bị ${device.id}:`, error);
          return of(null);
        })
      )
      .subscribe(updatedDevice => {
        if (updatedDevice) {
          // Cập nhật thiết bị trong danh sách
          const index = this.devices.findIndex(d => d.id === device.id);
          if (index !== -1) {
            this.devices[index] = updatedDevice;
          }
        }
      });
  }

  /**
   * Đóng tất cả các modal
   * Close all modals
   */
  closeModals(): void {
    this.showDeviceDetailsModal = false;
    this.showRenameDeviceModal = false;
    this.showConfirmLogoutModal = false;
    this.showConfirmRemoveModal = false;
    this.selectedDevice = null;
    this.deviceActivities = [];
  }

  /**
   * Lấy biểu tượng phù hợp cho loại thiết bị
   * Get appropriate icon for device type
   * @param deviceType Loại thiết bị
   * @returns Tên lớp biểu tượng
   */
  getDeviceIcon(deviceType: string): string {
    switch (deviceType) {
      case 'desktop':
        return 'fas fa-desktop';
      case 'laptop':
        return 'fas fa-laptop';
      case 'tablet':
        return 'fas fa-tablet-alt';
      case 'mobile':
        return 'fas fa-mobile-alt';
      default:
        return 'fas fa-question-circle';
    }
  }

  /**
   * Định dạng thời gian hoạt động cuối
   * Format last activity time
   * @param date Thời gian hoạt động
   * @returns Chuỗi thời gian đã định dạng
   */
  formatLastActive(date: Date): string {
    return this.dayjs(date).format('DD/MM/YYYY HH:mm');
  }

  /**
   * Định dạng thời gian hoạt động tương đối
   * Format relative activity time
   * @param date Thời gian hoạt động
   * @returns Chuỗi thời gian tương đối
   */
  formatRelativeTime(date: Date): string {
    const now = this.dayjs(new Date());
    const activityTime = this.dayjs(date);
    const diffMinutes = now.diff(activityTime, 'minute');
    
    if (diffMinutes < 1) {
      return 'Vừa xong';
    } else if (diffMinutes < 60) {
      return `${diffMinutes} phút trước`;
    } else if (diffMinutes < 1440) {
      const hours = Math.floor(diffMinutes / 60);
      return `${hours} giờ trước`;
    } else {
      const days = Math.floor(diffMinutes / 1440);
      return `${days} ngày trước`;
    }
  }

  /**
   * Lấy màu trạng thái hoạt động
   * Get activity status color
   * @param date Thời gian hoạt động
   * @returns Lớp màu CSS
   */
  getActivityStatusColor(date: Date): string {
    const diffHours = this.dayjs(new Date()).diff(this.dayjs(date), 'hour');
    
    if (diffHours < 1) {
      return 'bg-green-100 text-green-800'; // Đang hoạt động
    } else if (diffHours < 24) {
      return 'bg-blue-100 text-blue-800'; // Hoạt động gần đây
    } else if (diffHours < 168) { // 7 ngày
      return 'bg-yellow-100 text-yellow-800'; // Không hoạt động
    } else {
      return 'bg-gray-100 text-gray-800'; // Không hoạt động lâu
    }
  }

  /**
   * Lấy nhãn cho loại hoạt động
   * Get label for activity type
   * @param type Loại hoạt động
   * @returns Nhãn hiển thị
   */
  getActivityTypeLabel(type: string): string {
    switch (type) {
      case 'login':
        return 'Đăng nhập';
      case 'logout':
        return 'Đăng xuất';
      case 'course_access':
        return 'Truy cập khóa học';
      case 'settings_change':
        return 'Thay đổi cài đặt';
      case 'payment':
        return 'Thanh toán';
      default:
        return 'Hoạt động khác';
    }
  }
}
