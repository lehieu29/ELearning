// File path: src/app/features/dashboard/learning-path-visualization/learning-path-visualization.component.ts
import { Component, Input, OnInit } from '@angular/core';
import { BaseComponent } from '@app/shared/components/base/base-component';
import { CourseService } from '@app/shared/services/course.service';
import { Course } from '@app/shared/models/course.model';
import { takeUntil } from 'rxjs';

interface LearningPathNode {
  id: string;
  title: string;
  status: 'completed' | 'in-progress' | 'locked' | 'available';
  type: 'course' | 'module' | 'certificate';
  progress?: number;
  children?: LearningPathNode[];
  completedAt?: Date | string;
}

@Component({
  selector: 'app-learning-path-visualization',
  templateUrl: './learning-path-visualization.component.html'
})
export class LearningPathVisualizationComponent extends BaseComponent implements OnInit {
  @Input() pathId: string;
  @Input() userId: string;

  learningPath: LearningPathNode[] = [];
  isLoading: boolean = true;
  error: string = '';
  enrolledCourses: Course[] = [];

  constructor(private courseService: CourseService) {
    super();
  }

  ngOnInit(): void {
    this.loadEnrolledCourses();
    // In a real application, we would load the learning path data from a dedicated service
    // For now, we'll mock up some sample data based on enrolled courses
  }

  private loadEnrolledCourses(): void {
    this.isLoading = true;

    this.courseService.getEnrolledCourses()
      .pipe(takeUntil(this._onDestroySub))
      .subscribe({
        next: (courses) => {
          this.enrolledCourses = courses;
          this.generateLearningPath();
          this.isLoading = false;
        },
        error: (err) => {
          this.error = 'Unable to load enrolled courses';
          this.isLoading = false;
        }
      });
  }

  private generateLearningPath(): void {
    // Sort courses by enrollment date (assuming it exists in the data)
    const sortedCourses = [...this.enrolledCourses].sort((a, b) => {
      return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
    });

    // Group courses by category to create paths
    const coursesByCategory = {};

    sortedCourses.forEach(course => {
      if (!coursesByCategory[course.category]) {
        coursesByCategory[course.category] = [];
      }

      // For each course, check if we have progress data and determine status
      let status: 'completed' | 'in-progress' | 'locked' | 'available' = 'available';
      let progress = 0;

      // In a real app, we would get actual progress for each course
      // Here we'll assign random progress for demonstration
      progress = Math.floor(Math.random() * 100);

      if (progress === 100) {
        status = 'completed';
      } else if (progress > 0) {
        status = 'in-progress';
      }

      coursesByCategory[course.category].push({
        id: course.id,
        title: course.title,
        status: status,
        type: 'course',
        progress: progress
      });
    });

    // Convert the grouped courses into learning paths
    Object.keys(coursesByCategory).forEach(category => {
      this.learningPath.push({
        id: `path-${category}`,
        title: category,
        type: 'module',
        status: 'available',
        children: coursesByCategory[category]
      });
    });

    // Add a certificate node at the end if any path is completed
    const hasCompletedPath = this.learningPath.some(path =>
      path.children && path.children.every(child => child.status === 'completed')
    );

    if (hasCompletedPath) {
      this.learningPath.push({
        id: 'certificate-node',
        title: 'Program Certificate',
        type: 'certificate',
        status: 'available'
      });
    }
  }

  getStatusColor(status: string): string {
    switch (status) {
      case 'completed':
        return 'bg-green-500';
      case 'in-progress':
        return 'bg-blue-500';
      case 'available':
        return 'bg-gray-300';
      case 'locked':
        return 'bg-gray-200';
      default:
        return 'bg-gray-300';
    }
  }
}