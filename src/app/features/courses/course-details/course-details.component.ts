// src/app/features/course/course-details/course-details.component.ts
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { BaseComponent } from '@app/shared/components/base/base-component';
import { CourseService } from '@app/shared/services/course.service';
import { Course } from '@app/shared/models/course.model';
import { takeUntil } from 'rxjs';

@Component({
  selector: 'app-course-details',
  templateUrl: './course-details.component.html'
})
export class CourseDetailsComponent extends BaseComponent implements OnInit {
  courseId: string;
  course: Course | null = null;
  isLoading = true;
  error: string = '';
  overallProgress: number = 0;
  
  constructor(
    private route: ActivatedRoute,
    private courseService: CourseService
  ) {
    super();
  }

  ngOnInit(): void {
    this.route.parent.paramMap
      .pipe(takeUntil(this._onDestroySub))
      .subscribe(params => {
        this.courseId = params.get('courseId');
        if (this.courseId) {
          this.loadCourseDetails();
          this.loadCourseProgress();
        }
      });
  }

  private loadCourseDetails(): void {
    this.isLoading = true;
    
    this.courseService.getCourseById(this.courseId)
      .pipe(takeUntil(this._onDestroySub))
      .subscribe({
        next: (course) => {
          this.course = course;
          this.isLoading = false;
        },
        error: (err) => {
          console.error('Error loading course details:', err);
          this.error = 'Failed to load course details. Please try again.';
          this.isLoading = false;
        }
      });
  }

  private loadCourseProgress(): void {
    this.courseService.getCourseProgress(this.courseId)
      .pipe(takeUntil(this._onDestroySub))
      .subscribe({
        next: (progress) => {
          this.overallProgress = progress;
        },
        error: (err) => {
          console.error('Error loading course progress:', err);
        }
      });
  }
}