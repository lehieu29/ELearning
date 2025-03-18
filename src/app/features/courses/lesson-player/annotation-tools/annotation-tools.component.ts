import { Component, Input, OnInit } from '@angular/core';
import { BaseComponent } from '@app/shared/components/base/base-component';
import { CourseService } from '@app/shared/services/course.service';
import { NotificationService } from '@app/shared/services/notification.service';
import { takeUntil } from 'rxjs/operators';

interface Annotation {
  id: string;
  text: string;
  timestamp: number; // in seconds
  createdAt: Date;
  color: string;
}

@Component({
  selector: 'app-annotation-tools',
  templateUrl: './annotation-tools.component.html'
})
export class AnnotationToolsComponent extends BaseComponent implements OnInit {
  @Input() courseId: string;
  @Input() lessonId: string;
  @Input() currentTime: number = 0;

  annotations: Annotation[] = [];
  newAnnotation: string = '';
  isLoading: boolean = false;
  isSubmitting: boolean = false;
  selectedColor: string = '#FFFF00'; // Default: yellow
  error: string = '';
  
  colorOptions: string[] = [
    '#FFFF00', // Yellow
    '#FF9D00', // Orange
    '#FF5252', // Red
    '#36B37E', // Green
    '#00B8D9', // Blue
    '#6554C0'  // Purple
  ];

  constructor(
    private courseService: CourseService,
    private notificationService: NotificationService
  ) {
    super();
  }

  /**
   * Khởi tạo component và tải các ghi chú đã có
   * Initialize component and load existing annotations
   */
  ngOnInit(): void {
    if (this.courseId && this.lessonId) {
      this.loadAnnotations();
    }
  }

  /**
   * Tải danh sách các ghi chú từ API
   * Load annotations list from API
   */
  loadAnnotations(): void {
    this.isLoading = true;
    this.error = '';
    
    this.courseService.getLessonAnnotations(this.courseId, this.lessonId)
      .pipe(takeUntil(this._onDestroySub))
      .subscribe({
        next: (annotations) => {
          this.annotations = annotations;
          this.isLoading = false;
        },
        error: (err) => {
          console.error('Lỗi khi tải ghi chú:', err);
          this.error = 'Không thể tải ghi chú. Vui lòng thử lại sau.';
          this.isLoading = false;
        }
      });
  }

  /**
   * Thêm ghi chú mới tại thời điểm hiện tại của video
   * Add new annotation at current video timestamp
   */
  addAnnotation(): void {
    if (!this.newAnnotation.trim()) return;
    
    // Create new annotation object
    const newItem: Annotation = {
      id: Date.now().toString(), // Temporary ID until server responds
      text: this.newAnnotation,
      timestamp: this.currentTime,
      createdAt: new Date(),
      color: this.selectedColor
    };
    
    this.isSubmitting = true;
    
    this.courseService.createAnnotation(this.courseId, this.lessonId, {
      text: this.newAnnotation,
      timestamp: this.currentTime,
      color: this.selectedColor
    })
      .pipe(takeUntil(this._onDestroySub))
      .subscribe({
        next: (savedAnnotation) => {
          // Replace temporary annotation with the one from server (which has a proper ID)
          this.annotations = [savedAnnotation, ...this.annotations];
          this.newAnnotation = '';
          this.isSubmitting = false;
        },
        error: (err) => {
          console.error('Lỗi khi lưu ghi chú:', err);
          this.notificationService.error('Không thể lưu ghi chú. Vui lòng thử lại.');
          this.isSubmitting = false;
        }
      });
  }
  
  /**
   * Xóa một ghi chú đã tồn tại
   * Delete an existing annotation
   * @param id ID của ghi chú cần xóa
   */
  deleteAnnotation(id: string): void {
    // Optimistic UI update
    const annotationIndex = this.annotations.findIndex(a => a.id === id);
    if (annotationIndex === -1) return;
    
    const deletedAnnotation = this.annotations[annotationIndex];
    this.annotations = this.annotations.filter(a => a.id !== id);
    
    this.courseService.deleteAnnotation(this.courseId, this.lessonId, id)
      .pipe(takeUntil(this._onDestroySub))
      .subscribe({
        next: () => {
          this.notificationService.success('Đã xóa ghi chú.');
        },
        error: (err) => {
          console.error('Lỗi khi xóa ghi chú:', err);
          this.notificationService.error('Không thể xóa ghi chú. Thử lại sau.');
          
          // Restore the annotation if deletion failed
          this.annotations.splice(annotationIndex, 0, deletedAnnotation);
        }
      });
  }
  
  /**
   * Tìm kiếm đến thời điểm có ghi chú
   * Seek to timestamp with annotation
   * @param timestamp Thời gian (giây) cần tìm kiếm đến
   */
  seekToTimestamp(timestamp: number): void {
    // Emit event to parent component
    window.dispatchEvent(
      new CustomEvent('seek-to-timestamp', { detail: { timestamp } })
    );
  }
  
  /**
   * Định dạng thời gian từ giây sang MM:SS
   * Format time from seconds to MM:SS
   * @param seconds Thời gian tính bằng giây
   * @returns Chuỗi thời gian định dạng MM:SS
   */
  formatTimestamp(seconds: number): string {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  }
  
  /**
   * Kiểm tra xem ghi chú có ở thời điểm hiện tại không
   * Check if annotation is at current timestamp
   * @param timestamp Thời gian của ghi chú
   * @returns true nếu ghi chú gần với thời điểm hiện tại
   */
  isCurrentTimestamp(timestamp: number): boolean {
    // Consider it "current" if within 2 seconds
    return Math.abs(timestamp - this.currentTime) <= 2;
  }
}
