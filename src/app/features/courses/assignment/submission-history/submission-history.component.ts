import { Component, Input, OnInit, OnChanges, SimpleChanges } from '@angular/core';
import { BaseComponent } from '@app/shared/components/base/base-component';
import { CourseService } from '@app/shared/services/course.service';
import { SubmissionHistory } from '@app/shared/models/assignment.model';
import { takeUntil, finalize, catchError } from 'rxjs/operators';
import { of } from 'rxjs';
import { NotificationService } from '@app/shared/services/notification.service';

@Component({
  selector: 'app-submission-history',
  templateUrl: './submission-history.component.html'
})
export class SubmissionHistoryComponent extends BaseComponent implements OnInit, OnChanges {
  @Input() courseId: string;
  @Input() assignmentId: string;
  
  isLoading = true;
  error: string = '';
  submissions: SubmissionHistory[] = [];
  
  /**
   * Khởi tạo component với các dịch vụ cần thiết
   * Initialize component with required services
   * @param courseService Service để truy vấn dữ liệu khóa học
   * @param notificationService Service để hiển thị thông báo
   */
  constructor(
    private courseService: CourseService,
    private notificationService: NotificationService
  ) {
    super();
  }
  
  /**
   * Khởi tạo component và tải dữ liệu lịch sử nộp bài
   * Initialize component and load submission history data
   */
  ngOnInit(): void {
    if (this.courseId && this.assignmentId) {
      this.loadSubmissionHistory();
    }
  }
  
  /**
   * Xử lý khi các inputs thay đổi để tải lại dữ liệu
   * Handle changes to inputs to reload data
   * @param changes Các thay đổi của inputs
   */
  ngOnChanges(changes: SimpleChanges): void {
    if ((changes.courseId && !changes.courseId.firstChange) || 
        (changes.assignmentId && !changes.assignmentId.firstChange)) {
      if (this.courseId && this.assignmentId) {
        this.loadSubmissionHistory();
      }
    }
  }
  
  /**
   * Tải lịch sử nộp bài của sinh viên
   * Load student's submission history
   */
  loadSubmissionHistory(): void {
    this.isLoading = true;
    this.error = '';
    
    if (!this.courseId || !this.assignmentId) {
      this.error = 'Không thể tải lịch sử nộp bài: Thiếu thông tin khóa học hoặc bài tập';
      this.isLoading = false;
      return;
    }
    
    this.courseService.getSubmissionHistory(this.courseId, this.assignmentId)
      .pipe(
        takeUntil(this._onDestroySub),
        finalize(() => {
          this.isLoading = false;
        }),
        catchError(err => {
          console.error('Lỗi khi tải lịch sử nộp bài:', err);
          this.error = 'Không thể tải lịch sử nộp bài. Vui lòng thử lại sau.';
          return of([]);
        })
      )
      .subscribe(history => {
        this.submissions = history;
        
        // Sắp xếp lịch sử nộp bài theo thời gian, mới nhất lên đầu
        // Sort submission history by time, newest first
        if (this.submissions.length > 0) {
          this.submissions.sort((a, b) => {
            return new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime();
          });
        }
      });
  }
  
  /**
   * Tải lại lịch sử nộp bài
   * Reload submission history
   */
  refreshHistory(): void {
    this.loadSubmissionHistory();
  }
  
  /**
   * Xóa thông báo lỗi
   * Clear error message
   */
  clearError(): void {
    this.error = '';
  }
  
  /**
   * Lấy màu chữ tương ứng với trạng thái nộp bài
   * Get text color corresponding to submission status
   * @param status Trạng thái nộp bài
   * @returns Tên lớp CSS cho màu chữ
   */
  getStatusColor(status: string): string {
    switch (status) {
      case 'graded':
        return 'text-green-600';
      case 'submitted':
        return 'text-blue-600';
      case 'late':
        return 'text-yellow-600';
      case 'rejected':
        return 'text-red-600';
      default:
        return 'text-gray-600';
    }
  }
  
  /**
   * Lấy màu nền tương ứng với trạng thái nộp bài
   * Get background color corresponding to submission status
   * @param status Trạng thái nộp bài
   * @returns Tên lớp CSS cho màu nền
   */
  getStatusBgColor(status: string): string {
    switch (status) {
      case 'graded':
        return 'bg-green-100';
      case 'submitted':
        return 'bg-blue-100';
      case 'late':
        return 'bg-yellow-100';
      case 'rejected':
        return 'bg-red-100';
      default:
        return 'bg-gray-100';
    }
  }
  
  /**
   * Lấy tên hiển thị cho trạng thái nộp bài
   * Get display name for submission status
   * @param status Trạng thái nộp bài
   * @returns Tên hiển thị bằng tiếng Việt
   */
  getStatusDisplayName(status: string): string {
    switch (status) {
      case 'graded':
        return 'Đã chấm điểm';
      case 'submitted':
        return 'Đã nộp';
      case 'late':
        return 'Nộp muộn';
      case 'rejected':
        return 'Bị từ chối';
      default:
        return 'Chưa xác định';
    }
  }
  
  /**
   * Tải xuống bài nộp
   * Download submission file
   * @param fileUrl URL tệp tin nộp
   * @param fileName Tên tệp tin nộp (tùy chọn)
   */
  downloadSubmission(fileUrl: string, fileName?: string): void {
    if (!fileUrl) {
      this.notificationService.warning('Không tìm thấy tệp tin để tải xuống');
      return;
    }
    
    // Tạo liên kết tạm thời để tải xuống
    // Create temporary link to download file
    const a = document.createElement('a');
    a.href = fileUrl;
    a.download = fileName || 'submission-file';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  }
}
