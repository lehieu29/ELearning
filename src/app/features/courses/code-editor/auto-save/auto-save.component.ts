import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { takeUntil } from 'rxjs/operators';
import { BaseComponent } from '@shared/components/base/base-component';
import { CodeEditorService } from '../services/code-editor.service';

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
  private autoSaveTimer?: any;
  
  constructor(private codeEditorService: CodeEditorService) {
    super();
  }
  
  ngOnInit(): void {
    // Khởi tạo timer tự động lưu khi component được tạo
    this.initAutoSave();
    
    // Lấy trạng thái lưu tự động từ localStorage
    this.loadAutoSavePreference();
  }
  
  // Khởi tạo tính năng tự động lưu
  initAutoSave(): void {
    if (this.isAutoSaveEnabled) {
      this.startAutoSaveTimer();
    }
  }
  
  // Bắt đầu timer tự động lưu
  startAutoSaveTimer(): void {
    this.clearAutoSaveTimer();
    this.autoSaveTimer = setInterval(() => {
      this.saveCode();
    }, this.saveInterval);
  }
  
  // Xóa timer tự động lưu
  clearAutoSaveTimer(): void {
    if (this.autoSaveTimer) {
      clearInterval(this.autoSaveTimer);
      this.autoSaveTimer = undefined;
    }
  }
  
  // Lưu mã nguồn hiện tại
  saveCode(): void {
    if (!this.code || !this.courseId || !this.lessonId || !this.exerciseId || this.saveInProgress) {
      return;
    }
    
    this.saveInProgress = true;
    
    this.codeEditorService.saveCode(this.courseId, this.lessonId, this.exerciseId, this.code, this.language)
      .pipe(takeUntil(this._onDestroySub))
      .subscribe({
        next: () => {
          this.lastSavedAt = new Date();
          this.saveCompleted.emit(this.lastSavedAt);
          this.saveInProgress = false;
        },
        error: (err) => {
          console.error('Failed to auto-save code:', err);
          this.saveInProgress = false;
        }
      });
  }
  
  // Bật/tắt tính năng tự động lưu
  toggleAutoSave(): void {
    this.isAutoSaveEnabled = !this.isAutoSaveEnabled;
    
    if (this.isAutoSaveEnabled) {
      this.startAutoSaveTimer();
    } else {
      this.clearAutoSaveTimer();
    }
    
    // Lưu cài đặt vào localStorage
    localStorage.setItem('code-editor-autosave', this.isAutoSaveEnabled.toString());
  }
  
  // Lấy trạng thái lưu tự động từ localStorage
  loadAutoSavePreference(): void {
    const savedPreference = localStorage.getItem('code-editor-autosave');
    if (savedPreference !== null) {
      this.isAutoSaveEnabled = savedPreference === 'true';
    }
  }
  
  // Cưỡng chế lưu ngay lập tức
  forceSave(): void {
    this.saveCode();
  }
  
  // Khi component bị hủy, hãy xóa timer
  override ngOnDestroy(): void {
    this.clearAutoSaveTimer();
    super.ngOnDestroy();
  }
}
