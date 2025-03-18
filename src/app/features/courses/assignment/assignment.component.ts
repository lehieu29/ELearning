// File path: src/app/features/courses/assignment/assignment.component.ts
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { BaseComponent } from '@app/shared/components/base/base-component';
import { CourseService } from '@app/shared/services/course.service';
import { NotificationService } from '@app/shared/services/notification.service';
import { Assignment, SubmissionStatus } from '@app/shared/models/assignment.model';
import { takeUntil, finalize, catchError } from 'rxjs/operators';
import { of } from 'rxjs';

@Component({
  selector: 'app-assignment',
  templateUrl: './assignment.component.html'
})
export class AssignmentComponent extends BaseComponent implements OnInit {
  courseId: string;
  assignmentId: string;
  assignment: Assignment | null = null;
  
  isLoading = true;
  isLoadingStatus = false;
  error: string = '';
  
  uploadProgress: number = 0;
  submissionStatus: SubmissionStatus = 'not-submitted';
  
  /**
   * Khởi tạo component với các dịch vụ cần thiết
   * Initialize component with required services
   * @param route Service để truy cập thông tin route
   * @param courseService Service để lấy dữ liệu khóa học và bài tập
   * @param notificationService Service để hiển thị thông báo
   */
  constructor(
    private route: ActivatedRoute,
    private courseService: CourseService,
    private notificationService: NotificationService
  ) {
    super();
  }
  
  /**
   * Khởi tạo component và theo dõi các tham số từ route
   * Initialize component and track route parameters
   */
  ngOnInit(): void {
    // Lấy courseId từ route cha
    // Get courseId from parent route
    this.route.parent.paramMap
      .pipe(takeUntil(this._onDestroySub))
      .subscribe({
        next: params => {
          this.courseId = params.get('courseId');
        },
        error: err => {
          console.error('Lỗi khi đọc tham số từ route cha:', err);
          this.error = 'Không thể tải thông tin khóa học. Vui lòng thử lại sau.';
          this.isLoading = false;
        }
      });
      
    // Lấy assignmentId từ route hiện tại
    // Get assignmentId from current route
    this.route.paramMap
      .pipe(takeUntil(this._onDestroySub))
      .subscribe({
        next: params => {
          this.assignmentId = params.get('assignmentId');
          if (this.courseId && this.assignmentId) {
            this.loadAssignment();
          } else if (!this.courseId) {
            this.error = 'Thiếu thông tin khóa học.';
            this.isLoading = false;
          } else if (!this.assignmentId) {
            this.error = 'Thiếu thông tin bài tập.';
            this.isLoading = false;
          }
        },
        error: err => {
          console.error('Lỗi khi đọc tham số từ route:', err);
          this.error = 'Không thể tải thông tin bài tập. Vui lòng thử lại sau.';
          this.isLoading = false;
        }
      });
  }
  
  /**
   * Tải thông tin chi tiết của bài tập
   * Load assignment details
   */
  loadAssignment(): void {
    this.isLoading = true;
    this.error = '';
    
    this.courseService.getAssignmentById(this.courseId, this.assignmentId)
      .pipe(
        takeUntil(this._onDestroySub),
        finalize(() => {
          this.isLoading = false;
        }),
        catchError(err => {
          console.error('Lỗi khi tải thông tin bài tập:', err);
          this.error = 'Không thể tải thông tin bài tập. Vui lòng thử lại sau.';
          return of(null);
        })
      )
      .subscribe(assignment => {
        if (assignment) {
          this.assignment = assignment;
          this.loadSubmissionStatus();
        }
      });
  }
  
  /**
   * Tải thông tin trạng thái nộp bài của sinh viên
   * Load student's submission status
   */
  loadSubmissionStatus(): void {
    this.isLoadingStatus = true;
    
    this.courseService.getAssignmentSubmissionStatus(this.courseId, this.assignmentId)
      .pipe(
        takeUntil(this._onDestroySub),
        finalize(() => {
          this.isLoadingStatus = false;
        }),
        catchError(err => {
          console.error('Lỗi khi tải trạng thái nộp bài:', err);
          // Giữ trạng thái mặc định nếu không thể tải
          // Keep default status if cannot load
          return of('not-submitted' as SubmissionStatus);
        })
      )
      .subscribe(status => {
        this.submissionStatus = status;
      });
  }
  
  /**
   * Cập nhật tiến trình tải lên tập tin
   * Update file upload progress
   * @param progress Phần trăm tiến trình tải lên
   */
  onFileUploadProgress(progress: number): void {
    this.uploadProgress = progress;
  }
  
  /**
   * Xử lý khi nộp bài thành công
   * Handle successful submission completion
   */
  onSubmissionComplete(): void {
    this.submissionStatus = 'submitted';
    this.notificationService.success('Bài tập đã được nộp thành công.');
    this.loadSubmissionStatus();
  }
  
  /**
   * Làm mới thông tin bài tập
   * Refresh assignment information
   */
  refreshAssignment(): void {
    this.loadAssignment();
  }
  
  /**
   * Xóa thông báo lỗi
   * Clear error message
   */
  clearError(): void {
    this.error = '';
  }
  
  /**
   * Kiểm tra xem bài tập có đã quá hạn nộp hay không
   * Check if assignment is past due date
   * @returns true nếu đã quá hạn nộp
   */
  isPastDue(): boolean {
    if (!this.assignment || !this.assignment.dueDate) {
      return false;
    }
    
    const dueDate = new Date(this.assignment.dueDate);
    const now = new Date();
    
    return now > dueDate;
  }
  
  /**
   * Lấy văn bản thông báo về thời gian còn lại hoặc quá hạn
   * Get time remaining or overdue message
   * @returns Chuỗi thông báo thời gian
   */
  getTimeMessage(): string {
    if (!this.assignment || !this.assignment.dueDate) {
      return 'Không có thời hạn';
    }
    
    const dueDate = new Date(this.assignment.dueDate);
    const now = new Date();
    
    if (now > dueDate) {
      const overdueDays = Math.floor((now.getTime() - dueDate.getTime()) / (1000 * 3600 * 24));
      return `Đã quá hạn ${overdueDays} ngày`;
    } else {
      const remainingDays = Math.floor((dueDate.getTime() - now.getTime()) / (1000 * 3600 * 24));
      const remainingHours = Math.floor((dueDate.getTime() - now.getTime()) / (1000 * 3600)) % 24;
      
      if (remainingDays > 0) {
        return `Còn ${remainingDays} ngày ${remainingHours} giờ`;
      } else {
        return `Còn ${remainingHours} giờ`;
      }
    }
  }
  
  /**
   * Kiểm tra xem sinh viên có thể nộp bài không dựa trên trạng thái
   * Check if student can submit based on status
   * @returns true nếu có thể nộp bài
   */
  canSubmit(): boolean {
    return this.submissionStatus !== 'graded' && 
           (this.submissionStatus !== 'submitted' || this.assignment?.allowResubmission);
  }
}
