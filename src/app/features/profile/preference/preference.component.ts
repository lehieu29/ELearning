import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { BaseComponent } from '@app/shared/components/base/base-component';
import { PreferenceService } from '@app/shared/services/preference.service';
import { NotificationService } from '@app/shared/services/notification.service';
import { 
  UserPreference, 
  ThemePreference,
  ContentType,
  PreferenceSaveResponse 
} from '@app/shared/models/preference';
import { takeUntil, finalize, catchError } from 'rxjs/operators';
import { of } from 'rxjs';

@Component({
  selector: 'app-preference-center',
  templateUrl: './preference-center.component.html'
})
export class PreferenceCenterComponent extends BaseComponent implements OnInit {
  preferencesForm: FormGroup;
  userPreferences: UserPreference | null = null;
  
  isLoading = true;
  isSaving = false;
  isResetting = false;
  isImporting = false;
  isExporting = false;
  
  error = '';
  successMessage = '';
  
  // UI Control
  activeTab: 'appearance' | 'learning' | 'display' | 'accessibility' = 'appearance';
  showUnsavedChangesAlert = false;
  hasUnsavedChanges = false;
  
  // Form Options
  themeOptions: {value: ThemePreference, label: string}[] = [
    { value: 'light', label: 'Sáng' },
    { value: 'dark', label: 'Tối' },
    { value: 'system', label: 'Theo hệ thống' },
  ];
  
  languageOptions: {value: string, label: string}[] = [
    { value: 'vi', label: 'Tiếng Việt' },
    { value: 'en', label: 'English' },
    { value: 'fr', label: 'Français' },
    { value: 'de', label: 'Deutsch' },
    { value: 'es', label: 'Español' },
    { value: 'ja', label: '日本語' },
    { value: 'ko', label: '한국어' },
    { value: 'zh', label: '中文' },
  ];
  
  fontSizeOptions: {value: string, label: string}[] = [
    { value: 'small', label: 'Nhỏ' },
    { value: 'medium', label: 'Vừa' },
    { value: 'large', label: 'Lớn' },
    { value: 'x-large', label: 'Rất lớn' },
  ];
  
  contentDifficultyOptions: {value: string, label: string}[] = [
    { value: 'beginner', label: 'Người mới bắt đầu' },
    { value: 'intermediate', label: 'Trung cấp' },
    { value: 'advanced', label: 'Nâng cao' },
    { value: 'all', label: 'Tất cả' },
  ];
  
  videoQualityOptions: {value: string, label: string}[] = [
    { value: 'auto', label: 'Tự động' },
    { value: '360p', label: '360p' },
    { value: '480p', label: '480p' },
    { value: '720p', label: '720p' },
    { value: '1080p', label: '1080p' },
  ];
  
  playbackSpeedOptions: {value: number, label: string}[] = [
    { value: 0.5, label: '0.5x' },
    { value: 0.75, label: '0.75x' },
    { value: 1, label: '1x (Thông thường)' },
    { value: 1.25, label: '1.25x' },
    { value: 1.5, label: '1.5x' },
    { value: 1.75, label: '1.75x' },
    { value: 2, label: '2x' },
  ];
  
  dashboardLayoutOptions: {value: string, label: string}[] = [
    { value: 'standard', label: 'Tiêu chuẩn' },
    { value: 'compact', label: 'Gọn gàng' },
    { value: 'detailed', label: 'Chi tiết' },
  ];
  
  courseViewOptions: {value: string, label: string}[] = [
    { value: 'grid', label: 'Lưới' },
    { value: 'list', label: 'Danh sách' },
  ];
  
  sortByOptions: {value: string, label: string}[] = [
    { value: 'recent', label: 'Gần đây nhất' },
    { value: 'title', label: 'Theo tên' },
    { value: 'progress', label: 'Theo tiến độ' },
    { value: 'difficulty', label: 'Theo độ khó' },
  ];
  
  learningStyleOptions: {value: string, label: string}[] = [
    { value: 'visual', label: 'Trực quan' },
    { value: 'auditory', label: 'Thính giác' },
    { value: 'reading', label: 'Đọc/Viết' },
    { value: 'kinesthetic', label: 'Thực hành' },
    { value: 'mixed', label: 'Kết hợp' },
  ];
  
  contentTypeOptions: {value: ContentType, label: string}[] = [
    { value: 'video', label: 'Video' },
    { value: 'reading', label: 'Đọc' },
    { value: 'quiz', label: 'Trắc nghiệm' },
    { value: 'interactive', label: 'Tương tác' },
    { value: 'project', label: 'Dự án' },
  ];
  
  reminderFrequencyOptions: {value: string, label: string}[] = [
    { value: 'daily', label: 'Hàng ngày' },
    { value: 'weekdays', label: 'Ngày trong tuần' },
    { value: 'weekends', label: 'Cuối tuần' },
    { value: 'custom', label: 'Tùy chỉnh' },
  ];
  
  /**
   * Khởi tạo component với các dịch vụ cần thiết
   * Initialize component with required services
   * @param fb FormBuilder để tạo form
   * @param preferenceService Dịch vụ quản lý tùy chọn cá nhân hóa
   * @param notificationService Dịch vụ hiển thị thông báo
   */
  constructor(
    private fb: FormBuilder,
    private preferenceService: PreferenceService,
    private notificationService: NotificationService
  ) {
    super();
    
    // Khởi tạo form
    this.preferencesForm = this.fb.group({
      theme: ['light'],
      language: ['en'],
      
      accessibility: this.fb.group({
        fontSize: ['medium'],
        highContrast: [false],
        reduceMotion: [false],
        screenReader: [false],
        closedCaptions: [false],
        keyboardNavigation: [false]
      }),
      
      contentPreferences: this.fb.group({
        contentDifficulty: ['all'],
        showCompletedContent: [true],
        autoPlayVideos: [true],
        defaultVideoQuality: ['auto'],
        defaultPlaybackSpeed: [1]
      }),
      
      displayPreferences: this.fb.group({
        dashboardLayout: ['standard'],
        showProgressBars: [true],
        showTimeEstimates: [true],
        showCompletionPercentages: [true],
        defaultCourseView: ['grid'],
        defaultSortBy: ['recent']
      }),
      
      learningPreferences: this.fb.group({
        learningStyle: ['mixed'],
        preferredContentTypes: [['video', 'interactive']],
        studyReminders: [false],
        studyReminderFrequency: ['weekdays'],
        studySessionLength: [25],
        breakReminders: [false],
        breakReminderInterval: [30]
      })
    });
  }
  
  /**
   * Khởi tạo component và tải tùy chọn người dùng
   * Initialize component and load user preferences
   */
  ngOnInit(): void {
    this.loadPreferences();
    this.setupFormListeners();
  }
  
  /**
   * Tải tùy chọn cá nhân hóa của người dùng
   * Load user's personalization preferences
   */
  loadPreferences(): void {
    this.isLoading = true;
    this.error = '';
    
    this.preferenceService.getUserPreferences()
      .pipe(
        takeUntil(this._onDestroySub),
        finalize(() => {
          this.isLoading = false;
        }),
        catchError(error => {
          this.error = 'Không thể tải tùy chọn cá nhân hóa. Vui lòng thử lại sau.';
          this.notificationService.error(this.error);
          return of(null);
        })
      )
      .subscribe(preferences => {
        if (preferences) {
          this.userPreferences = preferences;
          this.updateFormWithPreferences(preferences);
        }
      });
  }
  
  /**
   * Thiết lập các lắng nghe sự kiện thay đổi form
   * Set up form change listeners
   */
  setupFormListeners(): void {
    this.preferencesForm.valueChanges
      .pipe(takeUntil(this._onDestroySub))
      .subscribe(() => {
        this.hasUnsavedChanges = true;
      });
  }
  
  /**
   * Cập nhật form với tùy chọn người dùng đã tải
   * Update form with loaded user preferences
   * @param preferences Tùy chọn người dùng đã tải
   */
  updateFormWithPreferences(preferences: UserPreference): void {
    this.preferencesForm.patchValue({
      theme: preferences.theme,
      language: preferences.language,
      accessibility: { ...preferences.accessibility },
      contentPreferences: { ...preferences.contentPreferences },
      displayPreferences: { ...preferences.displayPreferences },
      learningPreferences: { ...preferences.learningPreferences }
    }, { emitEvent: false });
    
    this.hasUnsavedChanges = false;
  }
  
  /**
   * Lưu các thay đổi tùy chọn cá nhân hóa
   * Save personalization preference changes
   */
  savePreferences(): void {
    if (this.preferencesForm.invalid) {
      return;
    }
    
    this.isSaving = true;
    this.error = '';
    this.successMessage = '';
    
    const updatedPreferences = this.preferencesForm.value;
    
    this.preferenceService.updateUserPreferences(updatedPreferences)
      .pipe(
        takeUntil(this._onDestroySub),
        finalize(() => {
          this.isSaving = false;
        }),
        catchError(error => {
          this.error = 'Không thể lưu tùy chọn cá nhân hóa. Vui lòng thử lại sau.';
          this.notificationService.error(this.error);
          return of(null);
        })
      )
      .subscribe((response: PreferenceSaveResponse | null) => {
        if (response && response.success) {
          this.successMessage = 'Đã lưu tùy chọn cá nhân hóa thành công!';
          this.notificationService.success(this.successMessage);
          this.hasUnsavedChanges = false;
          
          if (response.preference) {
            this.userPreferences = response.preference;
          }
        }
      });
  }
  
  /**
   * Đặt lại tùy chọn về giá trị mặc định
   * Reset preferences to default values
   * @param section Phần cụ thể cần đặt lại, nếu không cung cấp sẽ đặt lại tất cả
   */
  resetPreferences(section?: string): void {
    this.isResetting = true;
    this.error = '';
    
    this.preferenceService.resetPreferences(section)
      .pipe(
        takeUntil(this._onDestroySub),
        finalize(() => {
          this.isResetting = false;
        }),
        catchError(error => {
          this.error = 'Không thể đặt lại tùy chọn. Vui lòng thử lại sau.';
          this.notificationService.error(this.error);
          return of(null);
        })
      )
      .subscribe((response: PreferenceSaveResponse | null) => {
        if (response && response.success) {
          this.notificationService.success('Đã đặt lại tùy chọn thành công!');
          
          if (response.preference) {
            this.userPreferences = response.preference;
            this.updateFormWithPreferences(response.preference);
          } else {
            // Nếu không nhận được tùy chọn mới, tải lại
            this.loadPreferences();
          }
        }
      });
  }
  
  /**
   * Xuất tùy chọn người dùng thành file
   * Export user preferences to file
   */
  exportPreferences(): void {
    this.isExporting = true;
    
    this.preferenceService.exportPreferences()
      .pipe(
        takeUntil(this._onDestroySub),
        finalize(() => {
          this.isExporting = false;
        }),
        catchError(error => {
          this.error = 'Không thể xuất tùy chọn. Vui lòng thử lại sau.';
          this.notificationService.error(this.error);
          return of(null);
        })
      )
      .subscribe(blob => {
        if (blob) {
          // Tạo file và thúc đẩy tải xuống
          const url = window.URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = `user-preferences-${new Date().toISOString().split('T')[0]}.json`;
          document.body.appendChild(a);
          a.click();
          window.URL.revokeObjectURL(url);
          document.body.removeChild(a);
          
          this.notificationService.success('Đã xuất tùy chọn thành công!');
        }
      });
  }
  
  /**
   * Xử lý sự kiện nhập file tùy chọn
   * Handle preference file import event
   * @param event Sự kiện thay đổi input file
   */
  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    
    if (input.files && input.files.length > 0) {
      const file = input.files[0];
      
      if (file.type !== 'application/json' && !file.name.endsWith('.json')) {
        this.notificationService.error('Vui lòng chọn file JSON hợp lệ.');
        return;
      }
      
      this.importPreferences(file);
    }
  }
  
  /**
   * Nhập tùy chọn từ file đã chọn
   * Import preferences from selected file
   * @param file File tùy chọn đã chọn
   */
  importPreferences(file: File): void {
    this.isImporting = true;
    this.error = '';
    
    this.preferenceService.importPreferences(file)
      .pipe(
        takeUntil(this._onDestroySub),
        finalize(() => {
          this.isImporting = false;
        }),
        catchError(error => {
          this.error = 'Không thể nhập tùy chọn. Vui lòng kiểm tra định dạng file và thử lại.';
          this.notificationService.error(this.error);
          return of(null);
        })
      )
      .subscribe((response: PreferenceSaveResponse | null) => {
        if (response && response.success) {
          this.notificationService.success('Đã nhập tùy chọn thành công!');
          
          if (response.preference) {
            this.userPreferences = response.preference;
            this.updateFormWithPreferences(response.preference);
          } else {
            // Nếu không nhận được tùy chọn mới, tải lại
            this.loadPreferences();
          }
        }
      });
  }
  
  /**
   * Chuyển đổi tab hiện tại
   * Switch current tab
   * @param tab Tab muốn chuyển đến
   */
  switchTab(tab: 'appearance' | 'learning' | 'display' | 'accessibility'): void {
    this.activeTab = tab;
  }
  
  /**
   * Áp dụng chủ đề hiện tại cho ứng dụng
   * Apply current theme to the application
   */
  applyTheme(): void {
    const theme = this.preferencesForm.get('theme')?.value;
    document.documentElement.setAttribute('data-theme', theme);
    
    // Trong ứng dụng thực tế, có thể cần lưu tùy chọn này vào local storage
    // hoặc gửi lên server ngay lập tức
  }
}
