import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, AbstractControl } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { BaseComponent } from '@app/shared/components/base/base-component';
import { CourseService } from '@app/shared/services/course.service';
import { NotificationService } from '@app/shared/services/notification.service';
import { takeUntil, finalize, catchError } from 'rxjs/operators';
import { of } from 'rxjs';

interface GradingItem {
  id: string;
  studentName: string;
  studentId: string;
  submissionType: 'assignment' | 'quiz' | 'project' | 'discussion';
  title: string;
  submissionDate: Date;
  dueDate: Date;
  status: 'pending' | 'graded' | 'late' | 'resubmitted';
  attachments?: any[];
  grade?: number;
  maxGrade: number;
  feedback?: string;
  rubricScores?: {[criteriaId: string]: number};
}

interface RubricCriteria {
  id: string;
  title: string;
  description: string;
  maxPoints: number;
  scoringLevels: {
    level: number;
    description: string;
    points: number;
  }[];
}

@Component({
  selector: 'app-grading-system',
  templateUrl: './grading-system.component.html'
})
export class GradingSystemComponent extends BaseComponent implements OnInit {
  courseId: string;
  
  // Trạng thái loading và lỗi
  // Loading and error states
  isLoading = true;
  isSubmitting = false;
  error: string = '';
  successMessage: string = '';
  
  // Danh sách các mục cần chấm điểm và mục đang chọn
  // List of items to grade and selected item
  gradingItems: GradingItem[] = [];
  filteredItems: GradingItem[] = [];
  selectedItem: GradingItem | null = null;
  
  // Thông tin rubric cho mục đang chọn
  // Rubric information for selected item
  rubricCriteria: RubricCriteria[] = [];
  
  // Form chấm điểm
  // Grading form
  gradingForm: FormGroup;
  
  // Các bộ lọc
  // Filters
  selectedStatus: 'all' | 'pending' | 'graded' | 'late' | 'resubmitted' = 'all';
  selectedType: 'all' | 'assignment' | 'quiz' | 'project' | 'discussion' = 'all';
  searchTerm: string = '';
  
  /**
   * Khởi tạo component với các service cần thiết
   * Initialize component with required services
   * @param route Service để truy cập thông tin route
   * @param router Service để điều hướng
   * @param fb FormBuilder để tạo forms
   * @param courseService Service để truy cập dữ liệu khóa học
   * @param notificationService Service để hiển thị thông báo
   */
  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private fb: FormBuilder,
    private courseService: CourseService,
    private notificationService: NotificationService
  ) {
    super();
    
    // Khởi tạo form chấm điểm
    // Initialize grading form
    this.gradingForm = this.fb.group({
      grade: [null, [Validators.required, Validators.min(0)]],
      feedback: ['', [Validators.required, Validators.minLength(10)]],
      rubricScores: this.fb.group({})
    });
  }
  
  /**
   * Khởi tạo component, lấy các tham số từ route và tải dữ liệu
   * Initialize component, get parameters from route and load data
   */
  ngOnInit(): void {
    // Lấy ID khóa học từ route cha
    // Get course ID from parent route
    this.route.parent.paramMap
      .pipe(takeUntil(this._onDestroySub))
      .subscribe({
        next: params => {
          this.courseId = params.get('courseId');
          if (this.courseId) {
            this.loadGradingItems();
          } else {
            this.error = 'Không tìm thấy ID khóa học';
            this.isLoading = false;
          }
        },
        error: err => {
          console.error('Lỗi khi đọc tham số route:', err);
          this.error = 'Đã xảy ra lỗi khi tải thông tin khóa học';
          this.isLoading = false;
        }
      });
  }
  
  /**
   * Tải danh sách các mục cần chấm điểm
   * Load list of items to grade
   */
  loadGradingItems(): void {
    this.isLoading = true;
    this.error = '';
    
    this.courseService.getGradingItems(this.courseId)
      .pipe(
        takeUntil(this._onDestroySub),
        finalize(() => {
          this.isLoading = false;
        }),
        catchError(err => {
          console.error('Lỗi khi tải danh sách bài cần chấm điểm:', err);
          this.error = 'Không thể tải danh sách bài cần chấm điểm. Vui lòng thử lại sau.';
          return of([]);
        })
      )
      .subscribe(items => {
        this.gradingItems = items;
        this.applyFilters();
      });
  }
  
  /**
   * Chọn một mục để chấm điểm
   * Select an item to grade
   * @param item Mục cần chấm điểm
   */
  selectItem(item: GradingItem): void {
    this.selectedItem = item;
    this.error = '';
    this.successMessage = '';
    
    // Cập nhật form với dữ liệu từ mục đã chọn
    // Update form with data from selected item
    this.gradingForm.patchValue({
      grade: item.grade || null,
      feedback: item.feedback || '',
      rubricScores: item.rubricScores || {}
    });
    
    // Tải rubric nếu có
    // Load rubric if available
    this.loadRubric(item);
  }
  
  /**
   * Tải thông tin rubric cho mục đã chọn
   * Load rubric information for selected item
   * @param item Mục đã chọn
   */
  loadRubric(item: GradingItem): void {
    if (!item) return;
    
    this.courseService.getSubmissionRubric(this.courseId, item.submissionType, item.id)
      .pipe(
        takeUntil(this._onDestroySub),
        catchError(err => {
          console.error('Lỗi khi tải rubric:', err);
          this.rubricCriteria = [];
          // Đặt lại form group của rubric scores
          // Reset rubric scores form group
          this.gradingForm.setControl('rubricScores', this.fb.group({}));
          return of([]);
        })
      )
      .subscribe(criteria => {
        this.rubricCriteria = criteria;
        
        // Xây dựng form controls động cho rubric
        // Build dynamic form controls for rubric
        const rubricFormGroup = this.fb.group({});
        
        criteria.forEach(criterion => {
          const existingScore = this.selectedItem?.rubricScores?.[criterion.id];
          rubricFormGroup.addControl(criterion.id, this.fb.control(existingScore || 0));
        });
        
        this.gradingForm.setControl('rubricScores', rubricFormGroup);
      });
  }
  
  /**
   * Gửi điểm số và phản hồi cho bài nộp
   * Submit grade and feedback for submission
   */
  submitGrade(): void {
    if (this.gradingForm.invalid) {
      // Đánh dấu tất cả các trường là đã chạm vào để hiển thị thông báo lỗi
      // Mark all fields as touched to show validation errors
      Object.keys(this.gradingForm.controls).forEach(key => {
        const control = this.gradingForm.get(key);
        if (control instanceof AbstractControl) {
          control.markAsTouched();
        }
      });
      
      // Nếu có form group rubricScores, đánh dấu tất cả các controls con
      // If there's a rubricScores form group, mark all child controls
      const rubricScores = this.gradingForm.get('rubricScores');
      if (rubricScores) {
        Object.keys(rubricScores.value).forEach(key => {
          rubricScores.get(key).markAsTouched();
        });
      }
      
      this.notificationService.warning('Vui lòng điền đầy đủ thông tin trước khi gửi.');
      return;
    }
    
    if (!this.selectedItem) {
      this.error = 'Không có bài nộp nào được chọn để chấm điểm';
      return;
    }
    
    const formValues = this.gradingForm.value;
    
    const gradeData = {
      courseId: this.courseId,
      submissionId: this.selectedItem.id,
      submissionType: this.selectedItem.submissionType,
      grade: formValues.grade,
      feedback: formValues.feedback,
      rubricScores: formValues.rubricScores
    };
    
    this.isSubmitting = true;
    this.error = '';
    this.successMessage = '';
    
    this.courseService.submitGrade(gradeData)
      .pipe(
        takeUntil(this._onDestroySub),
        finalize(() => {
          this.isSubmitting = false;
        }),
        catchError(err => {
          console.error('Lỗi khi gửi điểm:', err);
          this.error = 'Không thể gửi điểm. Vui lòng thử lại sau.';
          return of(null);
        })
      )
      .subscribe(result => {
        if (result !== null) {
          // Cập nhật thông tin mục đã chọn
          // Update selected item information
          this.selectedItem.status = 'graded';
          this.selectedItem.grade = formValues.grade;
          this.selectedItem.feedback = formValues.feedback;
          this.selectedItem.rubricScores = formValues.rubricScores;
          
          // Áp dụng bộ lọc để cập nhật danh sách
          // Apply filters to update list
          this.applyFilters();
          
          this.successMessage = 'Đã chấm điểm thành công!';
          this.notificationService.success('Đã chấm điểm thành công!');
        }
      });
  }
  
  /**
   * Áp dụng tất cả các bộ lọc vào danh sách
   * Apply all filters to the list
   */
  applyFilters(): void {
    // Bắt đầu với tất cả các mục
    // Start with all items
    let filtered = [...this.gradingItems];
    
    // Áp dụng bộ lọc trạng thái
    // Apply status filter
    if (this.selectedStatus !== 'all') {
      filtered = filtered.filter(item => item.status === this.selectedStatus);
    }
    
    // Áp dụng bộ lọc loại
    // Apply type filter
    if (this.selectedType !== 'all') {
      filtered = filtered.filter(item => item.submissionType === this.selectedType);
    }
    
    // Áp dụng bộ lọc tìm kiếm
    // Apply search filter
    if (this.searchTerm.trim()) {
      const searchLower = this.searchTerm.toLowerCase();
      filtered = filtered.filter(item => 
        item.studentName.toLowerCase().includes(searchLower) || 
        item.title.toLowerCase().includes(searchLower)
      );
    }
    
    this.filteredItems = filtered;
  }
  
  /**
   * Lọc theo trạng thái
   * Filter by status
   * @param status Trạng thái để lọc
   */
  filterByStatus(status: 'all' | 'pending' | 'graded' | 'late' | 'resubmitted'): void {
    this.selectedStatus = status;
    this.applyFilters();
  }
  
  /**
   * Lọc theo loại bài nộp
   * Filter by submission type
   * @param type Loại bài nộp để lọc
   */
  filterByType(type: 'all' | 'assignment' | 'quiz' | 'project' | 'discussion'): void {
    this.selectedType = type;
    this.applyFilters();
  }
  
  /**
   * Xử lý khi từ khóa tìm kiếm thay đổi
   * Handle search term change
   * @param term Từ khóa tìm kiếm
   */
  onSearch(term: string): void {
    this.searchTerm = term;
    this.applyFilters();
  }
  
  /**
   * Lấy lớp CSS tương ứng với trạng thái
   * Get CSS class corresponding to status
   * @param status Trạng thái của bài nộp
   * @returns Tên lớp CSS
   */
  getStatusClass(status: string): string {
    switch(status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'graded': return 'bg-green-100 text-green-800';
      case 'late': return 'bg-red-100 text-red-800';
      case 'resubmitted': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  }
  
  /**
   * Tính tổng điểm từ các tiêu chí rubric
   * Calculate total score from rubric criteria
   * @returns Tổng điểm
   */
  calculateTotalRubricScore(): number {
    if (!this.rubricCriteria.length) return 0;
    
    const rubricScores = this.gradingForm.get('rubricScores')?.value;
    if (!rubricScores) return 0;
    
    return Object.values<number>(rubricScores).reduce((sum, score) => sum + score, 0);
  }
  
  /**
   * Tính điểm tối đa từ các tiêu chí rubric
   * Calculate maximum score from rubric criteria
   * @returns Điểm tối đa
   */
  calculateMaxRubricScore(): number {
    return this.rubricCriteria.reduce((sum, criteria) => sum + criteria.maxPoints, 0);
  }
  
  /**
   * Làm mới dữ liệu
   * Refresh data
   */
  refreshData(): void {
    this.loadGradingItems();
  }
  
  /**
   * Xóa thông báo thành công
   * Clear success message
   */
  clearSuccessMessage(): void {
    this.successMessage = '';
  }
  
  /**
   * Xóa thông báo lỗi
   * Clear error message
   */
  clearError(): void {
    this.error = '';
  }
}
