import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { BaseComponent } from '@app/shared/components/base/base-component';
import { CourseService } from '@app/shared/services/course.service';
import { Course } from '@app/shared/models/course.model';
import { takeUntil } from 'rxjs/operators';

@Component({
  selector: 'app-course',
  templateUrl: './course.component.html'
})
export class CourseComponent extends BaseComponent implements OnInit {
  courseId: string;
  course: Course;
  isLoading = true;
  error: string = '';
  activeSection: string = 'overview';
  
  navItems = [
    { id: 'overview', label: 'Overview', icon: 'info-circle', route: '' },
    { id: 'syllabus', label: 'Syllabus', icon: 'list', route: 'syllabus' },
    { id: 'resources', label: 'Resources', icon: 'file', route: 'resources' },
    { id: 'discussions', label: 'Discussions', icon: 'message-circle', route: 'discussions' },
    { id: 'notes', label: 'Notes', icon: 'edit-3', route: 'notes' },
    { id: 'assignments', label: 'Assignments', icon: 'clipboard', route: 'assignments' },
    { id: 'quizzes', label: 'Quizzes', icon: 'check-circle', route: 'quizzes' },
    { id: 'bookmarks', label: 'Bookmarks', icon: 'bookmark', route: 'bookmarks' },
    { id: 'feedback', label: 'Feedback', icon: 'star', route: 'feedback' }
  ];
  
  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private courseService: CourseService
  ) {
    super();
  }
  
  /**
   * Khởi tạo component, đăng ký lắng nghe thay đổi params và load dữ liệu khóa học
   * Initialize component, subscribe to route params and load course data
   */
  ngOnInit(): void {
    this.route.paramMap
      .pipe(takeUntil(this._onDestroySub))
      .subscribe(params => {
        this.courseId = params.get('courseId');
        if (this.courseId) {
          this.loadCourseData();
        }
      });

    // Theo dõi tuyến đường con cho các thay đổi phần
    // Monitor the child route for section changes
    this.route.firstChild?.url
      .pipe(takeUntil(this._onDestroySub))
      .subscribe(urlSegments => {
        const section = urlSegments[0]?.path;
        if (section) {
          this.activeSection = section;
        } else {
          this.activeSection = 'overview';
        }
      });
  }

  /**
   * Tải dữ liệu khóa học từ API
   * Load course data from API
   */
  loadCourseData(): void {
    this.isLoading = true;
    this.error = '';
    
    this.courseService.getCourseById(this.courseId)
      .pipe(takeUntil(this._onDestroySub))
      .subscribe({
        next: (course) => {
          this.course = course;
          this.isLoading = false;
        },
        error: (err) => {
          console.error('Lỗi khi tải dữ liệu khóa học:', err);
          this.error = 'Không thể tải thông tin khóa học. Vui lòng thử lại sau.';
          this.isLoading = false;
        }
      });
  }

  /**
   * Chuyển hướng đến phần được chọn của khóa học
   * Navigate to the selected section of the course
   * @param route Tuyến đường của phần được chọn
   */
  navigateToSection(route: string): void {
    this.router.navigate(['/courses', this.courseId, route]);
  }

  /**
   * Kiểm tra xem một phần có đang hoạt động hay không
   * Check if a section is currently active
   * @param sectionId ID của phần cần kiểm tra
   * @returns true nếu phần đang hoạt động
   */
  isSectionActive(sectionId: string): boolean {
    return this.activeSection === sectionId;
  }
}
