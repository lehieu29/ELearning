import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { BaseComponent } from '@app/shared/components/base/base-component';
import { CourseService } from '@app/shared/services/course.service';
import { UserPreferencesService } from '@app/shared/services/user-preferences.service';
import { takeUntil, finalize } from 'rxjs/operators';
import { NotificationService } from '@app/shared/services/notification.service';

export interface AccessibilityPreferences {
  fontSize: 'small' | 'default' | 'large' | 'x-large';
  contrast: 'default' | 'high' | 'inverted';
  animations: 'enabled' | 'reduced' | 'disabled';
  screenReaderOptimized: boolean;
  autoGenerateTranscripts: boolean;
  showCaptions: boolean;
  useKeyboardShortcuts: boolean;
  textToSpeech: boolean;
  readingSpeed: number;
}

@Component({
  selector: 'app-content-accessibility',
  templateUrl: './content-accessibility.component.html'
})
export class ContentAccessibilityComponent extends BaseComponent implements OnInit {
  courseId: string;
  isLoading = false;
  isSaving = false;
  error = '';
  
  accessibilityForm: FormGroup;
  transcriptsEnabled = true;
  userPreferences: AccessibilityPreferences;
  
  fontSizeOptions = [
    { value: 'small', label: 'Nhỏ' },
    { value: 'default', label: 'Mặc định' },
    { value: 'large', label: 'Lớn' },
    { value: 'x-large', label: 'Rất lớn' }
  ];
  
  contrastOptions = [
    { value: 'default', label: 'Mặc định' },
    { value: 'high', label: 'Tương phản cao' },
    { value: 'inverted', label: 'Màu đảo ngược' }
  ];
  
  animationOptions = [
    { value: 'enabled', label: 'Bật' },
    { value: 'reduced', label: 'Giảm' },
    { value: 'disabled', label: 'Tắt' }
  ];
  
  /**
   * Khởi tạo component với các dịch vụ cần thiết
   * Initialize component with required services
   * @param route Dịch vụ để truy cập thông tin route
   * @param fb FormBuilder để tạo form
   * @param courseService Dịch vụ để lấy thông tin khóa học
   * @param preferencesService Dịch vụ để quản lý tùy chọn người dùng
   * @param notificationService Dịch vụ để hiển thị thông báo
   */
  constructor(
    private route: ActivatedRoute,
    private fb: FormBuilder,
    private courseService: CourseService,
    private preferencesService: UserPreferencesService,
    private notificationService: NotificationService
  ) {
    super();
    
    // Khởi tạo form với các giá trị mặc định
    // Initialize form with default values
    this.accessibilityForm = this.fb.group({
      fontSize: ['default'],
      contrast: ['default'],
      animations: ['enabled'],
      screenReaderOptimized: [false],
      autoGenerateTranscripts: [true],
      showCaptions: [true],
      useKeyboardShortcuts: [true],
      textToSpeech: [false],
      readingSpeed: [1]
    });
  }
  
  /**
   * Khởi tạo component và đăng ký theo dõi các thay đổi của route
   * Initialize component and subscribe to route changes
   */
  ngOnInit(): void {
    this.route.parent.paramMap
      .pipe(takeUntil(this._onDestroySub))
      .subscribe(params => {
        this.courseId = params.get('courseId');
        this.loadUserPreferences();
      });
      
    // Theo dõi thay đổi của textToSpeech để hiển thị/ẩn tùy chọn tốc độ đọc
    // Monitor textToSpeech changes to show/hide reading speed option
    this.accessibilityForm.get('textToSpeech').valueChanges
      .pipe(takeUntil(this._onDestroySub))
      .subscribe(enabled => {
        const readingSpeedControl = this.accessibilityForm.get('readingSpeed');
        if (enabled) {
          readingSpeedControl.enable();
        } else {
          readingSpeedControl.disable();
        }
      });
  }
  
  /**
   * Tải tùy chọn trợ năng của người dùng từ server
   * Load user accessibility preferences from server
   */
  loadUserPreferences(): void {
    this.isLoading = true;
    this.error = '';
    
    this.preferencesService.getUserAccessibilityPreferences()
      .pipe(
        takeUntil(this._onDestroySub),
        finalize(() => {
          this.isLoading = false;
        })
      )
      .subscribe({
        next: (preferences) => {
          this.userPreferences = preferences;
          
          // Cập nhật form với giá trị từ server
          // Update form with values from server
          this.accessibilityForm.patchValue({
            fontSize: preferences.fontSize || 'default',
            contrast: preferences.contrast || 'default',
            animations: preferences.animations || 'enabled',
            screenReaderOptimized: preferences.screenReaderOptimized || false,
            autoGenerateTranscripts: preferences.autoGenerateTranscripts !== false,
            showCaptions: preferences.showCaptions !== false,
            useKeyboardShortcuts: preferences.useKeyboardShortcuts !== false,
            textToSpeech: preferences.textToSpeech || false,
            readingSpeed: preferences.readingSpeed || 1
          });
          
          // Áp dụng cài đặt ngay lập tức
          // Apply settings immediately
          this.applyAccessibilitySettings(preferences);
        },
        error: (err) => {
          console.error('Lỗi khi tải tùy chọn trợ năng:', err);
          this.error = 'Không thể tải tùy chọn trợ năng của bạn. Đang sử dụng cài đặt mặc định.';
        }
      });
  }
  
  /**
   * Lưu tùy chọn trợ năng của người dùng lên server
   * Save user accessibility preferences to server
   */
  savePreferences(): void {
    if (this.accessibilityForm.invalid) {
      this.notificationService.warning('Vui lòng kiểm tra lại form. Một số giá trị không hợp lệ.');
      return;
    }
    
    const preferences = this.accessibilityForm.value as AccessibilityPreferences;
    this.isSaving = true;
    this.error = '';
    
    this.preferencesService.saveUserAccessibilityPreferences(preferences)
      .pipe(
        takeUntil(this._onDestroySub),
        finalize(() => {
          this.isSaving = false;
        })
      )
      .subscribe({
        next: () => {
          // Áp dụng các thay đổi cho phiên hiện tại
          // Apply changes to current session
          this.applyAccessibilitySettings(preferences);
          this.notificationService.success('Đã lưu tùy chọn trợ năng của bạn thành công.');
          
          // Cập nhật trạng thái người dùng
          // Update user preferences
          this.userPreferences = { ...preferences };
        },
        error: (err) => {
          console.error('Lỗi khi lưu tùy chọn trợ năng:', err);
          this.error = 'Không thể lưu tùy chọn trợ năng của bạn. Vui lòng thử lại sau.';
          this.notificationService.error('Không thể lưu tùy chọn. Đã xảy ra lỗi.');
        }
      });
  }
  
  /**
   * Áp dụng cài đặt trợ năng cho giao diện người dùng hiện tại
   * Apply accessibility settings to current user interface
   * @param settings Các cài đặt trợ năng cần áp dụng
   */
  applyAccessibilitySettings(settings: AccessibilityPreferences): void {
    // Cỡ chữ - Font size
    document.documentElement.classList.remove('text-small', 'text-default', 'text-large', 'text-x-large');
    document.documentElement.classList.add(`text-${settings.fontSize}`);
    
    // Độ tương phản - Contrast
    document.documentElement.classList.remove('contrast-default', 'contrast-high', 'contrast-inverted');
    document.documentElement.classList.add(`contrast-${settings.contrast}`);
    
    // Hiệu ứng - Animations
    document.documentElement.classList.remove('animations-enabled', 'animations-reduced', 'animations-disabled');
    document.documentElement.classList.add(`animations-${settings.animations}`);
    
    // Tối ưu hóa cho trình đọc màn hình - Screen reader optimization
    if (settings.screenReaderOptimized) {
      document.documentElement.setAttribute('role', 'application');
      document.documentElement.setAttribute('aria-live', 'polite');
    } else {
      document.documentElement.removeAttribute('role');
      document.documentElement.removeAttribute('aria-live');
    }
    
    // Thiết lập cho tính năng text-to-speech - Text-to-speech settings
    if (settings.textToSpeech) {
      this.configureTextToSpeech(settings.readingSpeed);
    }
    
    // Áp dụng các cài đặt khác theo cần thiết - Apply other settings as needed
    localStorage.setItem('accessibilitySettings', JSON.stringify(settings));
    
    // Thông báo cho các component khác về thay đổi cài đặt trợ năng
    // Notify other components about accessibility setting changes
    window.dispatchEvent(new CustomEvent('accessibilitySettingsChanged', { detail: settings }));
  }
  
  /**
   * Cấu hình tính năng text-to-speech với tốc độ chỉ định
   * Configure text-to-speech feature with specified speed
   * @param speed Tốc độ đọc (0.5 - 2.0)
   */
  configureTextToSpeech(speed: number): void {
    // Implementation would typically use Web Speech API or a similar service
    // This is just a placeholder for the actual implementation
    if ('speechSynthesis' in window) {
      (window as any).speechSynthesisRate = speed;
      console.log('Text-to-speech configured with speed:', speed);
    }
  }
  
  /**
   * Đặt lại tất cả các tùy chọn về giá trị mặc định
   * Reset all preferences to default values
   */
  resetToDefaults(): void {
    const defaultSettings: AccessibilityPreferences = {
      fontSize: 'default',
      contrast: 'default',
      animations: 'enabled',
      screenReaderOptimized: false,
      autoGenerateTranscripts: true,
      showCaptions: true,
      useKeyboardShortcuts: true,
      textToSpeech: false,
      readingSpeed: 1
    };
    
    this.accessibilityForm.setValue(defaultSettings);
    this.notificationService.info('Đã đặt lại tất cả tùy chọn về giá trị mặc định.');
    
    // Áp dụng thay đổi nhưng không lưu - Apply changes but don't save yet
    this.applyAccessibilitySettings(defaultSettings);
  }
  
  /**
   * Kiểm tra cài đặt hiện tại bằng cách áp dụng tạm thời
   * Test current settings by applying them temporarily
   */
  testSettings(): void {
    const currentSettings = this.accessibilityForm.value as AccessibilityPreferences;
    this.applyAccessibilitySettings(currentSettings);
    this.notificationService.info('Đã áp dụng cài đặt mới. Bạn có thể thấy thay đổi ngay bây giờ.');
  }
  
  /**
   * Kiểm tra xem thiết bị có hỗ trợ text-to-speech không
   * Check if the device supports text-to-speech
   * @returns True nếu thiết bị hỗ trợ text-to-speech
   */
  isTtsSupported(): boolean {
    return 'speechSynthesis' in window;
  }
  
  /**
   * Xóa thông báo lỗi hiện tại
   * Clear current error message
   */
  clearError(): void {
    this.error = '';
  }
  
  /**
   * Lấy giá trị hiển thị cho tốc độ đọc
   * Get display value for reading speed
   * @returns Chuỗi hiển thị tốc độ đọc
   */
  getReadingSpeedDisplay(): string {
    const speed = this.accessibilityForm.get('readingSpeed').value;
    if (speed === 1) return 'Bình thường';
    return speed < 1 ? 'Chậm' : 'Nhanh';
  }
}
