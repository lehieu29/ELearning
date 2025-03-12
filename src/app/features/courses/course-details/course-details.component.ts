// src/app/features/course/course-details/course-details.component.ts
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { BaseComponent } from '@app/shared/components/base/base-component';
import { CourseService } from '@app/shared/services/course.service';
import { Course } from '@app/shared/models/course.model';
import { CourseProgress } from '@app/shared/models/course.model';
import { ToastService } from '@app/shared/services/toast.service';
import { takeUntil } from 'rxjs';

@Component({
  selector: 'app-course-details',
  templateUrl: './course-details.component.html'
})
export class CourseDetailsComponent extends BaseComponent implements OnInit {
  courseId: string;
  course: Course;
  courseProgress: CourseProgress;
  isLoading = true;
  isEnrolled = false;
  isEnrolling = false;
  activeTab = 'overview';

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private courseService: CourseService,
    private toastService: ToastService
  ) {
    super();
  }

  ngOnInit(): void {
    this.courseId = this.route.snapshot.paramMap.get('id');
    this.loadCourseDetails();
    this.checkEnrollmentStatus();
  }

  private loadCourseDetails(): void {
    this.isLoading = true;
    this.courseService.getCourseById(this.courseId).pipe(takeUntil(this._onDestroySub)).subscribe({
      next: (course) => {
        this.course = course;
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading course details:', error);
        this.isLoading = false;
        this.toastService.error('Failed to load course details. Please try again later.');
      }
    });
  }

  private checkEnrollmentStatus(): void {
    this.courseService.checkEnrollment(this.courseId).pipe(takeUntil(this._onDestroySub)).subscribe({
      next: (isEnrolled) => {
        this.isEnrolled = isEnrolled;
        if (isEnrolled) {
          this.loadCourseProgress();
        }
      },
      error: (error) => {
        console.error('Error checking enrollment status:', error);
      }
    });
  }

  private loadCourseProgress(): void {
    this.courseService.getCourseProgress(this.courseId).pipe(takeUntil(this._onDestroySub)).subscribe({
      next: (progress) => {
        this.courseProgress = progress;
      },
      error: (error) => {
        console.error('Error loading course progress:', error);
      }
    });
  }

  enrollInCourse(): void {
    this.isEnrolling = true;
    this.courseService.enrollInCourse(this.courseId).pipe(takeUntil(this._onDestroySub)).subscribe({
      next: (success) => {
        this.isEnrolling = false;
        if (success) {
          this.isEnrolled = true;
          this.toastService.success('Successfully enrolled in course!');
          this.loadCourseProgress();
        } else {
          this.toastService.error('Failed to enroll in course. Please try again.');
        }
      },
      error: (error) => {
        this.isEnrolling = false;
        console.error('Error enrolling in course:', error);
        this.toastService.error('Failed to enroll in course. Please try again later.');
      }
    });
  }

  startCourse(): void {
    // If user has progress, navigate to the last accessed lesson
    if (this.courseProgress && this.courseProgress.lastAccessedLessonId) {
      this.router.navigate(['/courses', this.courseId, 'lessons', this.courseProgress.lastAccessedLessonId]);
    } else {
      // Navigate to the first lesson in the first section
      const firstSection = this.course.syllabus.sections[0];
      if (firstSection && firstSection.lessons.length > 0) {
        this.router.navigate(['/courses', this.courseId, 'lessons', firstSection.lessons[0].id]);
      }
    }
  }

  setActiveTab(tab: string): void {
    this.activeTab = tab;
  }
}