import { Injectable } from '@angular/core';
import { HttpService } from './http.service';
import { Observable, throwError, of, forkJoin } from 'rxjs';
import { map, catchError, switchMap } from 'rxjs/operators';
import { 
  Resume, 
  ResumeTemplate, 
  ResumeExportOptions, 
  ResumeSection, 
  EducationItem,
  ExperienceItem,
  SkillItem,
  ProjectItem,
  CourseItem,
  CertificateItem
} from '../models/resume.model';
import { Course } from '../models/course.model';
import { Certificate } from '../models/certificate.model';
import { Skill } from '../models/skills-assessment.model';
import { environment } from '@environments/environment';
import { CourseService } from './course.service';
import { CertificateService } from './certificate.service';
import { SkillsAssessmentService } from './skills-assessment.service';

@Injectable({
  providedIn: 'root'
})
export class ResumeBuilderService extends HttpService {
  private readonly API_URL = `${environment.apiUrl}/resumes`;
  
  constructor(
    private courseService: CourseService,
    private certificateService: CertificateService,
    private skillsService: SkillsAssessmentService
  ) {
    super();
  }
  
  /**
   * Lấy tất cả CV của người dùng hiện tại
   * Get all resumes for the current user
   */
  getUserResumes(): Observable<Resume[]> {
    return this.get<Resume[]>(`${this.API_URL}`).pipe(
      map(resumes => resumes.map(resume => this.parseResumeDates(resume))),
      catchError(error => {
        console.error('Lỗi khi tải danh sách CV:', error);
        return throwError(() => new Error('Không thể tải danh sách CV. Vui lòng thử lại sau.'));
      })
    );
  }
  
  /**
   * Lấy thông tin chi tiết của một CV
   * Get detailed information of a resume
   * @param resumeId ID của CV cần lấy thông tin
   */
  getResumeById(resumeId: string): Observable<Resume> {
    return this.get<Resume>(`${this.API_URL}/${resumeId}`).pipe(
      map(resume => this.parseResumeDates(resume)),
      catchError(error => {
        console.error(`Lỗi khi tải CV (${resumeId}):`, error);
        return throwError(() => new Error('Không thể tải thông tin CV. Vui lòng thử lại sau.'));
      })
    );
  }
  
  /**
   * Tạo một CV mới
   * Create a new resume
   * @param resume Dữ liệu CV cần tạo
   */
  createResume(resume: Partial<Resume>): Observable<Resume> {
    return this.post<Resume>(`${this.API_URL}`, resume).pipe(
      map(resume => this.parseResumeDates(resume)),
      catchError(error => {
        console.error('Lỗi khi tạo CV mới:', error);
        return throwError(() => new Error('Không thể tạo CV mới. Vui lòng thử lại sau.'));
      })
    );
  }
  
  /**
   * Cập nhật thông tin CV
   * Update resume information
   * @param resumeId ID của CV cần cập nhật
   * @param resume Dữ liệu CV đã được cập nhật
   */
  updateResume(resumeId: string, resume: Partial<Resume>): Observable<Resume> {
    return this.put<Resume>(`${this.API_URL}/${resumeId}`, resume).pipe(
      map(resume => this.parseResumeDates(resume)),
      catchError(error => {
        console.error(`Lỗi khi cập nhật CV (${resumeId}):`, error);
        return throwError(() => new Error('Không thể cập nhật CV. Vui lòng thử lại sau.'));
      })
    );
  }
  
  /**
   * Xóa một CV
   * Delete a resume
   * @param resumeId ID của CV cần xóa
   */
  deleteResume(resumeId: string): Observable<void> {
    return this.delete<void>(`${this.API_URL}/${resumeId}`).pipe(
      catchError(error => {
        console.error(`Lỗi khi xóa CV (${resumeId}):`, error);
        return throwError(() => new Error('Không thể xóa CV. Vui lòng thử lại sau.'));
      })
    );
  }
  
  /**
   * Lấy danh sách các mẫu CV có sẵn
   * Get list of available resume templates
   */
  getResumeTemplates(): Observable<ResumeTemplate[]> {
    return this.get<ResumeTemplate[]>(`${this.API_URL}/templates`).pipe(
      catchError(error => {
        console.error('Lỗi khi tải mẫu CV:', error);
        return throwError(() => new Error('Không thể tải danh sách mẫu CV. Vui lòng thử lại sau.'));
      })
    );
  }
  
  /**
   * Xuất CV sang các định dạng khác nhau (PDF, DOCX, ...)
   * Export resume to different formats
   * @param resumeId ID của CV cần xuất
   * @param options Tùy chọn xuất CV
   */
  exportResume(resumeId: string, options: ResumeExportOptions): Observable<Blob> {
    return this.post<Blob>(`${this.API_URL}/${resumeId}/export`, options, { responseType: 'blob' as 'json' }).pipe(
      catchError(error => {
        console.error(`Lỗi khi xuất CV (${resumeId}):`, error);
        return throwError(() => new Error('Không thể xuất CV. Vui lòng thử lại sau.'));
      })
    );
  }
  
  /**
   * Tạo CV từ dữ liệu khóa học và kỹ năng của người dùng
   * Generate resume from user's courses and skills data
   */
  generateResumeFromUserData(): Observable<Resume> {
    // Tạo một draft CV mới
    const newResume: Partial<Resume> = {
      title: `CV của tôi - ${new Date().toLocaleDateString('vi-VN')}`,
      templateId: 'default-template',
      isPublished: false,
      sections: [],
      personalInfo: {
        firstName: '',
        lastName: '',
        jobTitle: ''
      },
      contactInfo: {
        email: ''
      },
      socialLinks: [],
      summary: ''
    };
    
    return this.createResume(newResume).pipe(
      switchMap(resume => {
        // Lấy dữ liệu khóa học, chứng chỉ và kỹ năng của người dùng
        return forkJoin([
          this.courseService.getCompletedCourses(),
          this.certificateService.getUserCertificates(),
          this.skillsService.getUserSkills()
        ]).pipe(
          switchMap(([courses, certificates, skills]) => {
            // Tạo các section từ dữ liệu người dùng
            const sections: ResumeSection[] = [];
            
            // Thêm section kỹ năng
            if (skills && skills.length > 0) {
              sections.push(this.createSkillsSection(skills));
            }
            
            // Thêm section khóa học
            if (courses && courses.length > 0) {
              sections.push(this.createCoursesSection(courses));
            }
            
            // Thêm section chứng chỉ
            if (certificates && certificates.length > 0) {
              sections.push(this.createCertificatesSection(certificates));
            }
            
            // Thêm section dự án nếu có
            const projects = this.extractProjectsFromCourses(courses);
            if (projects.length > 0) {
              sections.push(this.createProjectsSection(projects));
            }
            
            // Cập nhật CV với các section mới tạo
            return this.updateResume(resume.id!, {
              sections: sections
            });
          })
        );
      }),
      catchError(error => {
        console.error('Lỗi khi tạo CV từ dữ liệu người dùng:', error);
        return throwError(() => new Error('Không thể tạo CV từ dữ liệu người dùng. Vui lòng thử lại sau.'));
      })
    );
  }
  
  /**
   * Tạo section kỹ năng từ danh sách kỹ năng người dùng
   * Create skills section from user's skills
   * @param skills Danh sách kỹ năng của người dùng
   */
  private createSkillsSection(skills: Skill[]): ResumeSection {
    const skillItems: SkillItem[] = skills.map((skill, index) => ({
      id: `skill-${index}`,
      title: skill.name,
      subtitle: skill.category,
      proficiency: skill.proficiencyLevel,
      tags: []
    }));
    
    return {
      id: `section-${Date.now()}-skills`,
      type: 'skills',
      title: 'Kỹ năng',
      order: 1,
      isVisible: true,
      items: skillItems
    };
  }
  
  /**
   * Tạo section khóa học từ danh sách khóa học đã hoàn thành
   * Create courses section from completed courses
   * @param courses Danh sách khóa học đã hoàn thành
   */
  private createCoursesSection(courses: Course[]): ResumeSection {
    const courseItems: CourseItem[] = courses.map((course, index) => ({
      id: `course-${index}`,
      title: course.title,
      subtitle: course.category || course.level,
      provider: 'Udacity',
      description: course.description,
      courseId: course.id,
      completionDate: course.completedAt,
      skills: course.skills
    }));
    
    return {
      id: `section-${Date.now()}-courses`,
      type: 'courses',
      title: 'Khóa học',
      order: 2,
      isVisible: true,
      items: courseItems
    };
  }
  
  /**
   * Tạo section chứng chỉ từ danh sách chứng chỉ người dùng
   * Create certificates section from user's certificates
   * @param certificates Danh sách chứng chỉ người dùng
   */
  private createCertificatesSection(certificates: Certificate[]): ResumeSection {
    const certificateItems: CertificateItem[] = certificates.map((cert, index) => ({
      id: `cert-${index}`,
      title: cert.title,
      subtitle: cert.courseName,
      issuer: cert.issuer.name,
      credentialId: cert.credentialId,
      description: cert.description || '',
      url: cert.verificationUrl,
      issueDate: cert.issueDate,
      expirationDate: cert.expirationDate,
      certificateId: cert.id
    }));
    
    return {
      id: `section-${Date.now()}-certificates`,
      type: 'certificates',
      title: 'Chứng chỉ',
      order: 3,
      isVisible: true,
      items: certificateItems
    };
  }
  
  /**
   * Tạo section dự án từ dự án trong khóa học
   * Create projects section from course projects
   * @param projects Danh sách dự án từ khóa học
   */
  private createProjectsSection(projects: ProjectItem[]): ResumeSection {
    return {
      id: `section-${Date.now()}-projects`,
      type: 'projects',
      title: 'Dự án',
      order: 4,
      isVisible: true,
      items: projects
    };
  }
  
  /**
   * Trích xuất dự án từ khóa học
   * Extract projects from courses
   * @param courses Danh sách khóa học
   */
  private extractProjectsFromCourses(courses: Course[]): ProjectItem[] {
    const projects: ProjectItem[] = [];
    
    courses.forEach((course, courseIndex) => {
      // Giả định rằng mỗi khóa học có một mảng projects
      // Trong thực tế, cần điều chỉnh logic này dựa trên cấu trúc dữ liệu thực của bạn
      if (course.projects && Array.isArray(course.projects)) {
        course.projects.forEach((project, projIndex) => {
          projects.push({
            id: `project-${courseIndex}-${projIndex}`,
            title: project.title,
            subtitle: course.title,
            description: project.description,
            technologies: project.technologies,
            url: project.url,
            tags: project.tags,
            courseId: course.id
          });
        });
      }
    });
    
    return projects;
  }
  
  /**
   * Chuyển đổi chuỗi ngày tháng trong dữ liệu CV thành đối tượng Date
   * Convert date strings in resume data to Date objects
   * @param resume CV cần chuyển đổi ngày tháng
   */
  private parseResumeDates(resume: Resume): Resume {
    resume.createdAt = new Date(resume.createdAt);
    resume.updatedAt = new Date(resume.updatedAt);
    
    resume.sections.forEach(section => {
      section.items.forEach(item => {
        if (item.startDate) {
          item.startDate = new Date(item.startDate);
        }
        if (item.endDate) {
          item.endDate = new Date(item.endDate);
        }
      });
    });
    
    return resume;
  }
}
