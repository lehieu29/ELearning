import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { takeUntil } from 'rxjs/operators';
import { BaseComponent } from '@app/shared/components/base/base-component';
import { CodeEditorService } from '../services/code-editor.service';
import { NotificationService } from '@app/shared/services/notification.service';
import { HttpErrorResponse } from '@angular/common/http';

@Component({
  selector: 'app-auto-save',
  templateUrl: './auto-save.component.html'
})
export class AutoSaveComponent extends BaseComponent implements OnInit {
  @Input() courseId: string = '';
  @Input() lessonId: string = '';
  @Input() exerciseId: string = '';
  @Input() code: string = '';
  @Input() language: string = '';
  @Output() saveCompleted = new EventEmitter<Date>();
  
  isAutoSaveEnabled: boolean = true;
  lastSavedAt?: Date;
  saveInProgress: boolean = false;
  saveInterval: number = 30000; // 30 seconds
  errorMessage: string = '';
  private autoSaveTimer?: any;
  
  /**
   * Khởi tạo component với các dịch vụ cần thiết
   * Initialize component with required services
   * @param codeEditorService Dịch vụ quản lý mã nguồn trong trình soạn thảo
   * @param notificationService Dịch vụ hiển thị thông báo
   */
  constructor(
    private codeEditorService: CodeEditorService,
    private notificationService: NotificationService
  ) {
    super();
  }
  
  /**
   * Khởi tạo component và thiết lập chức năng tự động lưu
   * Initialize component and setup auto-save functionality
   */
  ngOnInit(): void {
    // Lấy trạng thái lưu tự động từ localStorage
    // Get auto-save state from localStorage
    this.loadAutoSavePreference();
    
    // Khởi tạo timer tự động lưu nếu tính năng được bật
    // Initialize auto-save timer if feature is enabled
    this.initAutoSave();
    
    // Kiểm tra lần lưu cuối cùng từ localStorage
    // Check for last save time from localStorage
    const lastSaveTime = localStorage.getItem(`code-editor-last-saved-${this.courseId}-${this.lessonId}-${this.exerciseId}`);
    if (lastSaveTime) {
      this.lastSavedAt = new Date(lastSaveTime);
    }
  }
  
  /**
   * Khởi tạo tính năng tự động lưu dựa trên cài đặt người dùng
   * Initialize auto-save feature based on user settings
   */
  initAutoSave(): void {
    if (this.isAutoSaveEnabled) {
      this.startAutoSaveTimer();
    }
  }
  
  /**
   * Bắt đầu bộ đếm thời gian để tự động lưu mã nguồn
   * Start timer for auto-saving code
   */
  startAutoSaveTimer(): void {
    this.clearAutoSaveTimer();
    
    this.autoSaveTimer = setInterval(() => {
      if (this.code) {
        this.saveCode();
      }
    }, this.saveInterval);
  }
  
  /**
   * Xóa bộ đếm thời gian tự động lưu
   * Clear auto-save timer
   */
  clearAutoSaveTimer(): void {
    if (this.autoSaveTimer) {
      clearInterval(this.autoSaveTimer);
      this.autoSaveTimer = undefined;
    }
  }
  
  /**
   * Lưu mã nguồn hiện tại lên máy chủ
   * Save the current code to the server
   */
  saveCode(): void {
    // Kiểm tra các điều kiện cần thiết trước khi lưu
    // Check necessary conditions before saving
    if (!this.code || !this.courseId || !this.lessonId || !this.exerciseId || this.saveInProgress) {
      return;
    }
    
    // Đánh dấu đang trong quá trình lưu
    // Mark as save in progress
    this.saveInProgress = true;
    this.errorMessage = '';
    
    const saveData = {
      code: this.code,
      language: this.language
    };
    
    this.codeEditorService.saveExerciseCode(this.courseId, this.lessonId, this.exerciseId, saveData)
      .pipe(takeUntil(this._onDestroySub))
      .subscribe({
        next: () => {
          // Cập nhật thời gian lưu gần nhất
          // Update last saved time
          this.lastSavedAt = new Date();
          localStorage.setItem(`code-editor-last-saved-${this.courseId}-${this.lessonId}-${this.exerciseId}`, 
                              this.lastSavedAt.toISOString());
          
          // Thông báo hoàn thành
          // Emit completion
          this.saveCompleted.emit(this.lastSavedAt);
          this.saveInProgress = false;
        },
        error: (err: HttpErrorResponse) => {
          console.error('Lỗi khi tự động lưu mã nguồn:', err);
          
          // Hiển thị lỗi một cách phù hợp
          // Display error appropriately
          this.errorMessage = 'Không thể lưu mã nguồn. Vui lòng thử lại sau.';
          
          if (err.status === 401) {
            this.notificationService.error('Phiên làm việc của bạn đã hết hạn. Vui lòng đăng nhập lại.');
          } else if (err.status === 403) {
            this.notificationService.error('Bạn không có quyền lưu mã nguồn này.');
          } else {
            this.notificationService.error('Không thể lưu mã nguồn. Đã xảy ra lỗi.');
          }
          
          this.saveInProgress = false;
        }
      });
  }
  
  /**
   * Bật/tắt tính năng tự động lưu
   * Toggle auto-save feature on/off
   */
  toggleAutoSave(): void {
    this.isAutoSaveEnabled = !this.isAutoSaveEnabled;
    
    if (this.isAutoSaveEnabled) {
      this.startAutoSaveTimer();
      this.notificationService.info('Đã bật tính năng tự động lưu.');
    } else {
      this.clearAutoSaveTimer();
      this.notificationService.info('Đã tắt tính năng tự động lưu.');
    }
    
    // Lưu cài đặt vào localStorage
    // Save setting to localStorage
    localStorage.setItem('code-editor-autosave', this.isAutoSaveEnabled.toString());
  }
  
  /**
   * Lấy cài đặt tự động lưu từ localStorage
   * Get auto-save setting from localStorage
   */
  loadAutoSavePreference(): void {
    const savedPreference = localStorage.getItem('code-editor-autosave');
    if (savedPreference !== null) {
      this.isAutoSaveEnabled = savedPreference === 'true';
    }
  }
  
  /**
   * Cưỡng chế lưu mã nguồn ngay lập tức
   * Force saving code immediately
   */
  forceSave(): void {
    if (!this.code) {
      this.notificationService.warning('Không có mã nguồn để lưu.');
      return;
    }
    
    this.saveCode();
    
    // Chỉ hiển thị thông báo khi không có lỗi
    // Only show notification when there's no error
    if (!this.errorMessage) {
      this.notificationService.success('Đã lưu mã nguồn thành công.');
    }
  }
  
  /**
   * Định dạng thời gian lưu để hiển thị
   * Format save time for display
   * @param date Thời gian cần định dạng
   * @returns Chuỗi thời gian đã định dạng
   */
  formatSaveTime(date: Date): string {
    if (!date) return '';
    
    const now = new Date();
    const diff = Math.floor((now.getTime() - date.getTime()) / 1000); // Seconds difference
    
    if (diff < 60) {
      return 'vừa xong';
    } else if (diff < 3600) {
      const minutes = Math.floor(diff / 60);
      return `${minutes} phút trước`;
    } else if (diff < 86400) {
      const hours = Math.floor(diff / 3600);
      return `${hours} giờ trước`;
    } else {
      return date.toLocaleDateString('vi-VN', {
        hour: '2-digit',
        minute: '2-digit'
      });
    }
  }
  
  /**
   * Xóa bộ đếm thời gian khi component bị hủy
   * Clean up timer when component is destroyed
   */
  override ngOnDestroy(): void {
    this.clearAutoSaveTimer();
    super.ngOnDestroy();
  }
}
