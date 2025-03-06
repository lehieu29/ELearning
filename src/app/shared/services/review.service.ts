// src/app/shared/services/review.service.ts
import { Injectable } from '@angular/core';
import { Observable, throwError, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { HttpService } from './http.service';
import { Review, ReviewResponse, RatingBreakdown } from '../models/review.model';
import { ApiResponse, PaginationInfo } from '../models/api.model';

@Injectable({
  providedIn: 'root'
})
export class ReviewService {
  constructor(private http: HttpService) { }

  /**
   * Lấy danh sách đánh giá của khóa học
   * @param courseId ID khóa học
   * @param page Trang hiện tại
   * @param limit Số lượng mục mỗi trang
   * @returns Observable chứa danh sách đánh giá và thông tin phân trang
   */
  getCourseReviews(courseId: string, page: number = 1, limit: number = 10): Observable<{ reviews: Review[], pagination: PaginationInfo }> {
    return this.http.get<ApiResponse<Review[]>>(`courses/${courseId}/reviews?page=${page}&limit=${limit}`).pipe(
      map(response => {
        return {
          reviews: response.data || [],
          pagination: response.pagination || {
            currentPage: 1,
            totalPages: 1,
            pageSize: 10,
            totalItems: response.data?.length || 0,
            hasNextPage: false,
            hasPreviousPage: false
          }
        };
      }),
      catchError(error => {
        return throwError(() => new Error(error.error?.message || 'Không thể tải đánh giá của khóa học'));
      })
    );
  }

  /**
   * Lấy thống kê đánh giá của khóa học
   * @param courseId ID khóa học
   * @returns Observable chứa thông tin thống kê đánh giá
   */
  getRatingBreakdown(courseId: string): Observable<RatingBreakdown> {
    return this.http.get<ApiResponse<RatingBreakdown>>(`courses/${courseId}/reviews/breakdown`).pipe(
      map(response => {
        if (!response.data) {
          return {
            average: 0,
            count: 0,
            distribution: {
              '5': 0,
              '4': 0,
              '3': 0,
              '2': 0,
              '1': 0
            }
          };
        }
        return response.data;
      }),
      catchError(error => {
        return throwError(() => new Error(error.error?.message || 'Không thể tải thống kê đánh giá'));
      })
    );
  }

  /**
   * Lấy đánh giá của người dùng hiện tại cho khóa học
   * @param courseId ID khóa học
   * @returns Observable chứa thông tin đánh giá hoặc null nếu chưa đánh giá
   */
  getUserReviewForCourse(courseId: string): Observable<Review | null> {
    return this.http.get<ApiResponse<Review>>(`courses/${courseId}/reviews/user`).pipe(
      map(response => response.data || null),
      catchError(error => {
        // Nếu 404, người dùng chưa đánh giá, trả về null
        if (error.status === 404) {
          return of(null);
        }
        return throwError(() => new Error(error.error?.message || 'Không thể tải đánh giá của người dùng'));
      })
    );
  }

  /**
   * Tạo đánh giá mới
   * @param courseId ID khóa học
   * @param rating Số sao (1-5)
   * @param content Nội dung đánh giá
   * @param title Tiêu đề đánh giá (tùy chọn)
   * @returns Observable chứa thông tin đánh giá mới
   */
  createReview(courseId: string, rating: number, content: string, title?: string): Observable<Review> {
    const payload = {
      rating,
      content,
      title
    };

    return this.http.post<ApiResponse<Review>>(`courses/${courseId}/reviews`, payload).pipe(
      map(response => {
        if (!response.data) {
          throw new Error('Không thể tạo đánh giá');
        }
        return response.data;
      }),
      catchError(error => {
        return throwError(() => new Error(error.error?.message || 'Không thể gửi đánh giá'));
      })
    );
  }

  /**
   * Cập nhật đánh giá
   * @param courseId ID khóa học
   * @param reviewId ID đánh giá
   * @param rating Số sao mới (1-5)
   * @param content Nội dung mới
   * @param title Tiêu đề mới (tùy chọn)
   * @returns Observable chứa thông tin đánh giá sau khi cập nhật
   */
  updateReview(courseId: string, reviewId: string, rating: number, content: string, title?: string): Observable<Review> {
    const payload = {
      rating,
      content,
      title
    };

    return this.http.put<ApiResponse<Review>>(`courses/${courseId}/reviews/${reviewId}`, payload).pipe(
      map(response => {
        if (!response.data) {
          throw new Error('Không thể cập nhật đánh giá');
        }
        return response.data;
      }),
      catchError(error => {
        return throwError(() => new Error(error.error?.message || 'Không thể cập nhật đánh giá'));
      })
    );
  }

  /**
   * Xóa đánh giá
   * @param courseId ID khóa học
   * @param reviewId ID đánh giá
   * @returns Observable kết quả thành công hay thất bại
   */
  deleteReview(courseId: string, reviewId: string): Observable<boolean> {
    return this.http.delete<ApiResponse<{ success: boolean }>>(`courses/${courseId}/reviews/${reviewId}`).pipe(
      map(response => response.data?.success || false),
      catchError(error => {
        return throwError(() => new Error(error.error?.message || 'Không thể xóa đánh giá'));
      })
    );
  }

  /**
   * Đánh dấu đánh giá là hữu ích
   * @param courseId ID khóa học
   * @param reviewId ID đánh giá
   * @returns Observable chứa số lượng đánh dấu hữu ích mới
   */
  markReviewAsHelpful(courseId: string, reviewId: string): Observable<{ helpful: number }> {
    return this.http.post<ApiResponse<{ helpful: number }>>(`courses/${courseId}/reviews/${reviewId}/helpful`, {}).pipe(
      map(response => {
        if (!response.data) {
          throw new Error('Không thể đánh dấu đánh giá là hữu ích');
        }
        return response.data;
      }),
      catchError(error => {
        return throwError(() => new Error(error.error?.message || 'Không thể đánh dấu đánh giá là hữu ích'));
      })
    );
  }

  /**
   * Phản hồi cho đánh giá (dành cho giảng viên)
   * @param courseId ID khóa học
   * @param reviewId ID đánh giá
   * @param content Nội dung phản hồi
   * @returns Observable chứa thông tin phản hồi mới
   */
  respondToReview(courseId: string, reviewId: string, content: string): Observable<ReviewResponse> {
    const payload = { content };

    return this.http.post<ApiResponse<ReviewResponse>>(`courses/${courseId}/reviews/${reviewId}/responses`, payload).pipe(
      map(response => {
        if (!response.data) {
          throw new Error('Không thể phản hồi đánh giá');
        }
        return response.data;
      }),
      catchError(error => {
        return throwError(() => new Error(error.error?.message || 'Không thể phản hồi đánh giá'));
      })
    );
  }
}