// src/app/shared/services/analytics.service.ts
import { Injectable } from '@angular/core';
import { Observable, throwError, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { HttpService } from './http.service';
import { ApiResponse } from '../models/api.model';

export interface LearningActivity {
  totalTimeSpent: number; // phút
  coursesStarted: number;
  coursesCompleted: number;
  lessonsCompleted: number;
  quizzesTaken: number;
  averageQuizScore: number;
  streak: number; // ngày
}

export interface DailyActivity {
  date: string;
  timeSpent: number; // phút
  lessonsCompleted: number;
  quizzesTaken: number;
}

export interface ApiUsageEvent {
  url: string;
  method: string;
  statusCode: number;
  duration: number;
  size?: number;
  timestamp: string;
}

export interface ApiErrorEvent {
  url: string;
  method: string;
  statusCode: number;
  message: string;
  duration: number;
  timestamp: string;
}

@Injectable({
  providedIn: 'root'
})
export class AnalyticsService {
  constructor(private http: HttpService) {}
  
  /**
   * Lấy thống kê hoạt động học tập của người dùng
   * @returns Observable chứa thông tin hoạt động học tập
   */
  getUserLearningActivity(): Observable<LearningActivity> {
    return this.http.get<ApiResponse<LearningActivity>>('analytics/learning-activity').pipe(
      map(response => {
        if (!response.data) {
          return {
            totalTimeSpent: 0,
            coursesStarted: 0,
            coursesCompleted: 0,
            lessonsCompleted: 0,
            quizzesTaken: 0,
            averageQuizScore: 0,
            streak: 0
          };
        }
        return response.data;
      }),
      catchError(error => {
        return throwError(() => new Error(error.error?.message || 'Không thể tải hoạt động học tập'));
      })
    );
  }
  
  /**
   * Lấy thống kê hoạt động học tập theo ngày
   * @param startDate Ngày bắt đầu (định dạng YYYY-MM-DD)
   * @param endDate Ngày kết thúc (định dạng YYYY-MM-DD)
   * @returns Observable chứa dữ liệu hoạt động theo ngày
   */
  getDailyActivity(startDate: string, endDate: string): Observable<DailyActivity[]> {
    return this.http.get<ApiResponse<DailyActivity[]>>(`analytics/daily-activity?startDate=${startDate}&endDate=${endDate}`).pipe(
      map(response => response.data || []),
      catchError(error => {
        return throwError(() => new Error(error.error?.message || 'Không thể tải hoạt động theo ngày'));
      })
    );
  }
  
  /**
   * Lấy danh sách khóa học hàng đầu của người dùng
   * @param limit Số lượng khóa học cần lấy
   * @returns Observable chứa danh sách khóa học hàng đầu
   */
  getTopCourses(limit: number = 5): Observable<{ courseId: string, title: string, timeSpent: number, progress: number }[]> {
    return this.http.get<ApiResponse<{ courseId: string, title: string, timeSpent: number, progress: number }[]>>(`analytics/top-courses?limit=${limit}`).pipe(
      map(response => response.data || []),
      catchError(error => {
        return throwError(() => new Error(error.error?.message || 'Không thể tải khóa học hàng đầu'));
      })
    );
  }
  
  /**
   * Ghi nhận sự kiện phân tích
   * @param eventName Tên sự kiện
   * @param eventData Dữ liệu sự kiện
   * @returns Observable kết quả thành công hay thất bại
   */
  trackEvent(eventName: string, eventData: any): Observable<boolean> {
    return this.http.post<ApiResponse<{ success: boolean }>>('analytics/events', {
      eventName,
      eventData,
      timestamp: new Date().toISOString()
    }).pipe(
      map(response => response.data?.success || false),
      catchError(error => {
        // Chỉ ghi nhận lỗi nhưng không ảnh hưởng tới trải nghiệm người dùng
        console.error('Không thể ghi nhận sự kiện', error);
        return of(false);
      })
    );
  }
  
  /**
   * Ghi nhận lượt xem trang
   * @param page Đường dẫn trang
   * @param referrer Đường dẫn trang trước đó (tùy chọn)
   */
  trackPageView(page: string, referrer: string = ''): void {
    this.trackEvent('page_view', { page, referrer }).subscribe();
  }
  
  /**
   * Ghi nhận lượt xem khóa học
   * @param courseId ID khóa học
   * @param courseTitle Tiêu đề khóa học
   */
  trackCourseView(courseId: string, courseTitle: string): void {
    this.trackEvent('course_view', { courseId, courseTitle }).subscribe();
  }
  
  /**
   * Ghi nhận bắt đầu bài học
   * @param courseId ID khóa học
   * @param lessonId ID bài học
   * @param lessonTitle Tiêu đề bài học
   */
  trackLessonStart(courseId: string, lessonId: string, lessonTitle: string): void {
    this.trackEvent('lesson_start', { courseId, lessonId, lessonTitle }).subscribe();
  }
  
  /**
   * Ghi nhận hoàn thành bài học
   * @param courseId ID khóa học
   * @param lessonId ID bài học
   * @param lessonTitle Tiêu đề bài học
   * @param timeSpent Thời gian học (phút)
   */
  trackLessonComplete(courseId: string, lessonId: string, lessonTitle: string, timeSpent: number): void {
    this.trackEvent('lesson_complete', { courseId, lessonId, lessonTitle, timeSpent }).subscribe();
  }
  
  /**
   * Ghi nhận lần làm bài kiểm tra
   * @param courseId ID khóa học
   * @param quizId ID bài kiểm tra
   * @param score Điểm số
   * @param passed Đạt hay không đạt
   */
  trackQuizAttempt(courseId: string, quizId: string, score: number, passed: boolean): void {
    this.trackEvent('quiz_attempt', { courseId, quizId, score, passed }).subscribe();
  }
  
  /**
   * Ghi nhận sử dụng API (dành cho interceptor)
   * @param event Thông tin sự kiện API
   */
  trackApiUsage(event: ApiUsageEvent): void {
    this.http.post('analytics/api-usage', event).subscribe(
      () => {},
      (error) => console.error('Không thể ghi nhận sử dụng API', error)
    );
  }
  
  /**
   * Ghi nhận lỗi API (dành cho interceptor)
   * @param event Thông tin sự kiện lỗi API
   */
  trackApiError(event: ApiErrorEvent): void {
    this.http.post('analytics/api-error', event).subscribe(
      () => {},
      (error) => console.error('Không thể ghi nhận lỗi API', error)
    );
  }
}