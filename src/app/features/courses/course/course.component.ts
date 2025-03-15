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
  
  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private courseService: CourseService
  ) {
    super();
  }
  
  ngOnInit(): void {
    this.route.paramMap
      .pipe(takeUntil(this._onDestroySub))
      .subscribe(params => {
        // Lấy courseId từ URL và tải thông tin khóa học
        this.courseId = params.get('courseId');
        this.loadCourseData();
        
        // Kiểm tra phần hiện tại từ URL
        this.route.url.pipe(takeUntil(this._onDestroySub)).subscribe(segments => {
          const lastSegment = segments[segments.length - 1]?.path;
          if (lastSegment && lastSegment !== this.courseId) {
            this.activeSection = lastSegment;
          } else {
            this.activeSection = 'overview';
          }
        });
      });
  }
  
  /**
   * Tải dữ liệu khóa học từ API
   * Loads course data from the API
   */
  loadCourseData(): void {
    this.isLoading = true;
    this.error = '';
    
    this.courseService.getCourseById(this.courseId)
      .pipe(takeUntil(this._onDestroySub))
      .subscribe({
        next: (response) => {
          this.course = response;
          this.isLoading = false;
        },
        error: (err) => {
          console.error('Error loading course data:', err);
          this.error = 'Không thể tải thông tin khóa học. Vui lòng thử lại sau.';
          this.isLoading = false;
        }
      });
  }
  
  /**
   * Điều hướng đến phần khác của khóa học
   * Navigates to different sections of the course
   */
  navigateTo(section: string): void {
    this.activeSection = section;
    this.router.navigate(['/courses', this.courseId, section]);
  }
  
  /**
   * Kiểm tra xem phần nào đang được hiển thị
   * Checks which section is currently active
   */
  isSectionActive(section: string): boolean {
    return this.activeSection === section;
  }
}
