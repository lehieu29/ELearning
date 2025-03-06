import { Injectable } from '@angular/core';
import { HttpParams } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { HttpService } from './http.service';
import { Course } from '../models/course.model';
import { CourseProgress } from '../models/course.model';
import { Lesson } from '../models/course.model';
import { ApiResponse } from '../models/api.model';
import { PaginationInfo, QueryParams } from '../models/api.model';

@Injectable({
  providedIn: 'root'
})
export class CourseService {
  constructor(private http: HttpService) {}
  
  /**
   * Lấy danh sách khóa học
   * @param params Các tham số truy vấn (phân trang, sắp xếp, tìm kiếm...)
   * @returns Observable chứa danh sách khóa học và thông tin phân trang
   */
  getCourses(params?: QueryParams): Observable<{ courses: Course[], pagination: PaginationInfo }> {
    let httpParams = new HttpParams();
    
    if (params) {
      Object.keys(params).forEach(key => {
        if (params[key] !== undefined && params[key] !== null) {
          if (Array.isArray(params[key])) {
            params[key].forEach(value => {
              httpParams = httpParams.append(`${key}[]`, value);
            });
          } else {
            httpParams = httpParams.set(key, params[key]);
          }
        }
      });
    }
    
    return this.http.get<ApiResponse<Course[]>>('courses', { params: httpParams }).pipe(
      map(response => {
        return {
          courses: response.data || [],
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
        return throwError(() => new Error(error.error?.message || 'Không thể tải danh sách khóa học'));
      })
    );
  }
  
  /**
   * Lấy thông tin chi tiết của một khóa học
   * @param courseId ID của khóa học
   * @returns Observable chứa thông tin chi tiết khóa học
   */
  getCourseById(courseId: string): Observable<Course> {
    return this.http.get<ApiResponse<Course>>(`courses/${courseId}`).pipe(
      map(response => {
        if (!response.data) {
          throw new Error('Không tìm thấy khóa học');
        }
        return response.data;
      }),
      catchError(error => {
        return throwError(() => new Error(error.error?.message || 'Không thể tải thông tin khóa học'));
      })
    );
  }
  
  /**
   * Lấy danh sách khóa học của một giảng viên
   * @param instructorId ID của giảng viên
   * @returns Observable chứa danh sách khóa học
   */
  getCoursesByInstructor(instructorId: string): Observable<Course[]> {
    return this.http.get<ApiResponse<Course[]>>(`instructors/${instructorId}/courses`).pipe(
      map(response => response.data || []),
      catchError(error => {
        return throwError(() => new Error(error.error?.message || 'Không thể tải khóa học của giảng viên'));
      })
    );
  }
  
  /**
   * Đăng ký tham gia khóa học
   * @param courseId ID của khóa học
   * @returns Observable kết quả thành công hay thất bại
   */
  enrollInCourse(courseId: string): Observable<boolean> {
    return this.http.post<ApiResponse<{ success: boolean }>>(`courses/${courseId}/enroll`, {}).pipe(
      map(response => response.data?.success || false),
      catchError(error => {
        return throwError(() => new Error(error.error?.message || 'Không thể đăng ký khóa học'));
      })
    );
  }
  
  /**
   * Hủy đăng ký khóa học
   * @param courseId ID của khóa học
   * @returns Observable kết quả thành công hay thất bại
   */
  unenrollFromCourse(courseId: string): Observable<boolean> {
    return this.http.post<ApiResponse<{ success: boolean }>>(`courses/${courseId}/unenroll`, {}).pipe(
      map(response => response.data?.success || false),
      catchError(error => {
        return throwError(() => new Error(error.error?.message || 'Không thể hủy đăng ký khóa học'));
      })
    );
  }
  
  /**
   * Lấy danh sách khóa học đã đăng ký
   * @returns Observable chứa danh sách khóa học đã đăng ký
   */
  getEnrolledCourses(): Observable<Course[]> {
    return this.http.get<ApiResponse<Course[]>>('user/courses').pipe(
      map(response => response.data || []),
      catchError(error => {
        return throwError(() => new Error(error.error?.message || 'Không thể tải khóa học đã đăng ký'));
      })
    );
  }
  
  /**
   * Kiểm tra trạng thái đăng ký khóa học
   * @param courseId ID của khóa học
   * @returns Observable kết quả đã đăng ký hay chưa
   */
  checkEnrollment(courseId: string): Observable<boolean> {
    return this.http.get<ApiResponse<{ enrolled: boolean }>>(`courses/${courseId}/enrollment-status`).pipe(
      map(response => response.data?.enrolled || false),
      catchError(error => {
        return throwError(() => new Error(error.error?.message || 'Không thể kiểm tra trạng thái đăng ký'));
      })
    );
  }
  
  /**
   * Lấy tiến độ học tập của khóa học
   * @param courseId ID của khóa học
   * @returns Observable chứa thông tin tiến độ
   */
  getCourseProgress(courseId: string): Observable<CourseProgress> {
    return this.http.get<ApiResponse<CourseProgress>>(`courses/${courseId}/progress`).pipe(
      map(response => {
        if (!response.data) {
          throw new Error('Không tìm thấy tiến độ');
        }
        return response.data;
      }),
      catchError(error => {
        return throwError(() => new Error(error.error?.message || 'Không thể tải tiến độ khóa học'));
      })
    );
  }
  
  /**
   * Đánh dấu bài học đã hoàn thành
   * @param courseId ID của khóa học
   * @param lessonId ID của bài học
   * @returns Observable chứa thông tin tiến độ cập nhật
   */
  markLessonComplete(courseId: string, lessonId: string): Observable<CourseProgress> {
    return this.http.post<ApiResponse<CourseProgress>>(`courses/${courseId}/lessons/${lessonId}/complete`, {}).pipe(
      map(response => {
        if (!response.data) {
          throw new Error('Không thể cập nhật tiến độ');
        }
        return response.data;
      }),
      catchError(error => {
        return throwError(() => new Error(error.error?.message || 'Không thể đánh dấu bài học hoàn thành'));
      })
    );
  }
  
  /**
   * Lấy nội dung bài học
   * @param courseId ID của khóa học
   * @param lessonId ID của bài học
   * @returns Observable chứa nội dung bài học
   */
  getLessonContent(courseId: string, lessonId: string): Observable<Lesson> {
    return this.http.get<ApiResponse<Lesson>>(`courses/${courseId}/lessons/${lessonId}`).pipe(
      map(response => {
        if (!response.data) {
          throw new Error('Không tìm thấy bài học');
        }
        return response.data;
      }),
      catchError(error => {
        return throwError(() => new Error(error.error?.message || 'Không thể tải nội dung bài học'));
      })
    );
  }
  
  /**
   * Kiểm tra điều kiện tiên quyết của bài học
   * @param courseId ID của khóa học
   * @param lessonId ID của bài học
   * @returns Observable kết quả điều kiện đã đáp ứng hay chưa
   */
  checkLessonPrerequisites(courseId: string, lessonId: string): Observable<boolean> {
    return this.http.get<ApiResponse<{ prerequisitesMet: boolean }>>(`courses/${courseId}/lessons/${lessonId}/prerequisites`).pipe(
      map(response => response.data?.prerequisitesMet || false),
      catchError(error => {
        return throwError(() => new Error(error.error?.message || 'Không thể kiểm tra điều kiện tiên quyết'));
      })
    );
  }
  
  /**
   * Kiểm tra quyền sở hữu khóa học (dành cho giảng viên)
   * @param courseId ID của khóa học
   * @returns Observable kết quả có sở hữu hay không
   */
  checkCourseOwnership(courseId: string): Observable<boolean> {
    return this.http.get<ApiResponse<{ isOwner: boolean }>>(`courses/${courseId}/ownership`).pipe(
      map(response => response.data?.isOwner || false),
      catchError(error => {
        return throwError(() => new Error(error.error?.message || 'Không thể kiểm tra quyền sở hữu khóa học'));
      })
    );
  }
}