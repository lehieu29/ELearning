import { Injectable } from '@angular/core';
import { Observable, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { HttpService } from './http.service';
import { Quiz } from '../models/quiz.model';
import { QuizAttempt } from '../models/quiz.model';
import { ApiResponse } from '../models/api.model';

@Injectable({
  providedIn: 'root'
})
export class QuizService {
  constructor(private http: HttpService) {}
  
  /**
   * Lấy thông tin chi tiết của bài kiểm tra
   * @param courseId ID khóa học
   * @param lessonId ID bài học
   * @param quizId ID bài kiểm tra
   * @returns Observable chứa thông tin bài kiểm tra
   */
  getQuizById(courseId: string, lessonId: string, quizId: string): Observable<Quiz> {
    return this.http.get<ApiResponse<Quiz>>(`courses/${courseId}/lessons/${lessonId}/quizzes/${quizId}`).pipe(
      map(response => {
        if (!response.data) {
          throw new Error('Không tìm thấy bài kiểm tra');
        }
        return response.data;
      }),
      catchError(error => {
        return throwError(() => new Error(error.error?.message || 'Không thể tải bài kiểm tra'));
      })
    );
  }
  
  /**
   * Bắt đầu làm bài kiểm tra
   * @param courseId ID khóa học
   * @param lessonId ID bài học
   * @param quizId ID bài kiểm tra
   * @returns Observable chứa thông tin lần thử
   */
  startQuizAttempt(courseId: string, lessonId: string, quizId: string): Observable<QuizAttempt> {
    return this.http.post<ApiResponse<QuizAttempt>>(`courses/${courseId}/lessons/${lessonId}/quizzes/${quizId}/attempts`, {}).pipe(
      map(response => {
        if (!response.data) {
          throw new Error('Không thể bắt đầu bài kiểm tra');
        }
        return response.data;
      }),
      catchError(error => {
        return throwError(() => new Error(error.error?.message || 'Không thể bắt đầu bài kiểm tra'));
      })
    );
  }
  
  /**
   * Nộp bài làm kiểm tra
   * @param courseId ID khóa học
   * @param lessonId ID bài học
   * @param quizId ID bài kiểm tra
   * @param attemptId ID lần thử
   * @param answers Danh sách câu trả lời
   * @returns Observable chứa kết quả làm bài
   */
  submitQuizAttempt(
    courseId: string, 
    lessonId: string, 
    quizId: string, 
    attemptId: string, 
    answers: { questionId: string, answer: string | string[] }[]
  ): Observable<QuizAttempt> {
    return this.http.post<ApiResponse<QuizAttempt>>(
      `courses/${courseId}/lessons/${lessonId}/quizzes/${quizId}/attempts/${attemptId}/submit`, 
      { answers }
    ).pipe(
      map(response => {
        if (!response.data) {
          throw new Error('Không thể nộp bài kiểm tra');
        }
        return response.data;
      }),
      catchError(error => {
        return throwError(() => new Error(error.error?.message || 'Không thể nộp bài kiểm tra'));
      })
    );
  }
  
  /**
   * Lấy thông tin chi tiết của một lần làm bài
   * @param courseId ID khóa học
   * @param lessonId ID bài học
   * @param quizId ID bài kiểm tra
   * @param attemptId ID lần thử
   * @returns Observable chứa thông tin lần làm bài
   */
  getQuizAttempt(courseId: string, lessonId: string, quizId: string, attemptId: string): Observable<QuizAttempt> {
    return this.http.get<ApiResponse<QuizAttempt>>(
      `courses/${courseId}/lessons/${lessonId}/quizzes/${quizId}/attempts/${attemptId}`
    ).pipe(
      map(response => {
        if (!response.data) {
          throw new Error('Không tìm thấy lần làm bài');
        }
        return response.data;
      }),
      catchError(error => {
        return throwError(() => new Error(error.error?.message || 'Không thể tải lần làm bài'));
      })
    );
  }
  
  /**
   * Lấy lịch sử làm bài kiểm tra
   * @param courseId ID khóa học
   * @param lessonId ID bài học
   * @param quizId ID bài kiểm tra
   * @returns Observable chứa danh sách các lần làm bài
   */
  getQuizAttemptHistory(courseId: string, lessonId: string, quizId: string): Observable<QuizAttempt[]> {
    return this.http.get<ApiResponse<QuizAttempt[]>>(
      `courses/${courseId}/lessons/${lessonId}/quizzes/${quizId}/attempts`
    ).pipe(
      map(response => response.data || []),
      catchError(error => {
        return throwError(() => new Error(error.error?.message || 'Không thể tải lịch sử làm bài'));
      })
    );
  }
}