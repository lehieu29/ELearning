import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, FormArray } from '@angular/forms';
import { BaseComponent } from '@app/shared/components/base/base-component';
import { GoalTrackingService } from '@app/shared/services/goal-tracking.service';
import { CourseService } from '@app/shared/services/course.service';
import { NotificationService } from '@app/shared/services/notification.service';
import { 
  Goal, 
  GoalFilter, 
  GoalCategory, 
  GoalType,
  GoalStatus, 
  GoalPriority,
  GoalStatistics,
  GoalTask 
} from '@app/shared/models/goal.model';
import { Course } from '@app/shared/models/course.model';
import { takeUntil, finalize, catchError } from 'rxjs/operators';
import { forkJoin, of } from 'rxjs';
import { DateUtils } from '@shared/fn/date-utils';

@Component({
  selector: 'app-goal-tracking',
  templateUrl: './goal-tracking.component.html'
})
export class GoalTrackingComponent extends BaseComponent implements OnInit {
  // Dữ liệu mục tiêu và lọc
  goals: Goal[] = [];
  filteredGoals: Goal[] = [];
  goalStatistics: GoalStatistics | null = null;
  
  // Dữ liệu khóa học cho liên kết
  enrolledCourses: Course[] = [];
  
  // Selected goal
  selectedGoal: Goal | null = null;
  
  // Forms
  goalForm: FormGroup;
  filterForm: FormGroup;
  
  // UI States
  isLoading = {
    goals: false,
    stats: false,
    courses: false,
    createGoal: false,
    deleteGoal: false
  };
  
  showCreateModal = false;
  showDetailModal = false;
  showDeleteConfirmation = false;
  editMode = false;
  error = '';
  
  // Tab & Mode Management
  activeView: 'grid' | 'list' | 'calendar' = 'list';
  activeTab: 'active' | 'completed' | 'all' = 'active';
  
  // Form Options
  categoryOptions: { value: GoalCategory; label: string; icon: string }[] = [
    { value: 'career', label: 'Sự nghiệp', icon: 'briefcase' },
    { value: 'skills', label: 'Kỹ năng', icon: 'code' },
    { value: 'certification', label: 'Chứng chỉ', icon: 'award' },
    { value: 'course', label: 'Khóa học', icon: 'book' },
    { value: 'project', label: 'Dự án', icon: 'folder' },
    { value: 'personal', label: 'Cá nhân', icon: 'user' }
  ];
  
  typeOptions: { value: GoalType; label: string; description: string }[] = [
    { value: 'completion', label: 'Hoàn thành', description: 'Mục tiêu sẽ hoàn thành khi đạt đến một mốc cụ thể' },
    { value: 'mastery', label: 'Thành thạo', description: 'Đạt được mức thành thạo trong một kỹ năng hoặc chủ đề' },
    { value: 'habit', label: 'Thói quen', description: 'Mục tiêu lặp lại thường xuyên để phát triển thói quen học tập' },
    { value: 'milestone', label: 'Cột mốc', description: 'Mục tiêu đánh dấu một cột mốc quan trọng trong quá trình học tập' }
  ];
  
  priorityOptions: { value: GoalPriority; label: string; color: string }[] = [
    { value: 'high', label: 'Cao', color: 'red' },
    { value: 'medium', label: 'Trung bình', color: 'yellow' },
    { value: 'low', label: 'Thấp', color: 'green' }
  ];
  
  timeframeOptions: { value: string; label: string }[] = [
    { value: 'all', label: 'Tất cả' },
    { value: 'this_week', label: 'Tuần này' },
    { value: 'this_month', label: 'Tháng này' },
    { value: 'this_quarter', label: 'Quý này' },
    { value: 'this_year', label: 'Năm nay' },
    { value: 'overdue', label: 'Quá hạn' }
  ];
  
  /**
   * Khởi tạo component với các dependency cần thiết
   * Initialize component with required dependencies
   */
  constructor(
    private goalTrackingService: GoalTrackingService,
    private courseService: CourseService,
    private notificationService: NotificationService,
    private fb: FormBuilder
  ) {
    super();
    
    // Khởi tạo form lọc
    // Initialize filter form
    this.filterForm = this.fb.group({
      search: [''],
      category: [''],
      priority: [''],
      timeframe: ['all']
    });
    
    // Khởi tạo form tạo/chỉnh sửa mục tiêu
    // Initialize create/edit goal form
    this.goalForm = this.fb.group({
      title: ['', [Validators.required, Validators.maxLength(100)]],
      description: ['', Validators.maxLength(500)],
      category: ['skills', Validators.required],
      type: ['completion', Validators.required],
      priority: ['medium', Validators.required],
      targetDate: [null],
      relatedCourseIds: [[]],
      relatedSkills: [[]],
      tasks: this.fb.array([]),
      metrics: this.fb.array([])
    });
  }
  
  /**
   * Khởi tạo component và tải dữ liệu ban đầu
   * Initialize component and load initial data
   */
  ngOnInit(): void {
    this.setupFilterListeners();
    this.loadGoals();
    this.loadGoalStatistics();
    this.loadEnrolledCourses();
  }
  
  /**
   * Thiết lập listener cho form lọc
   * Setup listeners for filter form
   */
  setupFilterListeners(): void {
    this.filterForm.valueChanges
      .pipe(takeUntil(this._onDestroySub))
      .subscribe(() => {
        this.applyFilters();
      });
  }
  
  /**
   * Tải danh sách mục tiêu từ server
   * Load goals from server
   */
  loadGoals(): void {
    this.isLoading.goals = true;
    this.error = '';
    
    const filter: GoalFilter = {
      ...this.filterForm.value
    };
    
    if (this.activeTab === 'active') {
      filter.status = 'in_progress';
    } else if (this.activeTab === 'completed') {
      filter.status = 'completed';
    }
    
    this.goalTrackingService.getGoals(filter)
      .pipe(
        takeUntil(this._onDestroySub),
        finalize(() => {
          this.isLoading.goals = false;
        }),
        catchError(error => {
          this.error = 'Không thể tải danh sách mục tiêu. Vui lòng thử lại sau.';
          return of([]);
        })
      )
      .subscribe(goals => {
        this.goals = goals;
        this.filteredGoals = goals;
        this.sortGoals();
      });
  }
  
  /**
   * Tải thống kê về mục tiêu
   * Load goal statistics
   */
  loadGoalStatistics(): void {
    this.isLoading.stats = true;
    
    this.goalTrackingService.getGoalStatistics()
      .pipe(
        takeUntil(this._onDestroySub),
        finalize(() => {
          this.isLoading.stats = false;
        }),
        catchError(error => {
          console.error('Error loading goal statistics:', error);
          return of(null);
        })
      )
      .subscribe(stats => {
        this.goalStatistics = stats;
      });
  }
  
  /**
   * Tải danh sách khóa học đã đăng ký
   * Load enrolled courses
   */
  loadEnrolledCourses(): void {
    this.isLoading.courses = true;
    
    this.courseService.getEnrolledCourses()
      .pipe(
        takeUntil(this._onDestroySub),
        finalize(() => {
          this.isLoading.courses = false;
        }),
        catchError(error => {
          console.error('Error loading enrolled courses:', error);
          return of([]);
        })
      )
      .subscribe(courses => {
        this.enrolledCourses = courses;
      });
  }
  
  /**
   * Áp dụng bộ lọc vào danh sách mục tiêu
   * Apply filters to goals list
   */
  applyFilters(): void {
    const filters = this.filterForm.value;
    let filtered = this.goals;
    
    if (filters.search) {
      const searchTerm = filters.search.toLowerCase();
      filtered = filtered.filter(goal => 
        goal.title.toLowerCase().includes(searchTerm) || 
        goal.description?.toLowerCase().includes(searchTerm)
      );
    }
    
    if (filters.category) {
      filtered = filtered.filter(goal => goal.category === filters.category);
    }
    
    if (filters.priority) {
      filtered = filtered.filter(goal => goal.priority === filters.priority);
    }
    
    if (filters.timeframe && filters.timeframe !== 'all') {
      const now = dayjs();
      
      if (filters.timeframe === 'this_week') {
        const endOfWeek = now.endOf('week');
        filtered = filtered.filter(goal => {
          if (!goal.targetDate) return false;
          return dayjs(goal.targetDate).isBefore(endOfWeek);
        });
      } else if (filters.timeframe === 'this_month') {
        const endOfMonth = now.endOf('month');
        filtered = filtered.filter(goal => {
          if (!goal.targetDate) return false;
          return dayjs(goal.targetDate).isBefore(endOfMonth);
        });
      } else if (filters.timeframe === 'this_quarter') {
        const endOfQuarter = now.endOf('quarter');
        filtered = filtered.filter(goal => {
          if (!goal.targetDate) return false;
          return dayjs(goal.targetDate).isBefore(endOfQuarter);
        });
      } else if (filters.timeframe === 'this_year') {
        const endOfYear = now.endOf('year');
        filtered = filtered.filter(goal => {
          if (!goal.targetDate) return false;
          return dayjs(goal.targetDate).isBefore(endOfYear);
        });
      } else if (filters.timeframe === 'overdue') {
        filtered = filtered.filter(goal => {
          if (!goal.targetDate || goal.status === 'completed') return false;
          return dayjs(goal.targetDate).isBefore(now);
        });
      }
    }
    
    this.filteredGoals = filtered;
    this.sortGoals();
  }
  
  /**
   * Chuyển đổi tab
   * Switch tab
   * @param tab Tab mới để hiển thị
   */
  switchTab(tab: 'active' | 'completed' | 'all'): void {
    if (this.activeTab === tab) return;
    
    this.activeTab = tab;
    this.loadGoals();
  }
  
  /**
   * Chuyển đổi chế độ xem
   * Switch view mode
   * @param view Chế độ xem mới
   */
  switchView(view: 'grid' | 'list' | 'calendar'): void {
    this.activeView = view;
  }
  
  /**
   * Sắp xếp mục tiêu theo ưu tiên và ngày
   * Sort goals by priority and date
   */
  sortGoals(): void {
    this.filteredGoals.sort((a, b) => {
      // Sắp xếp theo ưu tiên (cao -> thấp)
      const priorityOrder = { high: 0, medium: 1, low: 2 };
      const priorityDiff = priorityOrder[a.priority] - priorityOrder[b.priority];
      
      if (priorityDiff !== 0) return priorityDiff;
      
      // Nếu cùng ưu tiên, sắp xếp theo ngày đích (gần -> xa)
      if (a.targetDate && b.targetDate) {
        return new Date(a.targetDate).getTime() - new Date(b.targetDate).getTime();
      }
      
      // Mục tiêu có ngày đích sẽ hiển thị trước
      if (a.targetDate) return -1;
      if (b.targetDate) return 1;
      
      // Nếu không có ngày đích, sắp xếp theo ngày tạo (mới -> cũ)
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });
  }
  
  /**
   * Mở modal tạo mục tiêu mới
   * Open create goal modal
   */
  openCreateModal(): void {
    this.editMode = false;
    this.goalForm.reset({
      category: 'skills',
      type: 'completion',
      priority: 'medium'
    });
    this.clearFormArrays();
    this.showCreateModal = true;
  }
  
  /**
   * Mở modal chỉnh sửa mục tiêu
   * Open edit goal modal
   * @param goal Mục tiêu để chỉnh sửa
   */
  openEditModal(goal: Goal): void {
    this.editMode = true;
    this.selectedGoal = goal;
    
    this.goalForm.reset({
      title: goal.title,
      description: goal.description || '',
      category: goal.category,
      type: goal.type,
      priority: goal.priority,
      targetDate: goal.targetDate ? dayjs(goal.targetDate).format('YYYY-MM-DD') : null,
      relatedCourseIds: goal.relatedCourseIds || [],
      relatedSkills: goal.relatedSkills || []
    });
    
    this.clearFormArrays();
    
    // Thêm tasks vào form array
    if (goal.tasks && goal.tasks.length > 0) {
      goal.tasks.forEach(task => {
        this.addTaskToForm(task);
      });
    }
    
    // Thêm metrics vào form array
    if (goal.metrics && goal.metrics.length > 0) {
      goal.metrics.forEach(metric => {
        this.addMetricToForm(metric);
      });
    }
    
    this.showCreateModal = true;
  }
  
  /**
   * Mở modal chi tiết mục tiêu
   * Open goal detail modal
   * @param goal Mục tiêu để xem chi tiết
   */
  openDetailModal(goal: Goal): void {
    this.selectedGoal = goal;
    this.showDetailModal = true;
  }
  
  /**
   * Đóng tất cả các modal
   * Close all modals
   */
  closeAllModals(): void {
    this.showCreateModal = false;
    this.showDetailModal = false;
    this.showDeleteConfirmation = false;
    this.selectedGoal = null;
  }
  
  /**
   * Xác nhận xóa mục tiêu
   * Confirm goal deletion
   * @param goal Mục tiêu cần xóa
  */
  confirmDeleteGoal(goal: Goal): void {
    this.selectedGoal = goal;
    this.showDeleteConfirmation = true;
  }

  /**
   * Xóa mục tiêu đã chọn
   * Delete selected goal
   */
  deleteGoal(): void {
    if (!this.selectedGoal) {
      return;
    }

    this.isLoading.deleteGoal = true;
    
    this.goalTrackingService.deleteGoal(this.selectedGoal.id)
      .pipe(
        takeUntil(this._onDestroySub),
        finalize(() => {
          this.isLoading.deleteGoal = false;
          this.closeAllModals();
        }),
        catchError(error => {
          this.notificationService.error('Không thể xóa mục tiêu. Vui lòng thử lại sau.');
          return of(null);
        })
      )
      .subscribe(() => {
        // Xóa mục tiêu khỏi danh sách local
        this.goals = this.goals.filter(g => g.id !== this.selectedGoal!.id);
        this.filteredGoals = this.filteredGoals.filter(g => g.id !== this.selectedGoal!.id);
        this.loadGoalStatistics(); // Cập nhật thống kê
        this.notificationService.success('Đã xóa mục tiêu thành công!');
      });
  }

  /**
   * Lưu mục tiêu mới hoặc cập nhật mục tiêu đã có
   * Save new goal or update existing goal
   */
  saveGoal(): void {
    if (this.goalForm.invalid) {
      // Đánh dấu tất cả các trường là đã chạm để hiển thị lỗi
      // Mark all fields as touched to show validation errors
      Object.keys(this.goalForm.controls).forEach(key => {
        const control = this.goalForm.get(key);
        control?.markAsTouched();
      });
      return;
    }

    const formValue = this.goalForm.value;
    
    const goalData: Partial<Goal> = {
      title: formValue.title,
      description: formValue.description,
      category: formValue.category,
      type: formValue.type,
      priority: formValue.priority,
      targetDate: formValue.targetDate ? new Date(formValue.targetDate) : undefined,
      relatedCourseIds: formValue.relatedCourseIds,
      relatedSkills: formValue.relatedSkills,
      tasks: this.getTasksFormArray().value,
      metrics: this.getMetricsFormArray().value
    };

    this.isLoading.createGoal = true;

    if (this.editMode && this.selectedGoal) {
      // Cập nhật mục tiêu hiện có
      // Update existing goal
      this.goalTrackingService.updateGoal(this.selectedGoal.id, goalData)
        .pipe(
          takeUntil(this._onDestroySub),
          finalize(() => {
            this.isLoading.createGoal = false;
            this.closeAllModals();
          }),
          catchError(error => {
            this.notificationService.error('Không thể cập nhật mục tiêu. Vui lòng thử lại sau.');
            return of(null);
          })
        )
        .subscribe(updatedGoal => {
          if (updatedGoal) {
            // Cập nhật mục tiêu trong danh sách local
            const index = this.goals.findIndex(g => g.id === updatedGoal.id);
            if (index !== -1) {
              this.goals[index] = updatedGoal;
            }
            this.applyFilters(); // Áp dụng lại bộ lọc
            this.notificationService.success('Đã cập nhật mục tiêu thành công!');
          }
        });
    } else {
      // Tạo mục tiêu mới
      // Create new goal
      this.goalTrackingService.createGoal(goalData as Omit<Goal, 'id'>)
        .pipe(
          takeUntil(this._onDestroySub),
          finalize(() => {
            this.isLoading.createGoal = false;
            this.closeAllModals();
          }),
          catchError(error => {
            this.notificationService.error('Không thể tạo mục tiêu mới. Vui lòng thử lại sau.');
            return of(null);
          })
        )
        .subscribe(newGoal => {
          if (newGoal) {
            this.goals.push(newGoal);
            this.applyFilters(); // Áp dụng lại bộ lọc
            this.loadGoalStatistics(); // Cập nhật thống kê
            this.notificationService.success('Đã tạo mục tiêu mới thành công!');
          }
        });
    }
  }

  /**
   * Cập nhật tiến độ của mục tiêu
   * Update goal progress
   * @param goal Mục tiêu cần cập nhật
   * @param progress Tiến độ mới (0-100)
   */
  updateProgress(goal: Goal, progress: number): void {
    this.goalTrackingService.updateGoalProgress(goal.id, progress)
      .pipe(
        takeUntil(this._onDestroySub),
        catchError(error => {
          this.notificationService.error('Không thể cập nhật tiến độ. Vui lòng thử lại sau.');
          return of(null);
        })
      )
      .subscribe(updatedGoal => {
        if (updatedGoal) {
          // Cập nhật mục tiêu trong danh sách local
          const index = this.goals.findIndex(g => g.id === updatedGoal.id);
          if (index !== -1) {
            this.goals[index] = updatedGoal;
          }
          
          // Cập nhật mục tiêu trong danh sách đã lọc
          const filteredIndex = this.filteredGoals.findIndex(g => g.id === updatedGoal.id);
          if (filteredIndex !== -1) {
            this.filteredGoals[filteredIndex] = updatedGoal;
          }
          
          // Cập nhật thống kê nếu mục tiêu vừa được hoàn thành
          if (updatedGoal.progress === 100) {
            this.loadGoalStatistics();
          }
        }
      });
  }

  /**
   * Cập nhật trạng thái hoàn thành của một công việc
   * Update completion status of a task
   * @param goal Mục tiêu chứa công việc
   * @param taskId ID của công việc
   * @param completed Trạng thái hoàn thành mới
   */
  updateTaskStatus(goal: Goal, taskId: string, completed: boolean): void {
    this.goalTrackingService.updateTaskStatus(goal.id, taskId, completed)
      .pipe(
        takeUntil(this._onDestroySub),
        catchError(error => {
          this.notificationService.error('Không thể cập nhật trạng thái công việc. Vui lòng thử lại sau.');
          return of(null);
        })
      )
      .subscribe(updatedTask => {
        if (updatedTask) {
          // Cập nhật công việc trong mục tiêu
          const goalIndex = this.goals.findIndex(g => g.id === goal.id);
          if (goalIndex !== -1 && this.goals[goalIndex].tasks) {
            const taskIndex = this.goals[goalIndex].tasks!.findIndex(t => t.id === taskId);
            if (taskIndex !== -1) {
              this.goals[goalIndex].tasks![taskIndex].completed = completed;
            }
          }
          
          // Cập nhật công việc trong mục tiêu đã lọc
          const filteredGoalIndex = this.filteredGoals.findIndex(g => g.id === goal.id);
          if (filteredGoalIndex !== -1 && this.filteredGoals[filteredGoalIndex].tasks) {
            const taskIndex = this.filteredGoals[filteredGoalIndex].tasks!.findIndex(t => t.id === taskId);
            if (taskIndex !== -1) {
              this.filteredGoals[filteredGoalIndex].tasks![taskIndex].completed = completed;
            }
          }
        }
      });
  }

  /**
   * Lấy FormArray của các công việc
   * Get tasks FormArray
   */
  getTasksFormArray(): FormArray {
    return this.goalForm.get('tasks') as FormArray;
  }

  /**
   * Lấy FormArray của các chỉ số
   * Get metrics FormArray
   */
  getMetricsFormArray(): FormArray {
    return this.goalForm.get('metrics') as FormArray;
  }

  /**
   * Thêm một công việc vào form
   * Add a task to form
   * @param task Công việc cần thêm (tùy chọn)
   */
  addTaskToForm(task?: GoalTask): void {
    const taskForm = this.fb.group({
      id: [task?.id || ''],
      title: [task?.title || '', [Validators.required, Validators.maxLength(100)]],
      completed: [task?.completed || false],
      dueDate: [task?.dueDate ? dayjs(task.dueDate).format('YYYY-MM-DD') : null]
    });
    
    this.getTasksFormArray().push(taskForm);
  }

  /**
   * Thêm một chỉ số theo dõi vào form
   * Add a tracking metric to form
   * @param metric Chỉ số cần thêm (tùy chọn)
   */
  addMetricToForm(metric?: any): void {
    const metricForm = this.fb.group({
      id: [metric?.id || ''],
      name: [metric?.name || '', [Validators.required, Validators.maxLength(50)]],
      targetValue: [metric?.targetValue || 0, [Validators.required, Validators.min(0)]],
      currentValue: [metric?.currentValue || 0, [Validators.required, Validators.min(0)]],
      unit: [metric?.unit || '', Validators.maxLength(20)]
    });
    
    this.getMetricsFormArray().push(metricForm);
  }

  /**
   * Xóa một công việc khỏi form
   * Remove a task from form
   * @param index Vị trí của công việc cần xóa
   */
  removeTaskFromForm(index: number): void {
    this.getTasksFormArray().removeAt(index);
  }

  /**
   * Xóa một chỉ số khỏi form
   * Remove a metric from form
   * @param index Vị trí của chỉ số cần xóa
   */
  removeMetricFromForm(index: number): void {
    this.getMetricsFormArray().removeAt(index);
  }

  /**
   * Xóa tất cả các công việc và chỉ số trong form
   * Clear all tasks and metrics in form arrays
   */
  clearFormArrays(): void {
    const tasksArray = this.getTasksFormArray();
    while (tasksArray.length > 0) {
      tasksArray.removeAt(0);
    }
    
    const metricsArray = this.getMetricsFormArray();
    while (metricsArray.length > 0) {
      metricsArray.removeAt(0);
    }
  }

  /**
   * Lấy tên khóa học dựa trên ID
   * Get course name by ID
   * @param courseId ID của khóa học
   */
  getCourseName(courseId: string): string {
    const course = this.enrolledCourses.find(c => c.id === courseId);
    return course ? course.title : 'N/A';
  }

  /**
   * Kiểm tra xem một mục tiêu có quá hạn không
   * Check if a goal is overdue
   * @param goal Mục tiêu cần kiểm tra
   */
  isOverdue(goal: Goal): boolean {
    if (!goal.targetDate || goal.status === 'completed') return false;
    return dayjs(goal.targetDate).isBefore(dayjs());
  }
  
  /**
   * Lấy màu hiển thị dựa trên độ ưu tiên
   * Get display color based on priority
   * @param priority Độ ưu tiên
   */
  getPriorityColor(priority: GoalPriority): string {
    const option = this.priorityOptions.find(opt => opt.value === priority);
    return option ? option.color : 'gray';
  }
  
  /**
   * Lấy biểu tượng danh mục
   * Get category icon
   * @param category Danh mục
   */
  getCategoryIcon(category: GoalCategory): string {
    const option = this.categoryOptions.find(opt => opt.value === category);
    return option ? option.icon : 'circle';
  }
  
  /**
   * Định dạng ngày tháng
   * Format date
   * @param date Ngày cần định dạng
   */
  formatDate(date: Date | string | null | undefined): string {
    if (!date) return 'Không có thời hạn';
    return DateUtils.dayjs(date).format('DD/MM/YYYY');
  }
  
  /**
   * Tính toán số ngày còn lại trước hạn
   * Calculate days remaining before deadline
   * @param targetDate Ngày đích
   */
  daysRemaining(targetDate: Date | string | null | undefined): number | null {
    if (!targetDate) return null;
    return DateUtils.diff(DateUtils.dayjs(targetDate), DateUtils.dayjs(), 'day');
  }
  
  /**
   * Lấy thông báo trạng thái dựa trên số ngày còn lại
   * Get status message based on days remaining
   * @param days Số ngày còn lại
   */
  getStatusMessage(days: number | null): string {
    if (days === null) return 'Không có thời hạn';
    if (days < 0) return `Quá hạn ${Math.abs(days)} ngày`;
    if (days === 0) return 'Hết hạn hôm nay';
    return `Còn ${days} ngày`;
  }
}