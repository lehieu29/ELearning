import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { BaseComponent } from '@app/shared/components/base/base-component';
import { CourseService } from '@app/shared/services/course.service';
import { Course } from '@app/shared/models/course.model';
import { takeUntil } from 'rxjs';

@Component({
  selector: 'app-course',
  templateUrl: './course.component.html'
})
export class CourseComponent extends BaseComponent implements OnInit {
  courseId: string;
  course: Course | null = null;
  isLoading = true;
  error: string = '';
  
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
        this.courseId = params.get('courseId');
        if (this.courseId) {
          this.loadCourseData();
        } else {
          this.error = 'No course ID provided';
          this.isLoading = false;
        }
      });
  }

  private loadCourseData(): void {
    this.isLoading = true;
    
    this.courseService.getCourseById(this.courseId)
      .pipe(takeUntil(this._onDestroySub))
      .subscribe({
        next: (course) => {
          this.course = course;
          this.isLoading = false;
        },
        error: (err) => {
          console.error('Error loading course:', err);
          this.error = 'Failed to load course details. Please try again.';
          this.isLoading = false;
        }
      });
  }
}
