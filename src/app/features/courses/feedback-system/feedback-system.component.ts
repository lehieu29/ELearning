import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { BaseComponent } from '@app/shared/components/base/base-component';
import { CourseService } from '@app/shared/services/course.service';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Course } from '@app/shared/models/course.model';
import { Review } from '@app/shared/models/review.model';
import { takeUntil, finalize, catchError } from 'rxjs/operators';
import { NotificationService } from '@app/shared/services/notification.service';
import { of } from 'rxjs';

@Component({
  selector: 'app-feedback-system',
  templateUrl: './feedback-system.component.html'
})
export class FeedbackSystemComponent extends BaseComponent implements OnInit {
  courseId: string;
  course: Course;
  reviews: Review[] = [];
  userReview: Review | null = null;
  isLoadingCourse = true;
  isLoadingReviews = true;
  isSubmitting = false;
  error: string = '';
  hasSubmittedReview = false;
  
  reviewForm: FormGroup;
  
  // Tiêu chí đánh giá
  // Rating criteria
  ratingCriteria = [
    { id: 'content', name: 'Chất lượng nội dung', description: 'Chất lượng và độ chính xác của tài liệu khóa học' },
    { id: 'instructor', name: 'Giảng viên', description: 'Phong cách giảng dạy và sự rõ ràng trong giải thích' },
    { id: 'structure', name: 'Cấu trúc khóa học', description: 'Tổ chức và luồng của khóa học' },
    { id: 'resources', name: 'Tài nguyên', description: 'Chất lượng của tài liệu bổ sung và các nguồn tài nguyên' }
  ];
  
  /**
   * Khởi tạo component với các dịch vụ cần thiết
   * Initialize component with required services
   * @param route Service để truy cập thông tin route hiện tại
   * @param courseService Service để lấy dữ liệu khóa học và đánh giá
   * @param fb FormBuilder để tạo form đánh giá
   * @param notificationService Service để hiển thị thông báo
   */
  constructor(
    private route: ActivatedRoute,
    private courseService: CourseService,
    private fb: FormBuilder,
    private notificationService: NotificationService
  ) {
    super();
    
    // Khởi tạo form đánh giá với các trường bắt buộc
    // Initialize review form with required fields
    this.reviewForm = this.fb.group({
      overallRating: [0, [Validators.required, Validators.min(1), Validators.max(5)]],
      content: [0, [Validators.required, Validators.min(1), Validators.max(5)]],
      instructor: [0, [Validators.required, Validators.min(1), Validators.max(5)]],
      structure: [0, [Validators.required, Validators.min(1), Validators.max(5)]],
      resources: [0, [Validators.required, Validators.min(1), Validators.max(5)]],
      title: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(100)]],
      comment: ['', [Validators.required, Validators.minLength(10), Validators.maxLength(1000)]],
      recommend: [null, Validators.required]
    });
  }
  
  /**
   * Khởi tạo component và theo dõi các tham số từ route
   * Initialize component and track route parameters
   */
  ngOnInit(): void {
    this.route.parent.paramMap
      .pipe(
        takeUntil(this._onDestroySub),
        catchError(err => {
          console.error('Lỗi khi đọc tham số route:', err);
          this.error = 'Không thể tải thông tin khóa học. Vui lòng thử lại sau.';
          return of(null);
        })
      )
      .subscribe(params => {
        if (params) {
          this.courseId = params.get('courseId');
          if (this.courseId) {
            this.loadCourseDetails();
            this.loadReviews();
          } else {
            this.error = 'Không tìm thấy ID khóa học.';
            this.isLoadingCourse = false;
            this.isLoadingReviews = false;
          }
        }
      });
  }
  
  /**
   * Tải thông tin chi tiết của khóa học
   * Load course details
   */
  loadCourseDetails(): void {
    this.isLoadingCourse = true;
    this.error = '';
    
    this.courseService.getCourseById(this.courseId)
      .pipe(
        takeUntil(this._onDestroySub),
        finalize(() => {
          this.isLoadingCourse = false;
        }),
        catchError(err => {
          console.error('Lỗi khi tải thông tin khóa học:', err);
          this.error = 'Không thể tải thông tin khóa học. Vui lòng thử lại sau.';
          return of(null);
        })
      )
      .subscribe(course => {
        if (course) {
          this.course = course;
        }
      });
  }
  
  /**
   * Tải danh sách đánh giá khóa học và đánh giá của người dùng hiện tại
   * Load course reviews and current user's review
   */
  loadReviews(): void {
    this.isLoadingReviews = true;
    this.error = '';
    
    this.courseService.getCourseReviews(this.courseId)
      .pipe(
        takeUntil(this._onDestroySub),
        finalize(() => {
          this.isLoadingReviews = false;
        }),
        catchError(err => {
          console.error('Lỗi khi tải đánh giá khóa học:', err);
          this.error = 'Không thể tải đánh giá khóa học. Vui lòng thử lại sau.';
          return of({ reviews: [], userReview: null });
        })
      )
      .subscribe(response => {
        this.reviews = response.reviews || [];
        this.userReview = response.userReview || null;
        
        // Nếu người dùng đã có đánh giá, điền dữ liệu vào form
        // If user already has a review, populate the form with it
        if (this.userReview) {
          this.reviewForm.patchValue({
            overallRating: this.userReview.rating,
            content: this.userReview.detailedRatings?.content || 0,
            instructor: this.userReview.detailedRatings?.instructor || 0,
            structure: this.userReview.detailedRatings?.structure || 0,
            resources: this.userReview.detailedRatings?.resources || 0,
            title: this.userReview.title,
            comment: this.userReview.comment,
            recommend: this.userReview.recommend
          });
          this.hasSubmittedReview = true;
        }
      });
  }
  
  /**
   * Gửi đánh giá mới hoặc cập nhật đánh giá cũ
   * Submit new review or update existing review
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
    this.error = '';
    
    // Chuẩn bị dữ liệu đánh giá
    // Prepare review data
    const reviewData = {
      courseId: this.courseId,
      rating: this.reviewForm.value.overallRating,
      title: this.reviewForm.value.title,
      comment: this.reviewForm.value.comment,
      recommend: this.reviewForm.value.recommend,
      detailedRatings: {
        content: this.reviewForm.value.content,
        instructor: this.reviewForm.value.instructor,
        structure: this.reviewForm.value.structure,
        resources: this.reviewForm.value.resources
      }
    };
    
    // Quyết định API gọi dựa trên việc người dùng đã có đánh giá hay chưa
    // Decide which API to call based on whether user already has a review
    const request = this.userReview 
      ? this.courseService.updateReview(this.courseId, this.userReview.id, reviewData)
      : this.courseService.createReview(this.courseId, reviewData);
    
    request
      .pipe(
        takeUntil(this._onDestroySub),
        finalize(() => {
          this.isSubmitting = false;
        }),
        catchError(err => {
          console.error('Lỗi khi gửi đánh giá:', err);
          this.error = 'Không thể gửi đánh giá của bạn. Vui lòng thử lại sau.';
          this.notificationService.error('Không thể gửi đánh giá. Đã xảy ra lỗi.');
          return of(null);
        })
      )
      .subscribe(review => {
        if (review) {
          this.userReview = review;
          this.hasSubmittedReview = true;
          
          // Nếu là đánh giá mới, thêm vào danh sách đánh giá
          // If it's a new review, add it to the reviews list
          if (!this.reviews.some(r => r.id === review.id)) {
            this.reviews.unshift(review);
          } else {
            // Nếu cập nhật, thay thế đánh giá cũ
            // If updating, replace the existing review
            const index = this.reviews.findIndex(r => r.id === review.id);
            if (index !== -1) {
              this.reviews[index] = review;
            }
          }
          
          this.notificationService.success('Đánh giá của bạn đã được gửi thành công.');
        }
      });
  }
  
  /**
   * Chuyển sang chế độ chỉnh sửa đánh giá
   * Switch to review editing mode
   */
  editReview(): void {
    this.hasSubmittedReview = false;
  }
  
  /**
   * Tính điểm trung bình cho một tiêu chí cụ thể
   * Calculate average rating for a specific criterion
   * @param criteriaId ID của tiêu chí đánh giá
   * @returns Điểm trung bình của tiêu chí
   */
  getAverageRating(criteriaId: string): number {
    if (!this.reviews || this.reviews.length === 0) return 0;
    
    const validReviews = this.reviews.filter(review => 
      review.detailedRatings && typeof review.detailedRatings[criteriaId] === 'number'
    );
    
    if (validReviews.length === 0) return 0;
    
    const totalRatings = validReviews.reduce((sum, review) => {
      return sum + (review.detailedRatings?.[criteriaId] || 0);
    }, 0);
    
    return totalRatings / validReviews.length;
  }
  
  /**
   * Tính điểm đánh giá trung bình tổng thể
   * Calculate overall average rating
   * @returns Điểm đánh giá trung bình tổng thể
   */
  getOverallAverageRating(): number {
    if (!this.reviews || this.reviews.length === 0) return 0;
    
    const validReviews = this.reviews.filter(review => 
      typeof review.rating === 'number' && review.rating > 0
    );
    
    if (validReviews.length === 0) return 0;
    
    const totalRating = validReviews.reduce((sum, review) => sum + review.rating, 0);
    return totalRating / validReviews.length;
  }
  
  /**
   * Tính phần trăm học viên giới thiệu khóa học
   * Calculate percentage of students who recommend the course
   * @returns Phần trăm học viên giới thiệu
   */
  getRecommendationPercentage(): number {
    if (!this.reviews || this.reviews.length === 0) return 0;
    
    const recommendCount = this.reviews.filter(review => review.recommend === true).length;
    return (recommendCount / this.reviews.length) * 100;
  }
  
  /**
   * Lấy phân bố đánh giá theo số sao
   * Get rating distribution by star count
   * @returns Mảng số lượng đánh giá cho mỗi mức sao (5 sao đến 1 sao)
   */
  getRatingDistribution(): number[] {
    const distribution = [0, 0, 0, 0, 0]; // 5 sao đến 1 sao
    
    if (!this.reviews || this.reviews.length === 0) return distribution;
    
    this.reviews.forEach(review => {
      const rating = Math.round(review.rating);
      if (rating >= 1 && rating <= 5) {
        distribution[5 - rating]++;
      }
    });
    
    return distribution;
  }
  
  /**
   * Tính phần trăm của số lượng so với tổng số đánh giá
   * Calculate percentage of count relative to total reviews
   * @param count Số lượng cần tính phần trăm
   * @returns Phần trăm của số lượng so với tổng số
   */
  getPercentOfTotal(count: number): number {
    if (!this.reviews || this.reviews.length === 0) return 0;
    return (count / this.reviews.length) * 100;
  }
  
  /**
   * Xóa thông báo lỗi
   * Clear error message
   */
  clearError(): void {
    this.error = '';
  }
  
  /**
   * Làm mới dữ liệu đánh giá
   * Refresh review data
   */
  refreshReviews(): void {
    this.loadCourseDetails();
    this.loadReviews();
  }
}
