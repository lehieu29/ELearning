import { Component, OnInit, Input } from '@angular/core';
import { takeUntil } from 'rxjs/operators';
import { BaseComponent } from '@shared/components/base/base-component';
import { CodeEditorService } from '../services/code-editor.service';
import { CodeVersion } from '../models/code-version.model';

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
  isLoading: boolean = false;
  
  constructor(private codeEditorService: CodeEditorService) {
    super();
  }
  
  ngOnInit(): void {}
  
  // Hiển thị modal lịch sử phiên bản
  toggleVersionHistory(): void {
    this.showVersionHistory = !this.showVersionHistory;
    
    if (this.showVersionHistory && this.versions.length === 0) {
      this.loadVersions();
    }
  }
  
  // Tải danh sách phiên bản từ server
  loadVersions(): void {
    if (!this.courseId || !this.lessonId || !this.exerciseId) {
      return;
    }
    
    this.isLoading = true;
    
    this.codeEditorService.getCodeVersions(this.courseId, this.lessonId, this.exerciseId)
      .pipe(takeUntil(this._onDestroySub))
      .subscribe({
        next: (versions) => {
          this.versions = versions;
          this.isLoading = false;
        },
        error: (err) => {
          console.error('Failed to load code versions:', err);
          this.isLoading = false;
        }
      });
  }
  
  // Lưu phiên bản hiện tại với mô tả
  saveVersion(description: string): void {
    if (!this.currentCode || !this.courseId || !this.lessonId || !this.exerciseId) {
      return;
    }
    
    this.isLoading = true;
    
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
          this.isLoading = false;
        },
        error: (err) => {
          console.error('Failed to save version:', err);
          this.isLoading = false;
        }
      });
  }
  
  // Xem nội dung của phiên bản được chọn
  viewVersion(version: CodeVersion): void {
    this.selectedVersion = version;
  }
  
  // Khôi phục phiên bản được chọn
  restoreVersion(version: CodeVersion): void {
    if (!this.courseId || !this.lessonId || !this.exerciseId) {
      return;
    }
    
    this.isLoading = true;
    
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
            detail: { code: restoredCode.code, language: restoredCode.language }
          }));
          this.showVersionHistory = false;
          this.isLoading = false;
        },
        error: (err) => {
          console.error('Failed to restore version:', err);
          this.isLoading = false;
        }
      });
  }
  
  // Xóa phiên bản được chọn
  deleteVersion(version: CodeVersion, event: Event): void {
    event.stopPropagation();
    
    if (!this.courseId || !this.lessonId || !this.exerciseId) {
      return;
    }
    
    if (!confirm('Are you sure you want to delete this version?')) {
      return;
    }
    
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
        },
        error: (err) => {
          console.error('Failed to delete version:', err);
        }
      });
  }
}
