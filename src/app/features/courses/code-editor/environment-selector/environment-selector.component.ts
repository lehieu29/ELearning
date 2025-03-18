import { Component, OnInit, Input, Output, EventEmitter, HostListener } from '@angular/core';
import { takeUntil, finalize } from 'rxjs/operators';
import { BaseComponent } from '@app/shared/components/base/base-component';
import { CodeEditorService } from '../services/code-editor.service';
import { CodeEnvironment } from '../models/code-environment.model';
import { NotificationService } from '@app/shared/services/notification.service';

@Component({
  selector: 'app-environment-selector',
  templateUrl: './environment-selector.component.html'
})
export class EnvironmentSelectorComponent extends BaseComponent implements OnInit {
  @Input() courseId: string = '';
  @Input() exerciseId: string = '';
  @Input() selectedLanguage: string = 'javascript';
  @Output() languageChanged = new EventEmitter<string>();
  @Output() environmentChanged = new EventEmitter<CodeEnvironment>();
  
  environments: CodeEnvironment[] = [];
  selectedEnvironment?: CodeEnvironment;
  isLoading: boolean = false;
  showEnvironments: boolean = false;
  error: string = '';
  
  /**
   * Khởi tạo component với các dịch vụ cần thiết
   * Initialize the component with required services
   * @param codeEditorService Dịch vụ quản lý môi trường biên soạn mã
   * @param notificationService Dịch vụ hiển thị thông báo
   */
  constructor(
    private codeEditorService: CodeEditorService,
    private notificationService: NotificationService
  ) {
    super();
  }
  
  /**
   * Khởi tạo component và tải danh sách môi trường
   * Initialize component and load environments
   */
  ngOnInit(): void {
    this.loadEnvironments();
  }
  
  /**
   * Tải danh sách môi trường từ server dựa trên ngôn ngữ hiện tại
   * Load available environments from server based on current language
   */
  loadEnvironments(): void {
    this.isLoading = true;
    this.error = '';
    
    this.codeEditorService.getAvailableEnvironments(this.selectedLanguage)
      .pipe(
        takeUntil(this._onDestroySub),
        finalize(() => {
          this.isLoading = false;
        })
      )
      .subscribe({
        next: (environments) => {
          this.environments = environments;
          
          if (this.environments.length === 0) {
            this.error = `Không có môi trường nào khả dụng cho ${this.selectedLanguage}`;
            return;
          }
          
          // Nếu có ID môi trường đã lưu, sử dụng nó
          // If we have a saved environment ID, use it
          if (this.courseId && this.exerciseId) {
            this.loadSavedEnvironment();
          } else {
            // Chọn môi trường mặc định cho ngôn ngữ
            // Select default environment for language
            this.selectDefaultEnvironment();
          }
        },
        error: (err) => {
          console.error('Lỗi khi tải danh sách môi trường:', err);
          this.error = `Không thể tải môi trường cho ${this.selectedLanguage}. Vui lòng thử lại.`;
        }
      });
  }
  
  /**
   * Tải môi trường đã lưu từ trước nếu có
   * Load previously saved environment if available
   */
  loadSavedEnvironment(): void {
    if (!this.courseId || !this.exerciseId) return;
    
    this.codeEditorService.getSavedEnvironment(this.courseId, this.exerciseId)
      .pipe(takeUntil(this._onDestroySub))
      .subscribe({
        next: (savedEnvironmentId) => {
          if (savedEnvironmentId) {
            const savedEnv = this.environments.find(env => env.id === savedEnvironmentId);
            if (savedEnv) {
              this.selectEnvironment(savedEnv);
              return;
            }
          }
          
          // Nếu không có môi trường đã lưu hoặc không tìm thấy, chọn môi trường mặc định
          // If no saved environment or it wasn't found, select default
          this.selectDefaultEnvironment();
        },
        error: (err) => {
          console.error('Lỗi khi tải môi trường đã lưu:', err);
          // Fallback to default on error
          this.selectDefaultEnvironment();
        }
      });
  }
  
  /**
   * Chọn môi trường mặc định cho ngôn ngữ hiện tại
   * Select default environment for current language
   */
  selectDefaultEnvironment(): void {
    // Tìm môi trường được đánh dấu là mặc định
    // Find environment marked as default
    const defaultEnv = this.environments.find(env => 
      env.language === this.selectedLanguage && env.isDefault);
    
    if (defaultEnv) {
      this.selectEnvironment(defaultEnv);
    } else if (this.environments.length > 0) {
      // Nếu không có môi trường mặc định, chọn môi trường đầu tiên
      // If no default environment, select the first one
      this.selectEnvironment(this.environments[0]);
    }
  }
  
  /**
   * Chọn và áp dụng một môi trường
   * Select and apply an environment
   * @param environment Môi trường được chọn
   */
  selectEnvironment(environment: CodeEnvironment): void {
    if (this.selectedEnvironment?.id === environment.id) {
      this.closeDropdown();
      return;
    }
    
    this.selectedEnvironment = environment;
    this.environmentChanged.emit(environment);
    
    // Nếu môi trường mới có ngôn ngữ khác, thông báo thay đổi ngôn ngữ
    // If new environment has different language, notify language change
    if (environment.language !== this.selectedLanguage) {
      this.selectedLanguage = environment.language;
      this.languageChanged.emit(environment.language);
    }
    
    this.closeDropdown();
    
    // Lưu tùy chọn môi trường nếu có thông tin khóa học và bài tập
    // Save environment preference if course and exercise info is provided
    if (this.courseId && this.exerciseId) {
      this.saveEnvironmentPreference(environment.id);
    }
  }
  
  /**
   * Lưu tùy chọn môi trường cho người dùng
   * Save environment preference for user
   * @param environmentId ID của môi trường cần lưu
   */
  saveEnvironmentPreference(environmentId: string): void {
    if (!this.courseId || !this.exerciseId) return;
    
    this.codeEditorService.saveEnvironmentPreference(
      this.courseId, 
      this.exerciseId, 
      environmentId
    )
      .pipe(takeUntil(this._onDestroySub))
      .subscribe({
        next: () => {
          // Preference saved successfully
        },
        error: (err) => {
          console.error('Lỗi khi lưu tùy chọn môi trường:', err);
          // Don't show this error to the user as it's not critical
        }
      });
  }
  
  /**
   * Chuyển đổi hiển thị/ẩn dropdown môi trường
   * Toggle environment dropdown visibility
   */
  toggleEnvironmentsDropdown(): void {
    this.showEnvironments = !this.showEnvironments;
    
    // Nếu đang mở dropdown nhưng chưa có dữ liệu, tải lại
    // If opening dropdown but no data, reload
    if (this.showEnvironments && this.environments.length === 0 && !this.isLoading) {
      this.loadEnvironments();
    }
  }
  
  /**
   * Đóng dropdown khi click ra ngoài
   * Close dropdown when clicking outside
   */
  closeDropdown(): void {
    this.showEnvironments = false;
  }
  
  /**
   * Lấy thông tin phiên bản hiển thị
   * Get display version information
   * @param env Môi trường cần hiển thị phiên bản
   * @returns Chuỗi phiên bản để hiển thị
   */
  getVersionDisplay(env: CodeEnvironment): string {
    return env.version ? `v${env.version}` : '';
  }
  
  /**
   * Xử lý thay đổi ngôn ngữ
   * Handle language change
   * @param language Ngôn ngữ mới được chọn
   */
  onLanguageChange(language: string): void {
    if (this.selectedLanguage === language) return;
    
    this.selectedLanguage = language;
    this.languageChanged.emit(language);
    this.loadEnvironments();
  }
  
  /**
   * Xử lý sự kiện click ngoài component để đóng dropdown
   * Handle click outside component to close dropdown
   * @param event Sự kiện click
   */
  @HostListener('document:click', ['$event'])
  onClickOutside(event: Event): void {
    if (!(event.target as HTMLElement).closest('app-environment-selector')) {
      this.closeDropdown();
    }
  }
}
