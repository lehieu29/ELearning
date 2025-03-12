// src/app/features/dashboard/dashboard.component.ts
import { Component, OnInit } from '@angular/core';
import { BaseComponent } from '@app/shared/components/base/base-component';
import { CourseService } from '@app/shared/services/course.service';
import { Course } from '@app/shared/models/course.model';
import { takeUntil } from 'rxjs';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html'
})
export class DashboardComponent extends BaseComponent implements OnInit {
  enrolledCourses: Course[] = [];
  recommendedCourses: Course[] = [];
  isLoading = true;
  
  constructor(private courseService: CourseService) {
    super();
  }

  ngOnInit(): void {
    this.loadEnrolledCourses();
    this.loadRecommendedCourses();
  }

  private loadEnrolledCourses(): void {
    this.courseService.getEnrolledCourses().pipe(takeUntil(this._onDestroySub)).subscribe({
      next: (courses) => {
        this.enrolledCourses = courses;
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading enrolled courses:', error);
        this.isLoading = false;
      }
    });
  }

  private loadRecommendedCourses(): void {
    // In a real application, this would call a recommendation API
    this.courseService.getCourses({ limit: 4 }).pipe(takeUntil(this._onDestroySub)).subscribe({
      next: (response) => {
        this.recommendedCourses = response.courses;
      },
      error: (error) => {
        console.error('Error loading recommended courses:', error);
      }
    });
  }
}