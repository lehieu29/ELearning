import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { BaseComponent } from '@app/shared/components/base/base-component';
import { CourseService } from '@app/shared/services/course.service';
import { NotificationService } from '@app/shared/services/notification.service';
import { takeUntil, finalize, catchError } from 'rxjs/operators';
import { of } from 'rxjs';

interface PeerReviewAssignment {
  id: string;
  title: string;
  description: string;
  dueDate: Date;
  submissionCount: number;
  status: 'pending' | 'in_progress' | 'completed';
  assignedSubmissions?: PeerSubmission[];
}

interface PeerSubmission {
  id: string;
  studentName: string;
  submissionDate: Date;
  files: Array<{fileName: string, fileUrl: string, fileSize: number}>;
  reviewed: boolean;
  reviewDue: Date;
}

interface PeerReviewDetails {
  assignmentId: string;
  submissionId: string;
  overallRating: number;
  detailedRatings: {
    content: number;
    structure: number;
    creativity: number;
    requirements: number;
  };
  feedback: string;
  strengthPoints?: string;
  improvementPoints?: string;
}

@Component({
  selector: 'app-peer-review',
  templateUrl: './peer-review.component.html'
})
export class PeerReviewComponent extends BaseComponent implements OnInit {
  courseId: string;
  assignments: PeerReviewAssignment[] = [];
  selectedAssignment: PeerReviewAssignment | null = null;
  selectedSubmission: PeerSubmission | null = null;
  
  isLoading = true;
  isLoadingSubmissions = false;
  isReviewFormVisible = false;
  isSubmitting = false;
  error: string = '';
  
  reviewForm: FormGroup;
  
  // Review criteria
  reviewCriteria = [
    { id: 'content', name: 'Chất lượng nội dung', description: 'Độ chính xác và chất lượng của nội dung bài nộp' },
    { id: 'structure', name: 'Tổ chức', description: 'Mức độ tổ chức và cấu trúc của bài nộp' },
    { id: 'creativity', name: 'Sáng tạo', description: 'Ý tưởng độc đáo và cách tiếp cận sáng tạo' },
    { id: 'requirements', name: 'Yêu cầu', description: 'Mức độ đáp ứng yêu cầu của bài tập' }
  ];
  
  /**
   * Khởi tạo component với các dịch vụ cần thiết
   * Initialize component with required services
   * @param route Service để truy cập thông tin route
   * @param courseService Service để truy cập dữ liệu khóa học
   * @param fb FormBuilder để tạo form
   * @param notificationService Service để hiển thị thông báo
   */
  constructor(
    private route: ActivatedRoute,
    private courseService: CourseService,
    private fb: FormBuilder,
    private notificationService: NotificationService
  ) {
    super();
    
    // Khởi tạo form đánh giá với các trường cần thiết
    // Initialize review form with required fields
    this.reviewForm = this.fb.group({
      overallRating: [0, [Validators.required, Validators.min(1), Validators.max(5)]],
      content: [0, [Validators.required, Validators.min(1), Validators.max(5)]],
      structure: [0, [Validators.required, Validators.min(1), Validators.max(5)]],
      creativity: [0, [Validators.required, Validators.min(1), Validators.max(5)]],
      requirements: [0, [Validators.required, Validators.min(1), Validators.max(5)]],
      feedback: ['', [Validators.required, Validators.minLength(50), Validators.maxLength(1000)]],
      strengthPoints: ['', Validators.maxLength(500)],
      improvementPoints: ['', Validators.maxLength(500)]
    });
  }
  
  /**
   * Khởi tạo component và đăng ký theo dõi tham số route
   * Initialize component and subscribe to route parameters
   */
  ngOnInit(): void {
    // Lấy courseId từ route cha
    // Get courseId from parent route
    this.route.parent.paramMap
      .pipe(takeUntil(this._onDestroySub))
      .subscribe({
        next: params => {
          this.courseId = params.get('courseId');
          if (this.courseId) {
            this.loadAssignments();
          } else {
            this.error = 'Không tìm thấy ID khóa học';
            this.isLoading = false;
          }
        },
        error: err => {
          console.error('Lỗi khi đọc tham số route:', err);
          this.error = 'Không thể tải thông tin khóa học';
          this.isLoading = false;
        }
      });
  }
  
  /**
   * Tải danh sách bài tập đánh giá đồng đẳng
   * Load peer review assignments
   */
  loadAssignments(): void {
    this.isLoading = true;
    this.error = '';
    
    this.courseService.getPeerReviewAssignments(this.courseId)
      .pipe(
        takeUntil(this._onDestroySub),
        finalize(() => {
          this.isLoading = false;
        }),
        catchError(err => {
          console.error('Lỗi khi tải bài tập đánh giá đồng đẳng:', err);
          this.error = 'Không thể tải danh sách bài tập đánh giá đồng đẳng. Vui lòng thử lại sau.';
          return of([]);
        })
      )
      .subscribe(assignments => {
        this.assignments = assignments;
      });
  }
  
  /**
   * Chọn một bài tập để xem chi tiết và danh sách bài nộp được giao
   * Select an assignment to view details and assigned submissions
   * @param assignment Bài tập được chọn
   */
  selectAssignment(assignment: PeerReviewAssignment): void {
    this.selectedAssignment = assignment;
    this.selectedSubmission = null;
    this.isReviewFormVisible = false;
    
    // Tải danh sách bài nộp được giao nếu chưa được tải
    // Load assigned submissions if not already loaded
    if (!assignment.assignedSubmissions) {
      this.isLoadingSubmissions = true;
      
      this.courseService.getPeerReviewSubmissions(this.courseId, assignment.id)
        .pipe(
          takeUntil(this._onDestroySub),
          finalize(() => {
            this.isLoadingSubmissions = false;
          }),
          catchError(err => {
            console.error('Lỗi khi tải bài nộp được giao:', err);
            this.error = 'Không thể tải danh sách bài nộp. Vui lòng thử lại sau.';
            return of([]);
          })
        )
        .subscribe(submissions => {
          this.selectedAssignment.assignedSubmissions = submissions;
        });
    }
  }
  
  /**
   * Chọn một bài nộp để đánh giá
   * Select a submission to review
   * @param submission Bài nộp được chọn
   */
  selectSubmission(submission: PeerSubmission): void {
    this.selectedSubmission = submission;
    this.isReviewFormVisible = false;
    this.resetReviewForm();
    
    // Nếu bài đã được đánh giá, tải thông tin đánh giá cũ
    // If submission has been reviewed, load previous review
    if (submission.reviewed) {
      this.loadExistingReview(this.selectedAssignment.id, submission.id);
    }
  }
  
  /**
   * Tải thông tin đánh giá đã tồn tại
   * Load existing review information
   * @param assignmentId ID của bài tập
   * @param submissionId ID của bài nộp
   */
  loadExistingReview(assignmentId: string, submissionId: string): void {
    this.courseService.getPeerReviewDetails(this.courseId, assignmentId, submissionId)
      .pipe(
        takeUntil(this._onDestroySub),
        catchError(err => {
          console.error('Lỗi khi tải thông tin đánh giá:', err);
          this.notificationService.warning('Không thể tải thông tin đánh giá đã tồn tại.');
          return of(null);
        })
      )
      .subscribe(review => {
        if (review) {
          this.reviewForm.patchValue({
            overallRating: review.overallRating,
            content: review.detailedRatings.content,
            structure: review.detailedRatings.structure,
            creativity: review.detailedRatings.creativity,
            requirements: review.detailedRatings.requirements,
            feedback: review.feedback,
            strengthPoints: review.strengthPoints || '',
            improvementPoints: review.improvementPoints || ''
          });
        }
      });
  }
  
  /**
   * Bắt đầu đánh giá bài nộp
   * Start reviewing the submission
   */
  startReview(): void {
    if (!this.selectedSubmission) {
      this.notificationService.warning('Vui lòng chọn một bài nộp để đánh giá.');
      return;
    }
    
    this.isReviewFormVisible = true;
  }
  
  /**
   * Hủy đánh giá và ẩn form
   * Cancel review and hide form
   */
  cancelReview(): void {
    if (this.reviewForm.dirty) {
      if (confirm('Bạn có chắc chắn muốn hủy? Các thay đổi sẽ không được lưu.')) {
        this.isReviewFormVisible = false;
        this.resetReviewForm();
      }
    } else {
      this.isReviewFormVisible = false;
    }
  }
  
  /**
   * Nộp đánh giá
   * Submit review
   */
  submitReview(): void {
    // Kiểm tra form có hợp lệ không
    // Check if form is valid
    if (this.reviewForm.invalid) {
      // Đánh dấu tất cả các trường là đã chạm vào để hiển thị thông báo lỗi
      // Mark all fields as touched to show validation errors
      Object.keys(this.reviewForm.controls).forEach(key => {
        const control = this.reviewForm.get(key);
        control.markAsTouched();
      });
      this.notificationService.warning('Vui lòng điền đầy đủ thông tin đánh giá.');
      return;
    }
    
    this.isSubmitting = true;
    
    // Chuẩn bị dữ liệu đánh giá
    // Prepare review data
    const reviewData: PeerReviewDetails = {
      assignmentId: this.selectedAssignment.id,
      submissionId: this.selectedSubmission.id,
      overallRating: this.reviewForm.value.overallRating,
      detailedRatings: {
        content: this.reviewForm.value.content,
        structure: this.reviewForm.value.structure,
        creativity: this.reviewForm.value.creativity,
        requirements: this.reviewForm.value.requirements
      },
      feedback: this.reviewForm.value.feedback,
      strengthPoints: this.reviewForm.value.strengthPoints,
      improvementPoints: this.reviewForm.value.improvementPoints
    };
    
    // Gửi đánh giá đến server
    // Send review to server
    this.courseService.submitPeerReview(this.courseId, reviewData)
      .pipe(
        takeUntil(this._onDestroySub),
        finalize(() => {
          this.isSubmitting = false;
        }),
        catchError(err => {
          console.error('Lỗi khi gửi đánh giá:', err);
          this.notificationService.error('Không thể gửi đánh giá. Vui lòng thử lại sau.');
          return of(null);
        })
      )
      .subscribe(result => {
        if (result !== null) {
          // Cập nhật trạng thái bài nộp thành đã đánh giá
          // Update submission status to reviewed
          if (this.selectedSubmission) {
            this.selectedSubmission.reviewed = true;
          }
          
          // Kiểm tra và cập nhật trạng thái bài tập nếu tất cả bài nộp đã được đánh giá
          // Check and update assignment status if all submissions are reviewed
          this.updateAssignmentStatus();
          
          this.isReviewFormVisible = false;
          this.notificationService.success('Đánh giá của bạn đã được gửi thành công.');
        }
      });
  }
  
  /**
   * Cập nhật trạng thái bài tập dựa trên tình trạng đánh giá của các bài nộp
   * Update assignment status based on submission review status
   */
  updateAssignmentStatus(): void {
    if (!this.selectedAssignment || !this.selectedAssignment.assignedSubmissions) return;
    
    const allSubmissions = this.selectedAssignment.assignedSubmissions;
    const reviewedCount = allSubmissions.filter(s => s.reviewed).length;
    
    if (reviewedCount === 0) {
      this.selectedAssignment.status = 'pending';
    } else if (reviewedCount === allSubmissions.length) {
      this.selectedAssignment.status = 'completed';
    } else {
      this.selectedAssignment.status = 'in_progress';
    }
  }
  
  /**
   * Đặt lại form đánh giá về giá trị mặc định
   * Reset review form to default values
   */
  resetReviewForm(): void {
    this.reviewForm.reset({
      overallRating: 0,
      content: 0,
      structure: 0,
      creativity: 0,
      requirements: 0,
      feedback: '',
      strengthPoints: '',
      improvementPoints: ''
    });
  }
  
  /**
   * Lấy lớp CSS cho trạng thái bài tập
   * Get CSS class for assignment status
   * @param status Trạng thái của bài tập
   * @returns Tên lớp CSS tương ứng
   */
  getStatusClass(status: string): string {
    switch(status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'in_progress':
        return 'bg-blue-100 text-blue-800';
      case 'completed':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  }
  
  /**
   * Tính số ngày còn lại trước khi đến hạn đánh giá
   * Calculate remaining days before review deadline
   * @param date Ngày hạn chót
   * @returns Số ngày còn lại
   */
  getRemainingDays(date: Date): number {
    const now = new Date();
    const dueDate = new Date(date);
    const diffTime = dueDate.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays > 0 ? diffDays : 0;
  }
  
  /**
   * Tải lại danh sách bài tập đánh giá đồng đẳng
   * Reload peer review assignments
   */
  refreshAssignments(): void {
    this.selectedAssignment = null;
    this.selectedSubmission = null;
    this.isReviewFormVisible = false;
    this.loadAssignments();
  }
  
  /**
   * Xóa thông báo lỗi
   * Clear error message
   */
  clearError(): void {
    this.error = '';
  }
  
  /**
   * Kiểm tra xem người dùng có thể đánh giá bài nộp hay không
   * Check if user can review the submission
   * @returns true nếu có thể đánh giá
   */
  canReviewSubmission(): boolean {
    if (!this.selectedSubmission) return false;
    
    // Nếu đã đánh giá và không cho phép chỉnh sửa lại
    // If already reviewed and not allowed to edit
    if (this.selectedSubmission.reviewed) {
      return false;
    }
    
    // Kiểm tra xem đã quá hạn đánh giá chưa
    // Check if past review deadline
    const now = new Date();
    const reviewDue = new Date(this.selectedSubmission.reviewDue);
    return now <= reviewDue;
  }
  
  /**
   * Lấy trạng thái hiển thị cho bài tập
   * Get display status for assignment
   * @param status Trạng thái của bài tập
   * @returns Chuỗi hiển thị bằng tiếng Việt
   */
  getStatusDisplayName(status: string): string {
    switch(status) {
      case 'pending':
        return 'Chưa đánh giá';
      case 'in_progress':
        return 'Đang đánh giá';
      case 'completed':
        return 'Đã hoàn thành';
      default:
        return 'Không xác định';
    }
  }
}
