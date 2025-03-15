import { Component, Input, OnChanges, OnInit, SimpleChanges } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
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
  expandedSections: { [key: string]: boolean } = {}; // Lưu trạng thái mở rộng của từng section
  isLoading = false;
  error = '';
  
  constructor(
    private courseService: CourseService,
    private router: Router
  ) {
    super();
  }
  
  ngOnInit(): void {
    if (this.courseId) {
      this.loadSyllabus();
    }
  }
  
  ngOnChanges(changes: SimpleChanges): void {
    if (changes.courseId && !changes.courseId.firstChange && this.courseId) {
      this.loadSyllabus();
    }
  }
  
  /**
   * Tải nội dung chương trình học của khóa học
   * Load the course syllabus content
   */
  loadSyllabus(): void {
    this.isLoading = true;
    this.error = '';
    
    this.courseService.getCourseSyllabus(this.courseId)
      .pipe(takeUntil(this._onDestroySub))
      .subscribe({
        next: (syllabus) => {
          this.syllabus = syllabus;
          
          // Mở rộng section đầu tiên mặc định
          if (syllabus.sections.length > 0) {
            this.expandedSections[syllabus.sections[0].id] = true;
          }
          
          this.isLoading = false;
        },
        error: (err) => {
          console.error('Error loading course syllabus:', err);
          this.error = 'Không thể tải chương trình học. Vui lòng thử lại sau.';
          this.isLoading = false;
        }
      });
  }
  
  /**
   * Chuyển đổi trạng thái đóng/mở của một section
   * Toggle the expanded state of a section
   */
  toggleSection(sectionId: string): void {
    this.expandedSections[sectionId] = !this.expandedSections[sectionId];
  }
  
  /**
   * Kiểm tra xem một section có đang được mở rộng không
   * Check if a section is expanded
   */
  isSectionExpanded(sectionId: string): boolean {
    return !!this.expandedSections[sectionId];
  }
  
  /**
   * Tính tổng thời gian (phút) của một section
   * Calculate the total duration (minutes) of a section
   */
  calculateSectionDuration(section: CourseSection): number {
    return section.lessons.reduce((total, lesson) => total + (lesson.duration || 0), 0);
  }
  
  /**
   * Chuyển đổi phút thành định dạng giờ:phút
   * Convert minutes to hours:minutes format
   */
  formatDuration(minutes: number): string {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    
    if (hours > 0) {
      return `${hours}h ${mins > 0 ? mins + 'm' : ''}`;
    }
    
    return `${mins}m`;
  }
  
  /**
   * Điều hướng đến bài học được chọn
   * Navigate to the selected lesson
   */
  goToLesson(section: CourseSection, lesson: Lesson): void {
    if (lesson.status === 'locked') {
      return;
    }
    
    this.router.navigate(['/courses', this.courseId, 'lessons', lesson.id]);
  }
  
  /**
   * Lấy icon phù hợp với loại bài học
   * Get the appropriate icon for the lesson type
   */
  getLessonTypeIcon(lessonType: string): string {
    switch (lessonType) {
      case 'video': return 'play-circle';
      case 'reading': return 'book-open';
      case 'quiz': return 'help-circle';
      case 'assignment': return 'clipboard';
      case 'discussion': return 'message-circle';
      default: return 'file-text';
    }
  }
  
  /**
   * Lấy màu biểu thị trạng thái của bài học
   * Get the color representing the lesson status
   */
  getLessonStatusColor(status: string): string {
    switch (status) {
      case 'completed': return 'text-green-500';
      case 'available': return 'text-blue-500';
      case 'locked': return 'text-gray-400';
      default: return 'text-gray-500';
    }
  }
}
