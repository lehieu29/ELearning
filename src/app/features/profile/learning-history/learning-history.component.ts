import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { BaseComponent } from '@app/shared/components/base/base-component';
import { LearningHistoryService } from '@app/shared/services/learning-history.service';
import { CourseService } from '@app/shared/services/course.service';
import { NotificationService } from '@app/shared/services/notification.service';
import { LearningActivity, ActivityType, ActivityStats, ActivityFilters } from '@app/shared/models/learning-activity.model';
import { Course } from '@app/shared/models/course.model';
import { takeUntil, finalize, catchError } from 'rxjs/operators';
import { forkJoin, of } from 'rxjs';
import * as dayjs from 'dayjs';

@Component({
  selector: 'app-learning-history',
  templateUrl: './learning-history.component.html'
})
export class LearningHistoryComponent extends BaseComponent implements OnInit {
  // Dữ liệu học tập và thống kê
  activities: LearningActivity[] = [];
  filteredActivities: LearningActivity[] = [];
  activityStats: ActivityStats | null = null;
  enrolledCourses: Course[] = [];
  
  // Trạng thái tải dữ liệu
  isLoading: boolean = true;
  isLoadingStats: boolean = true;
  error: string = '';
  
  // Form lọc dữ liệu
  filterForm: FormGroup;
  
  // Tùy chọn lọc
  activityTypes: { value: ActivityType, label: string, icon: string }[] = [
    { value: 'lesson_viewed', label: 'Xem bài học', icon: 'play-circle' },
    { value: 'lesson_completed', label: 'Hoàn thành bài học', icon: 'check-circle' },
    { value: 'quiz_attempted', label: 'Làm bài kiểm tra', icon: 'help-circle' },
    { value: 'quiz_completed', label: 'Hoàn thành bài kiểm tra', icon: 'award' },
    { value: 'assignment_submitted', label: 'Nộp bài tập', icon: 'clipboard' },
    { value: 'project_completed', label: 'Hoàn thành dự án', icon: 'briefcase' },
    { value: 'course_enrolled', label: 'Đăng ký khóa học', icon: 'book-open' },
    { value: 'course_completed', label: 'Hoàn thành khóa học', icon: 'award' },
    { value: 'discussion_participated', label: 'Tham gia thảo luận', icon: 'message-square' },
    { value: 'certificate_earned', label: 'Nhận chứng chỉ', icon: 'award' }
  ];
  
  statusOptions: { value: string, label: string }[] = [
    { value: 'all', label: 'Tất cả' },
    { value: 'completed', label: 'Đã hoàn thành' },
    { value: 'in-progress', label: 'Đang tiến hành' },
    { value: 'failed', label: 'Không thành công' }
  ];
  
  timeRangeOptions: { value: string, label: string }[] = [
    { value: '7days', label: '7 ngày qua' },
    { value: '30days', label: '30 ngày qua' },
    { value: '90days', label: '90 ngày qua' },
    { value: 'custom', label: 'Tùy chỉnh' }
  ];
  
  showCustomDateRange: boolean = false;

  /**
   * Khởi tạo component với các service cần thiết
   * Initialize component with required services
   * @param fb FormBuilder để tạo form lọc
   * @param learningHistoryService Service lấy dữ liệu lịch sử học tập
   * @param courseService Service lấy dữ liệu khóa học
   * @param notificationService Service hiển thị thông báo
   */
  constructor(
    private fb: FormBuilder,
    private learningHistoryService: LearningHistoryService,
    private courseService: CourseService,
    private notificationService: NotificationService
  ) {
    super();
    
    this.filterForm = this.fb.group({
      timeRange: ['30days'],
      startDate: [null],
      endDate: [null],
      courseId: ['all'],
      activityTypes: [[]],
      status: ['all']
    });
  }

  /**
   * Khởi tạo component và tải dữ liệu ban đầu
   * Initialize component and load initial data
   */
  ngOnInit(): void {
    this.setupFormListeners();
    this.loadEnrolledCourses();
    this.applyFilters();
  }

  /**
   * Thiết lập lắng nghe sự kiện thay đổi form
   * Set up form change listeners
   */
  setupFormListeners(): void {
    // Lắng nghe thay đổi khoảng thời gian
    this.filterForm.get('timeRange')?.valueChanges
      .pipe(takeUntil(this._onDestroySub))
      .subscribe(range => {
        this.handleTimeRangeChange(range);
      });
    
    // Áp dụng lọc khi các trường khác thay đổi
    this.filterForm.get('courseId')?.valueChanges
      .pipe(takeUntil(this._onDestroySub))
      .subscribe(() => this.applyFilters());
    
    this.filterForm.get('activityTypes')?.valueChanges
      .pipe(takeUntil(this._onDestroySub))
      .subscribe(() => this.applyFilters());
    
    this.filterForm.get('status')?.valueChanges
      .pipe(takeUntil(this._onDestroySub))
      .subscribe(() => this.applyFilters());
  }

  /**
   * Xử lý khi khoảng thời gian thay đổi
   * Handle time range changes
   * @param range Khoảng thời gian được chọn
   */
  handleTimeRangeChange(range: string): void {
    const today = dayjs();
    let startDate = null;
    let endDate = today.toDate();
    
    this.showCustomDateRange = range === 'custom';
    
    switch (range) {
      case '7days':
        startDate = today.subtract(7, 'day').toDate();
        break;
      case '30days':
        startDate = today.subtract(30, 'day').toDate();
        break;
      case '90days':
        startDate = today.subtract(90, 'day').toDate();
        break;
      case 'custom':
        // Giữ nguyên giá trị đã chọn
        return;
    }
    
    this.filterForm.patchValue({
      startDate: startDate,
      endDate: endDate
    });
    
    this.applyFilters();
  }

  /**
   * Tải danh sách khóa học đã đăng ký
   * Load enrolled courses
   */
  loadEnrolledCourses(): void {
    this.courseService.getEnrolledCourses()
      .pipe(
        takeUntil(this._onDestroySub),
        catchError(err => {
          console.error('Lỗi khi tải khóa học đã đăng ký:', err);
          this.notificationService.error('Không thể tải danh sách khóa học. Một số bộ lọc có thể không khả dụng.');
          return of([]);
        })
      )
      .subscribe(courses => {
        this.enrolledCourses = courses;
      });
  }

  /**
   * Áp dụng các bộ lọc để tải dữ liệu mới
   * Apply filters to load new data
   */
  applyFilters(): void {
    const filters = this.buildFilters();
    this.loadData(filters);
  }

  /**
   * Xây dựng đối tượng bộ lọc từ form
   * Build filter object from form
   */
  buildFilters(): ActivityFilters {
    const formValues = this.filterForm.value;
    
    const filters: ActivityFilters = {
      startDate: formValues.startDate,
      endDate: formValues.endDate,
      status: formValues.status !== 'all' ? formValues.status : undefined
    };
    
    if (formValues.courseId && formValues.courseId !== 'all') {
      filters.courseId = formValues.courseId;
    }
    
    if (formValues.activityTypes && formValues.activityTypes.length > 0) {
      filters.activityTypes = formValues.activityTypes;
    }
    
    return filters;
  }

  /**
   * Tải dữ liệu lịch sử và thống kê
   * Load history data and statistics
   * @param filters Các bộ lọc để áp dụng
   */
  loadData(filters: ActivityFilters): void {
    this.isLoading = true;
    this.isLoadingStats = true;
    this.error = '';
    
    // Tải cùng lúc cả lịch sử và thống kê
    forkJoin({
      activities: this.learningHistoryService.getLearningHistory(filters),
      stats: this.learningHistoryService.getActivityStatistics(filters)
    })
    .pipe(
      takeUntil(this._onDestroySub),
      finalize(() => {
        this.isLoading = false;
        this.isLoadingStats = false;
      }),
      catchError(err => {
        console.error('Lỗi khi tải dữ liệu:', err);
        this.error = 'Không thể tải lịch sử học tập. Vui lòng thử lại sau.';
        return of({ activities: [], stats: null });
      })
    )
    .subscribe(result => {
      this.activities = result.activities;
      this.filteredActivities = this.activities;
      this.activityStats = result.stats;
      this.sortActivitiesByDate();
    });
  }

  /**
   * Sắp xếp các hoạt động theo ngày, mới nhất lên đầu
   * Sort activities by date, newest first
   */
  sortActivitiesByDate(): void {
    this.filteredActivities.sort((a, b) => {
      return new Date(b.completedAt).getTime() - new Date(a.completedAt).getTime();
    });
  }

  /**
   * Tìm kiếm trong các hoạt động
   * Search within activities
   * @param query Từ khóa tìm kiếm
   */
  searchActivities(query: string): void {
    if (!query) {
      this.filteredActivities = this.activities;
      return;
    }
    
    query = query.toLowerCase();
    this.filteredActivities = this.activities.filter(activity => 
      activity.courseName.toLowerCase().includes(query) ||
      (activity.lessonName && activity.lessonName.toLowerCase().includes(query)) ||
      (activity.assignmentName && activity.assignmentName.toLowerCase().includes(query)) ||
      (activity.quizName && activity.quizName.toLowerCase().includes(query))
    );
  }

  /**
   * Reset tất cả bộ lọc về giá trị mặc định
   * Reset all filters to default values
   */
  resetFilters(): void {
    this.filterForm.patchValue({
      timeRange: '30days',
      courseId: 'all',
      activityTypes: [],
      status: 'all'
    });
    
    this.handleTimeRangeChange('30days');
  }

  /**
   * Lấy nhãn cho loại hoạt động
   * Get label for activity type
   * @param type Loại hoạt động
   * @returns Nhãn hiển thị
   */
  getActivityTypeLabel(type: ActivityType): string {
    const found = this.activityTypes.find(t => t.value === type);
    return found ? found.label : 'Hoạt động';
  }

  /**
   * Lấy biểu tượng cho loại hoạt động
   * Get icon for activity type
   * @param type Loại hoạt động
   * @returns Tên biểu tượng
   */
  getActivityIcon(type: ActivityType): string {
    const found = this.activityTypes.find(t => t.value === type);
    return found ? found.icon : 'activity';
  }

  /**
   * Định dạng thời gian hoạt động
   * Format activity time
   * @param date Thời gian hoạt động
   * @returns Chuỗi thời gian đã định dạng
   */
  formatActivityTime(date: Date | string): string {
    return dayjs(date).format('DD/MM/YYYY HH:mm');
  }

  /**
   * Lấy lớp CSS cho trạng thái hoạt động
   * Get CSS class for activity status
   * @param status Trạng thái hoạt động
   * @returns Tên lớp CSS
   */
  getStatusClass(status: string): string {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'in-progress':
        return 'bg-blue-100 text-blue-800';
      case 'failed':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  }

  /**
   * Định dạng thời lượng từ phút sang giờ:phút
   * Format duration from minutes to hours:minutes
   * @param minutes Thời lượng tính bằng phút
   * @returns Chuỗi thời lượng đã định dạng
   */
  formatDuration(minutes: number): string {
    if (!minutes) return '0 phút';
    
    if (minutes < 60) {
      return `${minutes} phút`;
    }
    
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    
    if (mins === 0) {
      return `${hours} giờ`;
    }
    
    return `${hours} giờ ${mins} phút`;
  }
}
