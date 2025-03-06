// src/app/shared/services/discussion.service.ts
import { Injectable } from '@angular/core';
import { Observable, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { HttpService } from './http.service';
import { DiscussionThread, DiscussionReply } from '../models/discussion.model';
import { ApiResponse, PaginationInfo } from '../models/api.model';

@Injectable({
  providedIn: 'root'
})
export class DiscussionService {
  constructor(private http: HttpService) {}
  
  /**
   * Lấy danh sách thảo luận của khóa học
   * @param courseId ID khóa học
   * @param page Trang hiện tại
   * @param limit Số lượng mục mỗi trang
   * @returns Observable chứa danh sách thảo luận và thông tin phân trang
   */
  getThreadsByCourse(courseId: string, page: number = 1, limit: number = 10): Observable<{ threads: DiscussionThread[], pagination: PaginationInfo }> {
    return this.http.get<ApiResponse<DiscussionThread[]>>(`courses/${courseId}/discussions?page=${page}&limit=${limit}`).pipe(
      map(response => {
        return {
          threads: response.data || [],
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
        return throwError(() => new Error(error.error?.message || 'Không thể tải thảo luận của khóa học'));
      })
    );
  }
  
  /**
   * Lấy danh sách thảo luận của bài học
   * @param courseId ID khóa học
   * @param lessonId ID bài học
   * @param page Trang hiện tại
   * @param limit Số lượng mục mỗi trang
   * @returns Observable chứa danh sách thảo luận và thông tin phân trang
   */
  getThreadsByLesson(courseId: string, lessonId: string, page: number = 1, limit: number = 10): Observable<{ threads: DiscussionThread[], pagination: PaginationInfo }> {
    return this.http.get<ApiResponse<DiscussionThread[]>>(`courses/${courseId}/lessons/${lessonId}/discussions?page=${page}&limit=${limit}`).pipe(
      map(response => {
        return {
          threads: response.data || [],
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
        return throwError(() => new Error(error.error?.message || 'Không thể tải thảo luận của bài học'));
      })
    );
  }
  
  /**
   * Lấy thông tin chi tiết của một thảo luận
   * @param courseId ID khóa học
   * @param threadId ID thảo luận
   * @returns Observable chứa thông tin chi tiết thảo luận
   */
  getThreadById(courseId: string, threadId: string): Observable<DiscussionThread> {
    return this.http.get<ApiResponse<DiscussionThread>>(`courses/${courseId}/discussions/${threadId}`).pipe(
      map(response => {
        if (!response.data) {
          throw new Error('Không tìm thấy thảo luận');
        }
        return response.data;
      }),
      catchError(error => {
        return throwError(() => new Error(error.error?.message || 'Không thể tải thông tin thảo luận'));
      })
    );
  }
  
  /**
   * Tạo thảo luận mới
   * @param courseId ID khóa học
   * @param lessonId ID bài học (tùy chọn)
   * @param title Tiêu đề thảo luận
   * @param content Nội dung thảo luận
   * @param tags Thẻ gắn kèm (tùy chọn)
   * @returns Observable chứa thông tin thảo luận mới
   */
  createThread(courseId: string, lessonId: string | null, title: string, content: string, tags?: string[]): Observable<DiscussionThread> {
    const payload = {
      title,
      content,
      lessonId,
      tags
    };
    
    return this.http.post<ApiResponse<DiscussionThread>>(`courses/${courseId}/discussions`, payload).pipe(
      map(response => {
        if (!response.data) {
          throw new Error('Không thể tạo thảo luận');
        }
        return response.data;
      }),
      catchError(error => {
        return throwError(() => new Error(error.error?.message || 'Không thể tạo thảo luận'));
      })
    );
  }
  
  /**
   * Cập nhật thảo luận
   * @param courseId ID khóa học
   * @param threadId ID thảo luận
   * @param title Tiêu đề mới
   * @param content Nội dung mới
   * @param tags Thẻ gắn kèm mới (tùy chọn)
   * @returns Observable chứa thông tin thảo luận sau khi cập nhật
   */
  updateThread(courseId: string, threadId: string, title: string, content: string, tags?: string[]): Observable<DiscussionThread> {
    const payload = {
      title,
      content,
      tags
    };
    
    return this.http.put<ApiResponse<DiscussionThread>>(`courses/${courseId}/discussions/${threadId}`, payload).pipe(
      map(response => {
        if (!response.data) {
          throw new Error('Không thể cập nhật thảo luận');
        }
        return response.data;
      }),
      catchError(error => {
        return throwError(() => new Error(error.error?.message || 'Không thể cập nhật thảo luận'));
      })
    );
  }
  
  /**
   * Xóa thảo luận
   * @param courseId ID khóa học
   * @param threadId ID thảo luận
   * @returns Observable kết quả thành công hay thất bại
   */
  deleteThread(courseId: string, threadId: string): Observable<boolean> {
    return this.http.delete<ApiResponse<{ success: boolean }>>(`courses/${courseId}/discussions/${threadId}`).pipe(
      map(response => response.data?.success || false),
      catchError(error => {
        return throwError(() => new Error(error.error?.message || 'Không thể xóa thảo luận'));
      })
    );
  }
  
  /**
   * Lấy danh sách phản hồi của một thảo luận
   * @param courseId ID khóa học
   * @param threadId ID thảo luận
   * @param page Trang hiện tại
   * @param limit Số lượng mục mỗi trang
   * @returns Observable chứa danh sách phản hồi và thông tin phân trang
   */
  getRepliesByThread(courseId: string, threadId: string, page: number = 1, limit: number = 20): Observable<{ replies: DiscussionReply[], pagination: PaginationInfo }> {
    return this.http.get<ApiResponse<DiscussionReply[]>>(`courses/${courseId}/discussions/${threadId}/replies?page=${page}&limit=${limit}`).pipe(
      map(response => {
        return {
          replies: response.data || [],
          pagination: response.pagination || {
            currentPage: 1,
            totalPages: 1,
            pageSize: 20,
            totalItems: response.data?.length || 0,
            hasNextPage: false,
            hasPreviousPage: false
          }
        };
      }),
      catchError(error => {
        return throwError(() => new Error(error.error?.message || 'Không thể tải phản hồi của thảo luận'));
      })
    );
  }
  
  /**
   * Tạo phản hồi cho thảo luận
   * @param courseId ID khóa học
   * @param threadId ID thảo luận
   * @param content Nội dung phản hồi
   * @param parentReplyId ID phản hồi cha (tùy chọn, cho phản hồi lồng ghép)
   * @returns Observable chứa thông tin phản hồi mới
   */
  createReply(courseId: string, threadId: string, content: string, parentReplyId?: string): Observable<DiscussionReply> {
    const payload = {
      content,
      parentReplyId
    };
    
    return this.http.post<ApiResponse<DiscussionReply>>(`courses/${courseId}/discussions/${threadId}/replies`, payload).pipe(
      map(response => {
        if (!response.data) {
          throw new Error('Không thể tạo phản hồi');
        }
        return response.data;
      }),
      catchError(error => {
        return throwError(() => new Error(error.error?.message || 'Không thể tạo phản hồi'));
      })
    );
  }
  
  /**
   * Cập nhật phản hồi
   * @param courseId ID khóa học
   * @param threadId ID thảo luận
   * @param replyId ID phản hồi
   * @param content Nội dung mới
   * @returns Observable chứa thông tin phản hồi sau khi cập nhật
   */
  updateReply(courseId: string, threadId: string, replyId: string, content: string): Observable<DiscussionReply> {
    const payload = { content };
    
    return this.http.put<ApiResponse<DiscussionReply>>(`courses/${courseId}/discussions/${threadId}/replies/${replyId}`, payload).pipe(
      map(response => {
        if (!response.data) {
          throw new Error('Không thể cập nhật phản hồi');
        }
        return response.data;
      }),
      catchError(error => {
        return throwError(() => new Error(error.error?.message || 'Không thể cập nhật phản hồi'));
      })
    );
  }
  
  /**
   * Xóa phản hồi
   * @param courseId ID khóa học
   * @param threadId ID thảo luận
   * @param replyId ID phản hồi
   * @returns Observable kết quả thành công hay thất bại
   */
  deleteReply(courseId: string, threadId: string, replyId: string): Observable<boolean> {
    return this.http.delete<ApiResponse<{ success: boolean }>>(`courses/${courseId}/discussions/${threadId}/replies/${replyId}`).pipe(
      map(response => response.data?.success || false),
      catchError(error => {
        return throwError(() => new Error(error.error?.message || 'Không thể xóa phản hồi'));
      })
    );
  }
  
  /**
   * Đánh dấu phản hồi là câu trả lời
   * @param courseId ID khóa học
   * @param threadId ID thảo luận
   * @param replyId ID phản hồi
   * @returns Observable chứa thông tin phản hồi sau khi đánh dấu
   */
  markAsAnswer(courseId: string, threadId: string, replyId: string): Observable<DiscussionReply> {
    return this.http.post<ApiResponse<DiscussionReply>>(`courses/${courseId}/discussions/${threadId}/replies/${replyId}/mark-answer`, {}).pipe(
      map(response => {
        if (!response.data) {
          throw new Error('Không thể đánh dấu phản hồi là câu trả lời');
        }
        return response.data;
      }),
      catchError(error => {
        return throwError(() => new Error(error.error?.message || 'Không thể đánh dấu phản hồi là câu trả lời'));
      })
    );
  }
  
  /**
   * Bỏ phiếu hữu ích cho thảo luận
   * @param courseId ID khóa học
   * @param threadId ID thảo luận
   * @returns Observable chứa số lượt bỏ phiếu mới
   */
  upvoteThread(courseId: string, threadId: string): Observable<{ upvotes: number }> {
    return this.http.post<ApiResponse<{ upvotes: number }>>(`courses/${courseId}/discussions/${threadId}/upvote`, {}).pipe(
      map(response => {
        if (!response.data) {
          throw new Error('Không thể bỏ phiếu cho thảo luận');
        }
        return response.data;
      }),
      catchError(error => {
        return throwError(() => new Error(error.error?.message || 'Không thể bỏ phiếu cho thảo luận'));
      })
    );
  }
  
  /**
   * Bỏ phiếu hữu ích cho phản hồi
   * @param courseId ID khóa học
   * @param threadId ID thảo luận
   * @param replyId ID phản hồi
   * @returns Observable chứa số lượt bỏ phiếu mới
   */
  // src/app/shared/services/discussion.service.ts (tiếp theo)
  upvoteReply(courseId: string, threadId: string, replyId: string): Observable<{ upvotes: number }> {
    return this.http.post<ApiResponse<{ upvotes: number }>>(`courses/${courseId}/discussions/${threadId}/replies/${replyId}/upvote`, {}).pipe(
      map(response => {
        if (!response.data) {
          throw new Error('Không thể bỏ phiếu cho phản hồi');
        }
        return response.data;
      }),
      catchError(error => {
        return throwError(() => new Error(error.error?.message || 'Không thể bỏ phiếu cho phản hồi'));
      })
    );
  }
}