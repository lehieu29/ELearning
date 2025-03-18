import { Component, Input, OnChanges, OnInit, SimpleChanges } from '@angular/core';
import { Router } from '@angular/router';
import { BaseComponent } from '@app/shared/components/base/base-component';
import { CourseService } from '@app/shared/services/course.service';
import { CourseSyllabus, CourseSection, Lesson } from '@app/shared/models/course.model';
import { takeUntil } from 'rxjs/operators';

@Component({
  selector: 'app-course-syllabus',
  templateUrl: './course-syllabus.component.html'
})
export class CourseSyllabusComponent extends BaseComponent implements OnInit, OnChanges {
  @Input() courseId: string;
  syllabus: CourseSyllabus;
  expandedSections: Set<string> = new Set();
  isLoading: boolean = true;
  error: string = '';
  
  // Track completion statistics
  totalLessons: number = 0;
  completedLessons: number = 0;
  
  constructor(
    private courseService: CourseService,
    private router: Router
  ) {
    super();
  }
  
  /**
   * Khởi tạo component, tải dữ liệu nếu có courseId
   * Initialize component, load data if courseId exists
   */
  ngOnInit(): void {
    if (this.courseId) {
      this.loadSyllabus();
    }
  }
  
  /**
   * Theo dõi thay đổi của @Input và tải lại dữ liệu khi cần
   * Track changes to @Input and reload data when needed
   * @param changes Các thay đổi của @Input properties
   */
  ngOnChanges(changes: SimpleChanges): void {
    if (changes.courseId && !changes.courseId.firstChange && this.courseId) {
      this.loadSyllabus();
    }
  }
  
  /**
   * Tải dữ liệu chương trình giảng dạy từ API
   * Load syllabus data from API
   */
  loadSyllabus(): void {
    this.isLoading = true;
    this.error = '';
    
    this.courseService.getCourseSyllabus(this.courseId)
      .pipe(takeUntil(this._onDestroySub))
      .subscribe({
        next: (syllabus) => {
          this.syllabus = syllabus;
          this.calculateCompletionStats();
          
          // Auto-expand first section
          if (this.syllabus?.sections?.length > 0) {
            this.expandedSections.add(this.syllabus.sections[0].id);
          }
          
          this.isLoading = false;
        },
        error: (err) => {
          console.error('Error loading syllabus:', err);
          this.error = 'Không thể tải chương trình giảng dạy. Vui lòng thử lại sau.';
          this.isLoading = false;
        }
      });
  }
  
  /**
   * Chuyển đến bài học đã chọn
   * Navigate to the selected lesson
   * @param lesson Bài học được chọn
   */
  navigateToLesson(lesson: Lesson): void {
    if (lesson.isLocked) {
      return; // Don't navigate to locked lessons
    }
    
    this.router.navigate(['/courses', this.courseId, 'lessons', lesson.id]);
  }
  
  /**
   * Mở rộng hoặc thu gọn một phần
   * Expand or collapse a section
   * @param sectionId ID của phần cần mở rộng/thu gọn
   */
  toggleSection(sectionId: string): void {
    if (this.expandedSections.has(sectionId)) {
      this.expandedSections.delete(sectionId);
    } else {
      this.expandedSections.add(sectionId);
    }
  }
  
  /**
   * Kiểm tra trạng thái mở rộng của một phần
   * Check if a section is expanded
   * @param sectionId ID của phần cần kiểm tra
   * @returns True nếu phần đó đang mở rộng
   */
  isSectionExpanded(sectionId: string): boolean {
    return this.expandedSections.has(sectionId);
  }
  
  /**
   * Tính toán số liệu thống kê hoàn thành
   * Calculate completion statistics
   */
  calculateCompletionStats(): void {
    this.totalLessons = 0;
    this.completedLessons = 0;
    
    if (!this.syllabus?.sections) return;
    
    this.syllabus.sections.forEach(section => {
      if (!section.lessons) return;
      
      this.totalLessons += section.lessons.length;
      section.lessons.forEach(lesson => {
        if (lesson.isCompleted) {
          this.completedLessons++;
        }
      });
    });
  }
  
  /**
   * Lấy phần trăm hoàn thành của khóa học
   * Get completion percentage of the course
   */
  getCompletionPercentage(): number {
    if (this.totalLessons === 0) return 0;
    return Math.round((this.completedLessons / this.totalLessons) * 100);
  }
  
  /**
   * Lấy phần trăm hoàn thành của một phần
   * Get completion percentage of a section
   * @param section Section cần tính phần trăm hoàn thành
   */
  getSectionCompletionPercentage(section: CourseSection): number {
    if (!section.lessons || section.lessons.length === 0) return 0;
    
    const completedInSection = section.lessons.filter(lesson => lesson.isCompleted).length;
    return Math.round((completedInSection / section.lessons.length) * 100);
  }
  
  /**
   * Lấy icon phù hợp với loại bài học
   * Get appropriate icon for lesson type
   * @param lessonType Loại bài học
   * @returns Tên icon phù hợp
   */
  getLessonTypeIcon(lessonType: string): string {
    switch (lessonType) {
      case 'video': return 'video';
      case 'quiz': return 'check-square';
      case 'assignment': return 'file-text';
      case 'reading': return 'book-open';
      case 'interactive': return 'code';
      default: return 'circle';
    }
  }
}
