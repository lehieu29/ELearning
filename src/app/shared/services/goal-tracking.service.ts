import { Injectable } from '@angular/core';
import { Observable, throwError, of } from 'rxjs';
import { catchError, map, tap } from 'rxjs/operators';
import { HttpService } from './http.service';
import { Goal, GoalFilter, GoalStatistics, GoalTask, GoalMetric } from '../models/goal.model';
import { environment } from '@environments/environment';
import { NotificationService } from './notification.service';

@Injectable({
  providedIn: 'root'
})
export class GoalTrackingService extends HttpService {
  private apiUrl = `${environment.apiUrl}/goals`;

  constructor(private notificationService: NotificationService) {
    super();
  }

  /**
   * Lấy tất cả mục tiêu học tập của người dùng
   * Get all learning goals for the user
   * @param filters Các bộ lọc để áp dụng
   */
  getGoals(filters?: GoalFilter): Observable<Goal[]> {
    const params = this.createFilterParams(filters);
    
    return this.get<Goal[]>(this.apiUrl, { params }).pipe(
      map(goals => goals.map(goal => ({
        ...goal,
        createdAt: new Date(goal.createdAt),
        targetDate: goal.targetDate ? new Date(goal.targetDate) : undefined,
        completedAt: goal.completedAt ? new Date(goal.completedAt) : undefined,
        tasks: goal.tasks?.map(task => ({
          ...task,
          dueDate: task.dueDate ? new Date(task.dueDate) : undefined
        }))
      }))),
      catchError(error => {
        this.notificationService.error('Không thể tải mục tiêu học tập. Vui lòng thử lại sau.');
        return throwError(() => new Error('Failed to load goals'));
      })
    );
  }

  /**
   * Lấy chi tiết của một mục tiêu học tập
   * Get details of a specific learning goal
   * @param goalId ID của mục tiêu cần lấy
   */
  getGoalById(goalId: string): Observable<Goal> {
    return this.get<Goal>(`${this.apiUrl}/${goalId}`).pipe(
      map(goal => ({
        ...goal,
        createdAt: new Date(goal.createdAt),
        targetDate: goal.targetDate ? new Date(goal.targetDate) : undefined,
        completedAt: goal.completedAt ? new Date(goal.completedAt) : undefined,
        tasks: goal.tasks?.map(task => ({
          ...task,
          dueDate: task.dueDate ? new Date(task.dueDate) : undefined
        }))
      })),
      catchError(error => {
        this.notificationService.error('Không thể tải chi tiết mục tiêu. Vui lòng thử lại sau.');
        return throwError(() => new Error('Failed to load goal details'));
      })
    );
  }

  /**
   * Tạo một mục tiêu học tập mới
   * Create a new learning goal
   * @param goal Mục tiêu để tạo
   */
  createGoal(goal: Omit<Goal, 'id'>): Observable<Goal> {
    return this.post<Goal>(this.apiUrl, goal).pipe(
      tap(() => this.notificationService.success('Đã tạo mục tiêu mới thành công!')),
      catchError(error => {
        this.notificationService.error('Không thể tạo mục tiêu mới. Vui lòng thử lại sau.');
        return throwError(() => new Error('Failed to create goal'));
      })
    );
  }

  /**
   * Cập nhật một mục tiêu học tập
   * Update a learning goal
   * @param goalId ID của mục tiêu cần cập nhật
   * @param updates Các thay đổi cần áp dụng
   */
  updateGoal(goalId: string, updates: Partial<Goal>): Observable<Goal> {
    return this.put<Goal>(`${this.apiUrl}/${goalId}`, updates).pipe(
      tap(() => this.notificationService.success('Đã cập nhật mục tiêu thành công!')),
      catchError(error => {
        this.notificationService.error('Không thể cập nhật mục tiêu. Vui lòng thử lại sau.');
        return throwError(() => new Error('Failed to update goal'));
      })
    );
  }

  /**
   * Cập nhật tiến độ của một mục tiêu
   * Update progress of a goal
   * @param goalId ID của mục tiêu cần cập nhật
   * @param progress Tiến độ mới (0-100)
   */
  updateGoalProgress(goalId: string, progress: number): Observable<Goal> {
    return this.patch<Goal>(`${this.apiUrl}/${goalId}/progress`, { progress }).pipe(
      tap(() => {
        if (progress === 100) {
          this.notificationService.success('Chúc mừng! Bạn đã hoàn thành mục tiêu này!');
        } else {
          this.notificationService.success('Đã cập nhật tiến độ thành công!');
        }
      }),
      catchError(error => {
        this.notificationService.error('Không thể cập nhật tiến độ. Vui lòng thử lại sau.');
        return throwError(() => new Error('Failed to update goal progress'));
      })
    );
  }

  /**
   * Xóa một mục tiêu học tập
   * Delete a learning goal
   * @param goalId ID của mục tiêu cần xóa
   */
  deleteGoal(goalId: string): Observable<void> {
    return this.delete<void>(`${this.apiUrl}/${goalId}`).pipe(
      tap(() => this.notificationService.success('Đã xóa mục tiêu thành công!')),
      catchError(error => {
        this.notificationService.error('Không thể xóa mục tiêu. Vui lòng thử lại sau.');
        return throwError(() => new Error('Failed to delete goal'));
      })
    );
  }

  /**
   * Lấy thống kê về các mục tiêu học tập
   * Get statistics about learning goals
   */
  getGoalStatistics(): Observable<GoalStatistics> {
    return this.get<GoalStatistics>(`${this.apiUrl}/statistics`).pipe(
      catchError(error => {
        console.error('Error fetching goal statistics:', error);
        return throwError(() => new Error('Failed to load goal statistics'));
      })
    );
  }

  /**
   * Thêm một công việc vào mục tiêu
   * Add a task to a goal
   * @param goalId ID của mục tiêu
   * @param task Công việc cần thêm
   */
  addTaskToGoal(goalId: string, task: Omit<GoalTask, 'id'>): Observable<GoalTask> {
    return this.post<GoalTask>(`${this.apiUrl}/${goalId}/tasks`, task).pipe(
      tap(() => this.notificationService.success('Đã thêm công việc mới vào mục tiêu!')),
      catchError(error => {
        this.notificationService.error('Không thể thêm công việc. Vui lòng thử lại sau.');
        return throwError(() => new Error('Failed to add task to goal'));
      })
    );
  }

  /**
   * Cập nhật trạng thái hoàn thành của một công việc
   * Update completion status of a task
   * @param goalId ID của mục tiêu
   * @param taskId ID của công việc
   * @param completed Trạng thái hoàn thành mới
   */
  updateTaskStatus(goalId: string, taskId: string, completed: boolean): Observable<GoalTask> {
    return this.patch<GoalTask>(`${this.apiUrl}/${goalId}/tasks/${taskId}`, { completed }).pipe(
      tap(() => {
        if (completed) {
          this.notificationService.success('Công việc đã được đánh dấu là hoàn thành!');
        } else {
          this.notificationService.success('Công việc đã được đánh dấu là chưa hoàn thành!');
        }
      }),
      catchError(error => {
        this.notificationService.error('Không thể cập nhật trạng thái công việc. Vui lòng thử lại sau.');
        return throwError(() => new Error('Failed to update task status'));
      })
    );
  }

  /**
   * Thêm chỉ số theo dõi cho mục tiêu
   * Add tracking metric to goal
   * @param goalId ID của mục tiêu
   * @param metric Chỉ số cần thêm
   */
  addMetricToGoal(goalId: string, metric: Omit<GoalMetric, 'id'>): Observable<GoalMetric> {
    return this.post<GoalMetric>(`${this.apiUrl}/${goalId}/metrics`, metric).pipe(
      tap(() => this.notificationService.success('Đã thêm chỉ số theo dõi mới!')),
      catchError(error => {
        this.notificationService.error('Không thể thêm chỉ số theo dõi. Vui lòng thử lại sau.');
        return throwError(() => new Error('Failed to add metric to goal'));
      })
    );
  }

  /**
   * Cập nhật giá trị hiện tại của một chỉ số
   * Update current value of a metric
   * @param goalId ID của mục tiêu
   * @param metricId ID của chỉ số
   * @param currentValue Giá trị hiện tại mới
   */
  updateMetricValue(goalId: string, metricId: string, currentValue: number): Observable<GoalMetric> {
    return this.patch<GoalMetric>(`${this.apiUrl}/${goalId}/metrics/${metricId}`, { currentValue }).pipe(
      tap(() => this.notificationService.success('Đã cập nhật giá trị chỉ số thành công!')),
      catchError(error => {
        this.notificationService.error('Không thể cập nhật giá trị chỉ số. Vui lòng thử lại sau.');
        return throwError(() => new Error('Failed to update metric value'));
      })
    );
  }

  /**
   * Tạo các tham số từ bộ lọc cho các request API
   * Create params from filters for API requests
   * @param filters Bộ lọc để chuyển đổi thành tham số
   */
  private createFilterParams(filters?: GoalFilter): any {
    if (!filters) return {};

    const params: any = {};
    
    if (filters.category) {
      params.category = filters.category;
    }
    
    if (filters.status) {
      params.status = filters.status;
    }
    
    if (filters.priority) {
      params.priority = filters.priority;
    }
    
    if (filters.timeframe) {
      params.timeframe = filters.timeframe;
    }
    
    if (filters.search) {
      params.search = filters.search;
    }
    
    return params;
  }
}
