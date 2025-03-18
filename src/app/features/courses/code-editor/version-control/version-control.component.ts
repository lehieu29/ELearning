import { Component, OnInit, Input } from '@angular/core';
import { takeUntil } from 'rxjs/operators';
import { BaseComponent } from '@app/shared/components/base/base-component';
import { CodeEditorService } from '../services/code-editor.service';
import { CodeVersion } from '../models/code-version.model';
import { NotificationService } from '@app/shared/services/notification.service';

@Component({
  selector: 'app-version-control',
  templateUrl: './version-control.component.html'
})
export class VersionControlComponent extends BaseComponent implements OnInit {
  @Input() courseId: string = '';
  @Input() lessonId: string = '';
  @Input() exerciseId: string = '';
  @Input() currentCode: string = '';
  @Input() language: string = '';
  
  versions: CodeVersion[] = [];
  selectedVersion?: CodeVersion;
  showVersionHistory: boolean = false;
  showVersionList: boolean = false;
  isLoading: boolean = false;
  isSaving: boolean = false;
  error: string = '';
  snapshotDescription: string = '';
  
  /**
   * Khởi tạo component với các dịch vụ cần thiết
   * Initialize the component with required services
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
   * Khởi tạo component
   * Initialize the component
   */
  ngOnInit(): void {
    // Không có hành động nào cần thực hiện khi khởi tạo
    // No actions needed on initialization
  }
  
  /**
   * Chuyển đổi hiển thị/ẩn danh sách phiên bản
   * Toggle version list visibility
   */
  toggleVersionList(): void {
    this.showVersionList = !this.showVersionList;
    
    if (this.showVersionList && this.versions.length === 0) {
      this.loadVersions();
    }
  }
  
  /**
   * Hiển thị/ẩn modal lịch sử phiên bản
   * Toggle version history modal visibility
   */
  toggleVersionHistory(): void {
    this.showVersionHistory = !this.showVersionHistory;
    this.error = '';
    
    if (this.showVersionHistory && this.versions.length === 0) {
      this.loadVersions();
    }
  }
  
  /**
   * Tải danh sách phiên bản từ server
   * Load versions list from server
   */
  loadVersions(): void {
    if (!this.courseId || !this.lessonId || !this.exerciseId) {
      this.error = 'Không thể tải phiên bản: Thiếu thông tin khóa học, bài học hoặc bài tập.';
      return;
    }
    
    this.isLoading = true;
    this.error = '';
    
    this.codeEditorService.getCodeVersions(this.courseId, this.lessonId, this.exerciseId)
      .pipe(takeUntil(this._onDestroySub))
      .subscribe({
        next: (versions) => {
          this.versions = versions;
          this.isLoading = false;
        },
        error: (err) => {
          console.error('Lỗi khi tải lịch sử phiên bản:', err);
          this.error = 'Không thể tải lịch sử phiên bản. Vui lòng thử lại sau.';
          this.isLoading = false;
          this.notificationService.error('Không thể tải lịch sử phiên bản.');
        }
      });
  }
  
  /**
   * Tạo nhanh một bản snapshot của mã nguồn hiện tại
   * Quickly create a snapshot of current code
   */
  createSnapshot(): void {
    const timestamp = new Date().toLocaleTimeString();
    this.saveVersion(`Snapshot at ${timestamp}`);
  }
  
  /**
   * Lưu phiên bản hiện tại với mô tả
   * Save current version with description
   * @param description Mô tả phiên bản / Version description
   */
  saveVersion(description: string): void {
    if (!this.currentCode) {
      this.notificationService.warning('Không có mã nguồn để lưu.');
      return;
    }
    
    if (!this.courseId || !this.lessonId || !this.exerciseId) {
      this.error = 'Không thể lưu phiên bản: Thiếu thông tin khóa học, bài học hoặc bài tập.';
      this.notificationService.error('Không thể lưu phiên bản: Thiếu thông tin cần thiết.');
      return;
    }
    
    this.isSaving = true;
    this.error = '';
    
    this.codeEditorService.saveCodeVersion(
      this.courseId, 
      this.lessonId, 
      this.exerciseId, 
      this.currentCode,
      this.language,
      description
    )
      .pipe(takeUntil(this._onDestroySub))
      .subscribe({
        next: (newVersion) => {
          this.versions = [newVersion, ...this.versions];
          this.isSaving = false;
          this.notificationService.success('Đã lưu phiên bản mã nguồn thành công.');
          this.snapshotDescription = ''; // Clear input field after saving
        },
        error: (err) => {
          console.error('Lỗi khi lưu phiên bản mã nguồn:', err);
          this.error = 'Không thể lưu phiên bản mã nguồn. Vui lòng thử lại sau.';
          this.isSaving = false;
          this.notificationService.error('Không thể lưu phiên bản mã nguồn.');
        }
      });
  }
  
  /**
   * Xem nội dung của phiên bản được chọn
   * View content of selected version
   * @param version Phiên bản cần xem / Version to view
   */
  viewVersion(version: CodeVersion): void {
    this.selectedVersion = version;
  }
  
  /**
   * Khôi phục phiên bản được chọn
   * Restore selected version
   * @param version Phiên bản cần khôi phục / Version to restore
   */
  restoreVersion(version: CodeVersion): void {
    if (!this.courseId || !this.lessonId || !this.exerciseId) {
      this.error = 'Không thể khôi phục phiên bản: Thiếu thông tin khóa học, bài học hoặc bài tập.';
      this.notificationService.error('Không thể khôi phục phiên bản: Thiếu thông tin cần thiết.');
      return;
    }
    
    this.isLoading = true;
    this.error = '';
    
    this.codeEditorService.restoreCodeVersion(
      this.courseId, 
      this.lessonId, 
      this.exerciseId, 
      version.id
    )
      .pipe(takeUntil(this._onDestroySub))
      .subscribe({
        next: (restoredCode) => {
          // Emit event to update editor with restored code
          window.dispatchEvent(new CustomEvent('code-version-restored', { 
            detail: { 
              code: restoredCode.code, 
              language: restoredCode.language 
            }
          }));
          
          this.showVersionHistory = false;
          this.showVersionList = false;
          this.isLoading = false;
          this.notificationService.success('Đã khôi phục mã nguồn thành công.');
        },
        error: (err) => {
          console.error('Lỗi khi khôi phục phiên bản:', err);
          this.error = 'Không thể khôi phục phiên bản mã nguồn. Vui lòng thử lại sau.';
          this.isLoading = false;
          this.notificationService.error('Không thể khôi phục phiên bản mã nguồn.');
        }
      });
  }
  
  /**
   * Xóa phiên bản được chọn
   * Delete selected version
   * @param version Phiên bản cần xóa / Version to delete
   * @param event Sự kiện DOM / DOM event
   */
  deleteVersion(version: CodeVersion, event: Event): void {
    event.stopPropagation();
    
    if (!this.courseId || !this.lessonId || !this.exerciseId) {
      this.error = 'Không thể xóa phiên bản: Thiếu thông tin khóa học, bài học hoặc bài tập.';
      this.notificationService.error('Không thể xóa phiên bản: Thiếu thông tin cần thiết.');
      return;
    }
    
    if (!confirm('Bạn có chắc chắn muốn xóa phiên bản này không?')) {
      return;
    }
    
    this.isLoading = true;
    this.error = '';
    
    this.codeEditorService.deleteCodeVersion(
      this.courseId, 
      this.lessonId, 
      this.exerciseId, 
      version.id
    )
      .pipe(takeUntil(this._onDestroySub))
      .subscribe({
        next: () => {
          this.versions = this.versions.filter(v => v.id !== version.id);
          this.isLoading = false;
          
          if (this.selectedVersion && this.selectedVersion.id === version.id) {
            this.selectedVersion = undefined;
          }
          
          this.notificationService.success('Đã xóa phiên bản mã nguồn thành công.');
        },
        error: (err) => {
          console.error('Lỗi khi xóa phiên bản:', err);
          this.error = 'Không thể xóa phiên bản mã nguồn. Vui lòng thử lại sau.';
          this.isLoading = false;
          this.notificationService.error('Không thể xóa phiên bản mã nguồn.');
        }
      });
  }
  
  /**
   * Đóng xem chi tiết phiên bản
   * Close version detail view
   */
  closeVersionDetail(): void {
    this.selectedVersion = undefined;
  }
  
  /**
   * Định dạng ngôn ngữ lập trình để hiển thị
   * Format programming language for display
   * @param language Mã ngôn ngữ / Language code
   * @returns Tên hiển thị của ngôn ngữ / Display name of language
   */
  formatLanguage(language: string): string {
    const languageMap = {
      'js': 'JavaScript',
      'javascript': 'JavaScript',
      'ts': 'TypeScript',
      'typescript': 'TypeScript',
      'py': 'Python',
      'python': 'Python',
      'java': 'Java',
      'c': 'C',
      'cpp': 'C++',
      'cs': 'C#',
      'html': 'HTML',
      'css': 'CSS',
      'php': 'PHP',
      'ruby': 'Ruby',
      'go': 'Go',
      'swift': 'Swift'
    };
    
    return languageMap[language.toLowerCase()] || language;
  }
}
