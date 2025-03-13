// File path: src/app/features/dashboard/dashboard.component.ts
import { Component, OnInit } from '@angular/core';
import { BaseComponent } from '@app/shared/components/base/base-component';
import { CourseService } from '@app/shared/services/course.service';
import { UserService } from '@app/shared/services/user.service';
import { NotificationService } from '@app/shared/services/notification.service';
import { Course } from '@app/shared/models/course.model';
import { User } from '@app/shared/models/user.model';
import { takeUntil } from 'rxjs';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html'
})
export class DashboardComponent extends BaseComponent implements OnInit {
  // User data
  currentUser: User | null = null;
  
  // Course data
  enrolledCourses: Course[] = [];
  recommendedCourses: Course[] = [];
  popularCourses: Course[] = [];
  
  // Dashboard state
  isLoading: boolean = true;
  hasError: boolean = false;
  errorMessage: string = '';
  
  // Stats
  totalLearningHours: number = 0;
  completedLessons: number = 0;
  streakDays: number = 0;
  nextDeadline: Date | null = null;
  
  constructor(
    private courseService: CourseService,
    private userService: UserService,
    private notificationService: NotificationService
  ) {
    super();
  }

  ngOnInit(): void {
    this.loadUserData();
    this.loadEnrolledCourses();
    this.loadRecommendedCourses();
    this.loadLearningStats();
  }

  private loadUserData(): void {
    this.userService.getUserProfile()
      .pipe(takeUntil(this._onDestroySub))
      .subscribe({
        next: (user) => {
          this.currentUser = user;
        },
        error: (error) => {
          console.error('Error loading user data:', error);
          this.handleError('Failed to load user data');
        }
      });
  }

  private loadEnrolledCourses(): void {
    this.courseService.getEnrolledCourses()
      .pipe(takeUntil(this._onDestroySub))
      .subscribe({
        next: (courses) => {
          this.enrolledCourses = courses.slice(0, 3); // Show top 3 courses
          this.isLoading = false;
        },
        error: (error) => {
          console.error('Error loading enrolled courses:', error);
          this.handleError('Failed to load your courses');
          this.isLoading = false;
        }
      });
  }

  private loadRecommendedCourses(): void {
    // In a real application, this would call a recommendation API
    this.courseService.getCourses({ limit: 4 })
      .pipe(takeUntil(this._onDestroySub))
      .subscribe({
        next: (response) => {
          this.recommendedCourses = response.courses.slice(0, 4);
        },
        error: (error) => {
          console.error('Error loading recommended courses:', error);
        }
      });
  }

  private loadLearningStats(): void {
    this.userService.getLearningStats()
      .pipe(takeUntil(this._onDestroySub))
      .subscribe({
        next: (stats) => {
          this.totalLearningHours = stats.totalHours;
          this.completedLessons = stats.completedLessons;
          this.streakDays = stats.currentStreak;
          this.nextDeadline = stats.nextDeadline;
        },
        error: (error) => {
          console.error('Error loading learning stats:', error);
        }
      });
  }

  private handleError(message: string): void {
    this.hasError = true;
    this.errorMessage = message;
    
    // Show error notification
    this.notificationService.error(message);
  }

  /**
   * Calculate the progress percentage for a course
   */
  getCourseProgress(course: Course): number {
    if (!course.progress) return 0;
    return Math.round(course.progress);
  }

  /**
   * Format date for deadline display
   */
  formatDeadline(date: Date | null): string {
    if (!date) return 'No upcoming deadlines';
    
    const now = new Date();
    const diffTime = Math.abs(date.getTime() - now.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return 'Due today';
    if (diffDays === 1) return 'Due tomorrow';
    return `Due in ${diffDays} days`;
  }
}