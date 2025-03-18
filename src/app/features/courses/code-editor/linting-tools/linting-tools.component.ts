import { Component, OnInit, Input, OnChanges, SimpleChanges, HostListener } from '@angular/core';
import { BaseComponent } from '@app/shared/components/base/base-component';
import { CodeEditorService } from '../services/code-editor.service';
import { LintingResult } from '../models/linting-result.model';
import { NotificationService } from '@app/shared/services/notification.service';
import { takeUntil, finalize, debounceTime } from 'rxjs/operators';
import { Subject } from 'rxjs';

@Component({
  selector: 'app-linting-tools',
  templateUrl: './linting-tools.component.html'
})
export class LintingToolsComponent extends BaseComponent implements OnInit, OnChanges {
  @Input() code: string = '';
  @Input() language: string = 'javascript';
  
  lintingResults: LintingResult[] = [];
  showLintingPanel: boolean = false;
  isLinting: boolean = false;
  hasErrors: boolean = false;
  hasWarnings: boolean = false;
  error: string = '';
  
  errorCount: number = 0;
  warningCount: number = 0;
  
  private codeChangeSubject = new Subject<void>();
  
  /**
   * Khởi tạo component với các dịch vụ cần thiết
   * Initialize component with required services
   * @param codeEditorService Dịch vụ quản lý mã nguồn
   * @param notificationService Dịch vụ thông báo
   */
  constructor(
    private codeEditorService: CodeEditorService,
    private notificationService: NotificationService
  ) {
    super();
  }
  
  /**
   * Khởi tạo component và thiết lập cơ chế debounce cho việc kiểm tra lỗi
   * Initialize component and set up debounce mechanism for linting
   */
  ngOnInit(): void {
    // Thiết lập debounce để tránh gọi API quá nhiều lần khi code thay đổi
    // Set up debounce to avoid calling API too frequently when code changes
    this.codeChangeSubject
      .pipe(
        takeUntil(this._onDestroySub),
        debounceTime(800)
      )
      .subscribe(() => {
        this.performLinting();
      });
  }
  
  /**
   * Phản ứng khi các input properties thay đổi
   * React when input properties change
   * @param changes Các thay đổi của input properties
   */
  ngOnChanges(changes: SimpleChanges): void {
    if ((changes.code && !changes.code.firstChange) || 
        (changes.language && !changes.language.firstChange)) {
      this.codeChangeSubject.next();
    }
  }
  
  /**
   * Thực hiện kiểm tra lỗi mã nguồn
   * Perform code linting
   */
  performLinting(): void {
    if (!this.code || !this.language) return;
    
    this.isLinting = true;
    this.error = '';
    
    this.codeEditorService.lintCode(this.code, this.language)
      .pipe(
        takeUntil(this._onDestroySub),
        finalize(() => {
          this.isLinting = false;
        })
      )
      .subscribe({
        next: (results) => {
          this.lintingResults = results || [];
          this.updateStatusIndicators();
        },
        error: (err) => {
          console.error('Lỗi khi kiểm tra mã nguồn:', err);
          this.error = 'Không thể kiểm tra mã nguồn. Vui lòng thử lại sau.';
          this.lintingResults = [];
          this.updateStatusIndicators();
        }
      });
  }
  
  /**
   * Cập nhật các chỉ báo trạng thái dựa trên kết quả kiểm tra
   * Update status indicators based on linting results
   */
  updateStatusIndicators(): void {
    this.errorCount = this.lintingResults.filter(result => result.severity === 'error').length;
    this.warningCount = this.lintingResults.filter(result => result.severity === 'warning').length;
    
    this.hasErrors = this.errorCount > 0;
    this.hasWarnings = this.warningCount > 0;
  }
  
  /**
   * Bật/tắt bảng hiển thị kết quả kiểm tra
   * Toggle linting results panel
   */
  toggleLintingPanel(): void {
    this.showLintingPanel = !this.showLintingPanel;
    
    if (this.showLintingPanel && this.lintingResults.length === 0 && !this.isLinting) {
      this.performLinting();
    }
  }
  
  /**
   * Xử lý khi nhấp nút "Fix All"
   * Handle when "Fix All" button is clicked
   */
  fixAllIssues(): void {
    if (this.lintingResults.length === 0) return;
    
    this.isLinting = true;
    
    this.codeEditorService.autoFixLintingIssues(this.code, this.language)
      .pipe(
        takeUntil(this._onDestroySub),
        finalize(() => {
          this.isLinting = false;
        })
      )
      .subscribe({
        next: (result) => {
          if (result.fixedCode) {
            // Dispatch event to notify code editor of the fixed code
            window.dispatchEvent(
              new CustomEvent('code-auto-fixed', { 
                detail: { code: result.fixedCode } 
              })
            );
            
            this.notificationService.success(`Đã tự động sửa ${result.fixedIssues || 'các'} vấn đề.`);
            
            // Re-lint after fixing
            setTimeout(() => this.performLinting(), 500);
          } else {
            this.notificationService.info('Không thể tự động sửa các vấn đề.');
          }
        },
        error: (err) => {
          console.error('Lỗi khi tự động sửa mã nguồn:', err);
          this.error = 'Không thể tự động sửa mã nguồn. Vui lòng thử lại sau.';
          this.notificationService.error('Không thể tự động sửa mã nguồn.');
        }
      });
  }
  
  /**
   * Đóng bảng linting khi click ra ngoài
   * Close linting panel when clicking outside
   */
  @HostListener('document:click', ['$event'])
  onClickOutside(event: Event): void {
    if (!(event.target as HTMLElement).closest('app-linting-tools') && this.showLintingPanel) {
      this.showLintingPanel = false;
    }
  }
  
  /**
   * Lấy biểu tượng trạng thái kiểm tra
   * Get linting status icon
   * @returns Tên biểu tượng dựa trên trạng thái
   */
  getLintingStatusIcon(): string {
    if (this.isLinting) {
      return 'loading'; 
    }
    if (this.hasErrors) {
      return 'error';
    }
    if (this.hasWarnings) {
      return 'warning';
    }
    return 'check';
  }
  
  /**
   * Lấy lớp CSS cho trạng thái kiểm tra
   * Get CSS class for linting status
   * @returns Tên lớp CSS dựa trên trạng thái
   */
  getLintingStatusClass(): string {
    if (this.hasErrors) {
      return 'text-red-500';
    }
    if (this.hasWarnings) {
      return 'text-yellow-500';
    }
    return 'text-green-500';
  }
  
  /**
   * Lấy màu cho từng loại nghiêm trọng của vấn đề
   * Get color for each severity level
   * @param severity Mức độ nghiêm trọng
   * @returns Tên lớp CSS cho màu tương ứng
   */
  getSeverityColor(severity: string): string {
    switch (severity) {
      case 'error':
        return 'text-red-600';
      case 'warning':
        return 'text-yellow-600';
      case 'info':
        return 'text-blue-600';
      default:
        return 'text-gray-600';
    }
  }
  
  /**
   * Lấy biểu tượng cho từng loại nghiêm trọng của vấn đề
   * Get icon for each severity level
   * @param severity Mức độ nghiêm trọng
   * @returns Tên biểu tượng tương ứng
   */
  getSeverityIcon(severity: string): string {
    switch (severity) {
      case 'error':
        return 'x-circle';
      case 'warning':
        return 'alert-triangle';
      case 'info':
        return 'info';
      default:
        return 'message-circle';
    }
  }
}
