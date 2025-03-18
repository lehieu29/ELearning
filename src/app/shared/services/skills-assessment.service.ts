import { Injectable } from '@angular/core';
import { Observable, of, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { HttpService } from './http.service';
import { environment } from '@environments/environment';
import { 
  Skill, 
  SkillCategory, 
  Assessment, 
  AssessmentQuestion,
  AssessmentResult 
} from '@app/shared/models/skills-assessment.model';

@Injectable({
  providedIn: 'root'
})
export class SkillsAssessmentService extends HttpService {

  /**
   * Lấy danh sách tất cả các danh mục kỹ năng
   * Get all skill categories
   */
  getSkillCategories(): Observable<SkillCategory[]> {
    return this.get<SkillCategory[]>(`${environment.apiUrl}/skills/categories`)
      .pipe(
        catchError(error => {
          console.error('Lỗi khi tải danh mục kỹ năng:', error);
          return throwError(() => new Error('Không thể tải danh mục kỹ năng. Vui lòng thử lại sau.'));
        })
      );
  }

  /**
   * Lấy chi tiết một danh mục kỹ năng và các kỹ năng liên quan
   * Get a skill category with related skills
   * @param categoryId ID của danh mục kỹ năng
   */
  getSkillCategoryDetails(categoryId: string): Observable<SkillCategory> {
    return this.get<SkillCategory>(`${environment.apiUrl}/skills/categories/${categoryId}`)
      .pipe(
        catchError(error => {
          console.error(`Lỗi khi tải chi tiết danh mục kỹ năng ${categoryId}:`, error);
          return throwError(() => new Error('Không thể tải chi tiết danh mục kỹ năng. Vui lòng thử lại sau.'));
        })
      );
  }

  /**
   * Lấy danh sách các kỹ năng của người dùng
   * Get user skills
   */
  getUserSkills(): Observable<Skill[]> {
    return this.get<Skill[]>(`${environment.apiUrl}/users/me/skills`)
      .pipe(
        catchError(error => {
          console.error('Lỗi khi tải kỹ năng người dùng:', error);
          return throwError(() => new Error('Không thể tải kỹ năng người dùng. Vui lòng thử lại sau.'));
        })
      );
  }

  /**
   * Lấy danh sách các bài đánh giá có sẵn
   * Get available assessments
   */
  getAvailableAssessments(): Observable<Assessment[]> {
    return this.get<Assessment[]>(`${environment.apiUrl}/skills/assessments`)
      .pipe(
        catchError(error => {
          console.error('Lỗi khi tải bài đánh giá kỹ năng:', error);
          return throwError(() => new Error('Không thể tải bài đánh giá kỹ năng. Vui lòng thử lại sau.'));
        })
      );
  }

  /**
   * Lấy các câu hỏi cho một bài đánh giá
   * Get questions for an assessment
   * @param assessmentId ID của bài đánh giá
   */
  getAssessmentQuestions(assessmentId: string): Observable<AssessmentQuestion[]> {
    return this.get<AssessmentQuestion[]>(`${environment.apiUrl}/skills/assessments/${assessmentId}/questions`)
      .pipe(
        catchError(error => {
          console.error(`Lỗi khi tải câu hỏi đánh giá ${assessmentId}:`, error);
          return throwError(() => new Error('Không thể tải câu hỏi đánh giá. Vui lòng thử lại sau.'));
        })
      );
  }

  /**
   * Gửi kết quả bài đánh giá kỹ năng
   * Submit assessment answers
   * @param assessmentId ID của bài đánh giá
   * @param answers Các câu trả lời của người dùng
   */
  submitAssessment(assessmentId: string, answers: { questionId: string, answer: string | string[] }[]): Observable<AssessmentResult> {
    return this.post<AssessmentResult>(`${environment.apiUrl}/skills/assessments/${assessmentId}/submit`, { answers })
      .pipe(
        catchError(error => {
          console.error(`Lỗi khi gửi kết quả đánh giá ${assessmentId}:`, error);
          return throwError(() => new Error('Không thể gửi kết quả đánh giá. Vui lòng thử lại sau.'));
        })
      );
  }

  /**
   * Lấy lịch sử kết quả đánh giá kỹ năng
   * Get assessment result history
   */
  getAssessmentHistory(): Observable<AssessmentResult[]> {
    return this.get<AssessmentResult[]>(`${environment.apiUrl}/users/me/skills/assessment-history`)
      .pipe(
        catchError(error => {
          console.error('Lỗi khi tải lịch sử đánh giá kỹ năng:', error);
          return throwError(() => new Error('Không thể tải lịch sử đánh giá kỹ năng. Vui lòng thử lại sau.'));
        })
      );
  }

  /**
   * Lấy các khóa học được đề xuất dựa trên kỹ năng
   * Get course recommendations based on skills
   * @param skillIds Danh sách ID kỹ năng
   */
  getSkillBasedCourseRecommendations(skillIds: string[]): Observable<RelevantCourse[]> {
    return this.post<RelevantCourse[]>(`${environment.apiUrl}/skills/course-recommendations`, { skillIds })
      .pipe(
        catchError(error => {
          console.error('Lỗi khi tải đề xuất khóa học dựa trên kỹ năng:', error);
          return throwError(() => new Error('Không thể tải đề xuất khóa học. Vui lòng thử lại sau.'));
        })
      );
  }

  /**
   * Cập nhật mức độ thành thạo kỹ năng của người dùng
   * Update user skill proficiency level
   * @param skillId ID của kỹ năng
   * @param proficiencyLevel Mức độ thành thạo mới (0-100)
   */
  updateSkillProficiency(skillId: string, proficiencyLevel: number): Observable<Skill> {
    return this.patch<Skill>(`${environment.apiUrl}/users/me/skills/${skillId}`, { proficiencyLevel })
      .pipe(
        catchError(error => {
          console.error(`Lỗi khi cập nhật mức độ thành thạo kỹ năng ${skillId}:`, error);
          return throwError(() => new Error('Không thể cập nhật mức độ thành thạo kỹ năng. Vui lòng thử lại sau.'));
        })
      );
  }
}
