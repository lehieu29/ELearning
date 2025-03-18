import { Injectable } from '@angular/core';
import { Observable, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { HttpService } from './http.service';
import { LearningActivity, ActivityFilters, ActivityStats } from '../models/learning-activity.model';
import { environment } from '@environments/environment';

@Injectable({
  providedIn: 'root'
})
export class LearningHistoryService extends HttpService {
  /**
   * Lấy lịch sử học tập của người dùng
   * Fetches the user's learning history
   * @param filters Các bộ lọc để thu hẹp kết quả
   * @returns Observable chứa mảng các hoạt động học tập
   */
  getLearningHistory(filters?: ActivityFilters): Observable<LearningActivity[]> {
    const apiUrl = `${environment.apiUrl}/users/learning-history`;
    
    return this.get<LearningActivity[]>(apiUrl, { params: this.buildFilterParams(filters) })
      .pipe(
        map(activities => activities.map(activity => ({
          ...activity,
          completedAt: new Date(activity.completedAt)
        }))),
        catchError(error => {
          console.error('Lỗi khi lấy lịch sử học tập:', error);
          return throwError(() => new Error('Không thể tải lịch sử học tập. Vui lòng thử lại sau.'));
        })
      );
  }

  /**
   * Lấy thống kê về hoạt động học tập
   * Fetches statistics about learning activities
   * @param filters Các bộ lọc để thu hẹp phạm vi thống kê
   * @returns Observable chứa thống kê hoạt động học tập
   */
  getActivityStatistics(filters?: ActivityFilters): Observable<ActivityStats> {
    const apiUrl = `${environment.apiUrl}/users/learning-statistics`;
    
    return this.get<ActivityStats>(apiUrl, { params: this.buildFilterParams(filters) })
      .pipe(
        catchError(error => {
          console.error('Lỗi khi lấy thống kê học tập:', error);
          return throwError(() => new Error('Không thể tải thống kê học tập. Vui lòng thử lại sau.'));
        })
      );
  }

  /**
   * Tạo tham số truy vấn từ các bộ lọc
   * Builds query parameters from filters
   * @param filters Các bộ lọc để chuyển đổi
   * @returns Đối tượng chứa tham số truy vấn
   */
  private buildFilterParams(filters?: ActivityFilters): any {
    if (!filters) return {};

    const params: any = {};
    
    if (filters.startDate) {
      params['startDate'] = filters.startDate.toISOString();
    }
    
    if (filters.endDate) {
      params['endDate'] = filters.endDate.toISOString();
    }
    
    if (filters.courseId) {
      params['courseId'] = filters.courseId;
    }
    
    if (filters.activityTypes && filters.activityTypes.length > 0) {
      params['activityTypes'] = filters.activityTypes.join(',');
    }
    
    if (filters.status && filters.status !== 'all') {
      params['status'] = filters.status;
    }
    
    return params;
  }
}
