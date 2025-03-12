// File path: src/app/features/dashboard/activity-feed/activity-feed.component.ts
import { Component, Input, OnInit } from '@angular/core';
import { BaseComponent } from '@app/shared/components/base/base-component';
import { takeUntil } from 'rxjs';
import { HttpService } from '@app/shared/services/http.service';
import { ApiResponse } from '@app/shared/models/api.model';

export interface ActivityItem {
  id: string;
  type: 'course_enrollment' | 'lesson_completion' | 'quiz_completion' | 'certificate_earned' | 'discussion_posted' | 'achievement_unlocked';
  title: string;
  description?: string;
  timestamp: Date | string;
  icon?: string;
  actionUrl?: string;
  metadata?: any;
}

@Component({
  selector: 'app-activity-feed',
  templateUrl: './activity-feed.component.html'
})
export class ActivityFeedComponent extends BaseComponent implements OnInit {
  @Input() limit: number = 5;
  @Input() showLoadMore: boolean = true;

  activities: ActivityItem[] = [];
  isLoading: boolean = true;
  error: string = '';
  page: number = 1;
  hasMore: boolean = false;

  constructor(private http: HttpService) {
    super();
  }

  ngOnInit(): void {
    this.loadActivities();
  }

  loadActivities(reset: boolean = false): void {
    if (reset) {
      this.page = 1;
      this.activities = [];
    }

    this.isLoading = true;

    this.http.get<ApiResponse<{ activities: ActivityItem[], hasMore: boolean }>>(
      `user/activities?page=${this.page}&limit=${this.limit}`
    ).pipe(
      takeUntil(this._onDestroySub)
    ).subscribe({
      next: (response) => {
        if (response.data) {
          // Append new activities to existing list
          this.activities = [...this.activities, ...response.data.activities];
          this.hasMore = response.data.hasMore;
        }
        this.isLoading = false;
      },
      error: (err) => {
        this.error = 'Unable to load activities';
        this.isLoading = false;
      }
    });
  }

  loadMore(): void {
    if (this.hasMore && !this.isLoading) {
      this.page++;
      this.loadActivities();
    }
  }

  getActivityIcon(type: string): string {
    switch (type) {
      case 'course_enrollment':
        return 'fas fa-book-open text-blue-500';
      case 'lesson_completion':
        return 'fas fa-check-circle text-green-500';
      case 'quiz_completion':
        return 'fas fa-medal text-yellow-500';
      case 'certificate_earned':
        return 'fas fa-certificate text-purple-500';
      case 'discussion_posted':
        return 'fas fa-comment-dots text-indigo-500';
      case 'achievement_unlocked':
        return 'fas fa-trophy text-orange-500';
      default:
        return 'fas fa-bell text-gray-500';
    }
  }

  // For demo purposes, let's create some sample activities if none are returned from the API
  private generateSampleActivities(): ActivityItem[] {
    return [
      {
        id: '1',
        type: 'course_enrollment',
        title: 'Enrolled in Web Development Bootcamp',
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2), // 2 hours ago
        actionUrl: '/courses/web-dev'
      },
      {
        id: '2',
        type: 'lesson_completion',
        title: 'Completed HTML Basics',
        description: 'Web Development Bootcamp',
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 1), // 1 hour ago
        actionUrl: '/courses/web-dev/lessons/html-basics'
      },
      {
        id: '3',
        type: 'quiz_completion',
        title: 'Passed CSS Fundamentals Quiz',
        description: 'Score: 95%',
        timestamp: new Date(Date.now() - 1000 * 60 * 30), // 30 minutes ago
        actionUrl: '/courses/web-dev/quizzes/css-fundamentals'
      }
    ];
  }
}