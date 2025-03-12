// File path: src/app/features/dashboard/progress-tracker/progress-tracker.component.ts
import { Component, Input, OnInit } from '@angular/core';
import { BaseComponent } from '@app/shared/components/base/base-component';
import { CourseService } from '@app/shared/services/course.service';
import { Course } from '@app/shared/models/course.model';
import { CourseProgress } from '@app/shared/models/course.model';
import { takeUntil } from 'rxjs';

@Component({
  selector: 'app-progress-tracker',
  templateUrl: './progress-tracker.component.html'
})
export class ProgressTrackerComponent extends BaseComponent implements OnInit {
  @Input() courseId: string;
  @Input() showDetails: boolean = true;
  
  course: Course;
  progress: CourseProgress;
  isLoading: boolean = true;
  error: string = '';
  
  constructor(private courseService: CourseService) {
    super();
  }
  
  ngOnInit(): void {
    if (this.courseId) {
      this.loadCourseAndProgress();
    }
  }
  
  private loadCourseAndProgress(): void {
    this.isLoading = true;
    
    // Load course details
    this.courseService.getCourseById(this.courseId)
      .pipe(takeUntil(this._onDestroySub))
      .subscribe({
        next: (course) => {
          this.course = course;
          this.loadProgress();
        },
        error: (err) => {
          this.error = 'Unable to load course details';
          this.isLoading = false;
        }
      });
  }
  
  private loadProgress(): void {
    this.courseService.getCourseProgress(this.courseId)
      .pipe(takeUntil(this._onDestroySub))
      .subscribe({
        next: (progress) => {
          this.progress = progress;
          this.isLoading = false;
        },
        error: (err) => {
          this.error = 'Unable to load course progress';
          this.isLoading = false;
        }
      });
  }
  
  getProgressPercentage(): number {
    if (!this.progress) return 0;
    return this.progress.progress;
  }
  
  getCompletedLessonsCount(): number {
    if (!this.progress) return 0;
    return this.progress.completedLessons.length;
  }
  
  getTotalLessonsCount(): number {
    if (!this.course) return 0;
    return this.course.syllabus.totalLessons;
  }
}