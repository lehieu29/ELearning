// File path: src/app/features/dashboard/course-completion-stats/course-completion-stats.component.ts
import { Component, OnInit } from '@angular/core';
import { BaseComponent } from '@app/shared/components/base/base-component';
import { CourseService } from '@app/shared/services/course.service';
import { takeUntil } from 'rxjs';
import { Course } from '@app/shared/models/course.model';

interface CompletionStats {
  totalCourses: number;
  completedCourses: number;
  inProgressCourses: number;
  notStartedCourses: number;
  averageProgress: number;
  totalLearningHours: number;
}

@Component({
  selector: 'app-course-completion-stats',
  templateUrl: './course-completion-stats.component.html'
})
export class CourseCompletionStatsComponent extends BaseComponent implements OnInit {
  stats: CompletionStats = {
    totalCourses: 0,
    completedCourses: 0,
    inProgressCourses: 0,
    notStartedCourses: 0,
    averageProgress: 0,
    totalLearningHours: 0
  };

  enrolledCourses: Course[] = [];
  courseProgresses: { [courseId: string]: number } = {};
  isLoading: boolean = true;
  error: string = '';

  constructor(private courseService: CourseService) {
    super();
  }

  ngOnInit(): void {
    this.loadEnrolledCourses();
  }

  private loadEnrolledCourses(): void {
    this.isLoading = true;

    this.courseService.getEnrolledCourses()
      .pipe(takeUntil(this._onDestroySub))
      .subscribe({
        next: (courses) => {
          this.enrolledCourses = courses;
          this.loadCourseProgresses();
        },
        error: (err) => {
          console.error('Error loading enrolled courses:', err);
          this.error = 'Unable to load course data';
          this.isLoading = false;
        }
      });
  }

  private loadCourseProgresses(): void {
    // Initialize counter for tracking loaded progresses
    let loadedCount = 0;

    if (this.enrolledCourses.length === 0) {
      this.calculateStats();
      this.isLoading = false;
      return;
    }

    // Load progress for each enrolled course
    this.enrolledCourses.forEach(course => {
      this.courseService.getCourseProgress(course.id)
        .pipe(takeUntil(this._onDestroySub))
        .subscribe({
          next: (progress) => {
            this.courseProgresses[course.id] = progress.progress;

            // Check if all progresses have been loaded
            loadedCount++;
            if (loadedCount === this.enrolledCourses.length) {
              this.calculateStats();
              this.isLoading = false;
            }
          },
          error: (err) => {
            console.error(`Error loading progress for course ${course.id}:`, err);

            // Even if there's an error, increment counter to ensure we eventually finish loading
            loadedCount++;
            if (loadedCount === this.enrolledCourses.length) {
              this.calculateStats();
              this.isLoading = false;
            }
          }
        });
    });
  }

  private calculateStats(): void {
    // Reset stats
    this.stats = {
      totalCourses: this.enrolledCourses.length,
      completedCourses: 0,
      inProgressCourses: 0,
      notStartedCourses: 0,
      averageProgress: 0,
      totalLearningHours: 0
    };

    // Calculate total learning hours from course durations (minutes to hours)
    this.stats.totalLearningHours = this.enrolledCourses.reduce((total, course) => {
      return total + (course.duration / 60);
    }, 0);

    // Calculate completion stats
    let totalProgress = 0;

    Object.entries(this.courseProgresses).forEach(([courseId, progress]) => {
      if (progress === 100) {
        this.stats.completedCourses++;
      } else if (progress > 0) {
        this.stats.inProgressCourses++;
      } else {
        this.stats.notStartedCourses++;
      }

      totalProgress += progress;
    });

    // Calculate average progress
    this.stats.averageProgress = this.stats.totalCourses > 0
      ? Math.round(totalProgress / this.stats.totalCourses)
      : 0;
  }

  getCompletionPercentage(): number {
    return this.stats.totalCourses > 0
      ? Math.round((this.stats.completedCourses / this.stats.totalCourses) * 100)
      : 0;
  }
}