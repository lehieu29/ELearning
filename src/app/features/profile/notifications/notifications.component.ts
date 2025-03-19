// File path: src/app/features/profile/notifications/notifications.component.ts
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormArray } from '@angular/forms';
import { BaseComponent } from '@app/shared/components/base/base-component';
import { NotificationService } from '@app/shared/services/notification.service';
import { NotificationPreferences, NotificationType, Notification, NotificationCategoryPreference } from '@app/shared/models/notification.model';
import { takeUntil, finalize, catchError } from 'rxjs/operators';
import { of } from 'rxjs';
import { NotificationService as ToastService } from '@app/shared/services/notification.service';
import { environment } from '@environments/environment';

@Component({
  selector: 'app-notifications',
  templateUrl: './notifications.component.html'
})
export class NotificationsComponent extends BaseComponent implements OnInit {
  // Thông báo hiện tại
  notifications: Notification[] = [];
  // Tùy chọn thông báo
  preferences: NotificationPreferences;
  // Loading states
  isLoadingPreferences = false;
  isLoadingNotifications = false;
  isSaving = false;
  // Error messages
  error: string = '';
  
  // Danh sách các loại thông báo có thể hiển thị cho người dùng
  notificationTypes: {type: NotificationType, label: string, description: string}[] = [
    { 
      type: 'course_update', 
      label: 'Cập nhật khóa học', 
      description: 'Thông báo khi khóa học có nội dung mới hoặc được cập nhật'
    },
    { 
      type: 'assignment_reminder', 
      label: 'Nhắc nhở bài tập', 
      description: 'Nhắc nhở khi gần đến hạn nộp bài tập' 
    },
    { 
      type: 'assignment_graded', 
      label: 'Bài tập đã chấm điểm', 
      description: 'Thông báo khi bài tập được chấm điểm' 
    },
    { 
      type: 'certificate_issued', 
      label: 'Cấp chứng chỉ', 
      description: 'Thông báo khi có chứng chỉ mới được cấp' 
    },
    { 
      type: 'forum_reply', 
      label: 'Trả lời diễn đàn', 
      description: 'Thông báo khi có người trả lời bài viết của bạn' 
    },
    { 
      type: 'forum_mention', 
      label: 'Nhắc đến trong diễn đàn', 
      description: 'Thông báo khi có người nhắc đến bạn trong diễn đàn' 
    },
    { 
      type: 'system_announcement', 
      label: 'Thông báo hệ thống', 
      description: 'Thông báo quan trọng từ hệ thống' 
    },
    { 
      type: 'promotion', 
      label: 'Khuyến mãi', 
      description: 'Thông báo về khuyến mãi và ưu đãi mới' 
    },
    { 
      type: 'achievement', 
      label: 'Thành tích', 
      description: 'Thông báo khi bạn đạt được thành tích mới' 
    },
    { 
      type: 'account_security', 
      label: 'Bảo mật tài khoản', 
      description: 'Thông báo liên quan đến bảo mật tài khoản' 
    }
  ];
  
  // Form cho cài đặt chung
  generalPreferencesForm: FormGroup;
  // Form cho cài đặt từng loại thông báo
  categoryPreferencesForm: FormGroup;
  
  // Đánh dấu xem thông báo đẩy có được hỗ trợ trên trình duyệt không
  pushNotificationsSupported = 'serviceWorker' in navigator && 'PushManager' in window;
  // Đánh dấu xem người dùng đã đăng ký nhận thông báo đẩy chưa
  pushNotificationsEnabled = false;
  // Tab hiện tại
  activeTab: 'preferences' | 'history' = 'preferences';
  
  /**
   * Khởi tạo component với các dịch vụ cần thiết
   * Initialize component with needed services
   * @param fb FormBuilder để tạo form
   * @param notificationService Dịch vụ quản lý thông báo
   * @param toastService Dịch vụ hiển thị thông báo popup
   */
  constructor(
    private fb: FormBuilder,
    private notificationService: NotificationService,
    private toastService: ToastService
  ) {
    super();
    
    // Khởi tạo form cho cài đặt chung
    // Initialize general preferences form
    this.generalPreferencesForm = this.fb.group({
      emailNotifications: [true],
      pushNotifications: [this.pushNotificationsSupported],
      browserNotifications: [true]
    });
    
    // Khởi tạo form cho cài đặt từng loại thông báo
    // Initialize category preferences form
    this.categoryPreferencesForm = this.fb.group({
      categories: this.fb.array([])
    });
  }
  
  /**
   * Khởi tạo component và lấy dữ liệu ban đầu
   * Initialize component and fetch initial data
   */
  ngOnInit(): void {
    this.loadNotificationPreferences();
    this.loadRecentNotifications();
  }
  
  /**
   * Tạo FormArray chứa các tùy chọn thông báo theo danh mục
   * Creates FormArray containing notification preferences by category
   * @param categories Danh sách các tùy chọn thông báo theo danh mục
   */
  createCategoriesFormArray(categories: NotificationCategoryPreference[]): FormArray {
    const categoriesArray = this.fb.array([]);
    
    // Đảm bảo có đủ các loại thông báo trong form
    // Ensure all notification types are present in the form
    this.notificationTypes.forEach(type => {
      // Tìm tùy chọn hiện tại cho loại thông báo này
      // Find current preferences for this notification type
      const existingCategory = categories.find(c => c.type === type.type);
      
      // Nếu tìm thấy, sử dụng giá trị đó; nếu không, tạo mặc định
      // If found, use those values; otherwise create defaults
      const category = existingCategory || {
        type: type.type,
        email: true,
        push: this.pushNotificationsSupported,
        browser: true
      };
      
      categoriesArray.push(
        this.fb.group({
          type: [category.type],
          email: [category.email],
          push: [category.push],
          browser: [category.browser]
        })
      );
    });
    
    return categoriesArray;
  }
  
  /**
   * Lấy dữ liệu tùy chọn thông báo từ server
   * Fetch notification preferences from the server
   */
  loadNotificationPreferences(): void {
    this.isLoadingPreferences = true;
    this.error = '';
    
    this.notificationService.getNotificationPreferences()
      .pipe(
        takeUntil(this._onDestroySub),
        finalize(() => {
          this.isLoadingPreferences = false;
        }),
        catchError(err => {
          console.error('Lỗi khi tải tùy chọn thông báo:', err);
          this.error = 'Không thể tải tùy chọn thông báo. Vui lòng thử lại sau.';
          return of(null);
        })
      )
      .subscribe(preferences => {
        if (preferences) {
          this.preferences = preferences;
          
          // Cập nhật form với dữ liệu từ server
          // Update form with data from server
          this.generalPreferencesForm.patchValue({
            emailNotifications: preferences.emailNotifications,
            pushNotifications: preferences.pushNotifications,
            browserNotifications: preferences.browserNotifications
          });
          
          // Tạo FormArray cho các tùy chọn theo danh mục
          // Create FormArray for category preferences
          const categoriesArray = this.createCategoriesFormArray(preferences.categories);
          this.categoryPreferencesForm.setControl('categories', categoriesArray);
          
          // Cập nhật trạng thái đăng ký thông báo đẩy
          // Update push notification registration status
          this.pushNotificationsEnabled = preferences.pushNotifications;
        }
      });
  }
  
  /**
   * Lấy danh sách thông báo gần đây
   * Fetch recent notifications
   */
  loadRecentNotifications(): void {
    this.isLoadingNotifications = true;
    
    this.notificationService.getUserNotifications(1, 10)
      .pipe(
        takeUntil(this._onDestroySub),
        finalize(() => {
          this.isLoadingNotifications = false;
        }),
        catchError(err => {
          console.error('Lỗi khi tải thông báo:', err);
          return of([]);
        })
      )
      .subscribe(notifications => {
        this.notifications = notifications;
      });
  }
  
  /**
   * Chuyển đổi tab hiện tại
   * Switch current tab
   * @param tab Tab muốn chuyển tới
   */
  switchTab(tab: 'preferences' | 'history'): void {
    this.activeTab = tab;
    if (tab === 'history' && this.notifications.length === 0) {
      this.loadRecentNotifications();
    }
  }
  
  /**
   * Lưu cài đặt thông báo chung
   * Save general notification preferences
   */
  saveGeneralPreferences(): void {
    if (this.generalPreferencesForm.invalid) {
      return;
    }
    
    this.isSaving = true;
    const formData = this.generalPreferencesForm.value;
    
    this.notificationService.updateGeneralPreferences(formData)
      .pipe(
        takeUntil(this._onDestroySub),
        finalize(() => {
          this.isSaving = false;
        }),
        catchError(err => {
          console.error('Lỗi khi cập nhật tùy chọn thông báo:', err);
          this.toastService.error('Không thể cập nhật tùy chọn thông báo. Vui lòng thử lại sau.');
          return of(null);
        })
      )
      .subscribe(response => {
        if (response) {
          this.preferences = response;
          this.toastService.success('Đã cập nhật tùy chọn thông báo thành công');
          
          // Xử lý riêng cho thông báo đẩy
          // Special handling for push notifications
          if (formData.pushNotifications && !this.pushNotificationsEnabled) {
            this.registerPushNotifications();
          } else if (!formData.pushNotifications && this.pushNotificationsEnabled) {
            this.unregisterPushNotifications();
          }
        }
      });
  }
  
  /**
   * Lưu tùy chọn thông báo cho một danh mục cụ thể
   * Save notification preferences for a specific category
   * @param index Chỉ số của danh mục trong mảng
   */
  saveCategoryPreference(index: number): void {
    const categoriesArray = this.categoryPreferencesForm.get('categories') as FormArray;
    const categoryFormGroup = categoriesArray.at(index);
    
    if (categoryFormGroup.invalid) {
      return;
    }
    
    this.isSaving = true;
    const categoryData = categoryFormGroup.value;
    
    this.notificationService.updateCategoryPreference(categoryData)
      .pipe(
        takeUntil(this._onDestroySub),
        finalize(() => {
          this.isSaving = false;
        }),
        catchError(err => {
          console.error('Lỗi khi cập nhật tùy chọn danh mục thông báo:', err);
          this.toastService.error('Không thể cập nhật tùy chọn danh mục thông báo. Vui lòng thử lại sau.');
          return of(null);
        })
      )
      .subscribe(response => {
        if (response) {
          this.preferences = response;
          this.toastService.success('Đã cập nhật tùy chọn danh mục thông báo thành công');
        }
      });
  }
  
  /**
   * Đăng ký nhận thông báo đẩy
   * Register for push notifications
   */
  registerPushNotifications(): void {
    if (!this.pushNotificationsSupported) {
      this.toastService.warning('Trình duyệt của bạn không hỗ trợ thông báo đẩy');
      return;
    }
    
    navigator.serviceWorker.ready.then(registration => {
      registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: this.urlBase64ToUint8Array(environment.pushNotificationPublicKey)
      })
      .then(subscription => {
        // Gửi thông tin đăng ký đến server
        // Send subscription info to server
        this.notificationService.registerPushNotification(subscription)
          .pipe(takeUntil(this._onDestroySub))
          .subscribe({
            next: () => {
              this.pushNotificationsEnabled = true;
              this.toastService.success('Đã đăng ký nhận thông báo đẩy');
            },
            error: err => {
              console.error('Lỗi khi đăng ký thông báo đẩy:', err);
              this.toastService.error('Không thể đăng ký thông báo đẩy. Vui lòng thử lại sau.');
            }
          });
      })
      .catch(err => {
        console.error('Lỗi khi đăng ký nhận thông báo đẩy:', err);
        this.toastService.error('Không thể đăng ký thông báo đẩy. Bạn có thể đã từ chối quyền thông báo.');
        
        // Cập nhật lại form nếu người dùng từ chối quyền
        // Update form if user denied permission
        this.generalPreferencesForm.patchValue({
          pushNotifications: false
        });
      });
    });
  }
  
  /**
   * Hủy đăng ký thông báo đẩy
   * Unregister from push notifications
   */
  unregisterPushNotifications(): void {
    this.notificationService.unregisterPushNotification()
      .pipe(takeUntil(this._onDestroySub))
      .subscribe({
        next: () => {
          this.pushNotificationsEnabled = false;
          this.toastService.success('Đã hủy đăng ký thông báo đẩy');
          
          // Hủy đăng ký khỏi Service Worker
          // Unregister from Service Worker
          navigator.serviceWorker.ready.then(registration => {
            registration.pushManager.getSubscription().then(subscription => {
              if (subscription) {
                subscription.unsubscribe();
              }
            });
          });
        },
        error: err => {
          console.error('Lỗi khi hủy đăng ký thông báo đẩy:', err);
          this.toastService.error('Không thể hủy đăng ký thông báo đẩy. Vui lòng thử lại sau.');
        }
      });
  }
  
  /**
   * Đánh dấu thông báo đã đọc
   * Mark notification as read
   * @param notificationId ID của thông báo
   */
  markAsRead(notificationId: string): void {
    this.notificationService.markAsRead(notificationId)
      .pipe(takeUntil(this._onDestroySub))
      .subscribe({
        next: () => {
          // Cập nhật trạng thái đã đọc trong danh sách
          // Update read status in list
          const notification = this.notifications.find(n => n.id === notificationId);
          if (notification) {
            notification.isRead = true;
          }
        },
        error: err => {
          console.error('Lỗi khi đánh dấu thông báo đã đọc:', err);
        }
      });
  }
  
  /**
   * Đánh dấu tất cả thông báo đã đọc
   * Mark all notifications as read
   */
  markAllAsRead(): void {
    this.notificationService.markAllAsRead()
      .pipe(takeUntil(this._onDestroySub))
      .subscribe({
        next: () => {
          // Cập nhật tất cả thông báo trong danh sách thành đã đọc
          // Update all notifications in list to read
          this.notifications.forEach(notification => {
            notification.isRead = true;
          });
          this.toastService.success('Đã đánh dấu tất cả thông báo là đã đọc');
        },
        error: err => {
          console.error('Lỗi khi đánh dấu tất cả thông báo đã đọc:', err);
          this.toastService.error('Không thể đánh dấu tất cả thông báo đã đọc. Vui lòng thử lại sau.');
        }
      });
  }
  
  /**
   * Xóa thông báo
   * Delete notification
   * @param notificationId ID của thông báo
   */
  deleteNotification(notificationId: string): void {
    this.notificationService.deleteNotification(notificationId)
      .pipe(takeUntil(this._onDestroySub))
      .subscribe({
        next: () => {
          // Xóa thông báo khỏi danh sách
          // Remove notification from list
          this.notifications = this.notifications.filter(n => n.id !== notificationId);
          this.toastService.success('Đã xóa thông báo');
        },
        error: err => {
          console.error('Lỗi khi xóa thông báo:', err);
          this.toastService.error('Không thể xóa thông báo. Vui lòng thử lại sau.');
        }
      });
  }
  
  /**
   * Chuyển đổi Base64 URL sang mảng Uint8 cho Web Push API
   * Convert Base64 URL to Uint8Array for Web Push API
   * @param base64String Chuỗi Base64 cần chuyển đổi
   * @returns Mảng Uint8
   */
  private urlBase64ToUint8Array(base64String: string): Uint8Array {
    const padding = '='.repeat((4 - base64String.length % 4) % 4);
    const base64 = (base64String + padding)
      .replace(/-/g, '+')
      .replace(/_/g, '/');
    
    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);
    
    for (let i = 0; i < rawData.length; ++i) {
      outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
  }
  
  /**
   * Lấy tên hiển thị cho loại thông báo
   * Get display name for notification type
   * @param type Loại thông báo
   * @returns Tên hiển thị
   */
  getNotificationTypeLabel(type: NotificationType): string {
    const notificationType = this.notificationTypes.find(nt => nt.type === type);
    return notificationType ? notificationType.label : type;
  }
  
  /**
   * Làm mới dữ liệu thông báo
   * Refresh notification data
   */
  refreshNotifications(): void {
    this.loadRecentNotifications();
  }
  
  /**
   * Lấy danh sách thông báo tiếp theo (phân trang)
   * Get next page of notifications
   */
  loadMoreNotifications(): void {
    const currentPage = Math.ceil(this.notifications.length / 10);
    const nextPage = currentPage + 1;
    
    this.isLoadingNotifications = true;
    
    this.notificationService.getUserNotifications(nextPage, 10)
      .pipe(
        takeUntil(this._onDestroySub),
        finalize(() => {
          this.isLoadingNotifications = false;
        })
      )
      .subscribe(notifications => {
        if (notifications.length > 0) {
          this.notifications = [...this.notifications, ...notifications];
        } else {
          this.toastService.info('Không có thêm thông báo nào');
        }
      });
  }
  
  /**
   * Tiện ích truy cập danh sách danh mục thông báo dưới dạng FormArray
   * Utility getter for the notification categories as a FormArray
   */
  get categoriesFormArray() {
    return this.categoryPreferencesForm.get('categories') as FormArray;
  }
  
  /**
   * Xử lý lỗi và hiển thị thông báo lỗi
   * Handle error and display error message
   * @param err Đối tượng lỗi
   * @param defaultMessage Thông báo mặc định nếu không có thông tin lỗi chi tiết
   */
  private handleError(err: any, defaultMessage: string): void {
    console.error('Error:', err);
    const errorMessage = err?.error?.message || defaultMessage;
    this.error = errorMessage;
    this.toastService.error(errorMessage);
  }
}
