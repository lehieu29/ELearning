// File path: src/app/features/dashboard/achievements/achievements.component.ts
import { Component, OnInit } from '@angular/core';
import { BaseComponent } from '@app/shared/components/base/base-component';
import { HttpService } from '@app/shared/services/http.service';
import { ApiResponse } from '@app/shared/models/api.model';
import { takeUntil } from 'rxjs';

export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  earnedDate?: Date | string;
  progress?: number;
  maxProgress?: number;
  category: 'course' | 'quiz' | 'engagement' | 'streak' | 'milestone';
  isUnlocked: boolean;
  badgeImageUrl?: string;
}

@Component({
  selector: 'app-achievements',
  templateUrl: './achievements.component.html'
})
export class AchievementsComponent extends BaseComponent implements OnInit {
  achievements: Achievement[] = [];
  unlockedAchievements: Achievement[] = [];
  inProgressAchievements: Achievement[] = [];
  lockedAchievements: Achievement[] = [];
  isLoading: boolean = true;
  error: string = '';
  activeFilter: 'all' | 'unlocked' | 'in-progress' | 'locked' = 'all';

  constructor(private http: HttpService) {
    super();
  }

  ngOnInit(): void {
    this.loadAchievements();
  }

  loadAchievements(): void {
    this.isLoading = true;

    this.http.get<ApiResponse<Achievement[]>>('user/achievements')
      .pipe(takeUntil(this._onDestroySub))
      .subscribe({
        next: (response) => {
          if (response.data) {
            this.achievements = response.data;
            this.categorizeAchievements();
          } else {
            // For demo, generate some sample achievements
            this.achievements = this.generateSampleAchievements();
            this.categorizeAchievements();
          }
          this.isLoading = false;
        },
        error: (err) => {
          console.error('Error loading achievements:', err);
          // For demo, generate some sample achievements
          this.achievements = this.generateSampleAchievements();
          this.categorizeAchievements();
          this.isLoading = false;
        }
      });
  }

  categorizeAchievements(): void {
    this.unlockedAchievements = this.achievements.filter(a => a.isUnlocked);
    this.inProgressAchievements = this.achievements.filter(a => !a.isUnlocked && a.progress && a.progress > 0);
    this.lockedAchievements = this.achievements.filter(a => !a.isUnlocked && (!a.progress || a.progress === 0));
  }

  filterAchievements(filter: 'all' | 'unlocked' | 'in-progress' | 'locked'): void {
    this.activeFilter = filter;
  }

  getFilteredAchievements(): Achievement[] {
    switch (this.activeFilter) {
      case 'unlocked':
        return this.unlockedAchievements;
      case 'in-progress':
        return this.inProgressAchievements;
      case 'locked':
        return this.lockedAchievements;
      default:
        return this.achievements;
    }
  }

  getAchievementIcon(achievement: Achievement): string {
    if (achievement.badgeImageUrl) {
      return achievement.badgeImageUrl;
    }

    // Default icons based on category
    switch (achievement.category) {
      case 'course':
        return 'fas fa-graduation-cap';
      case 'quiz':
        return 'fas fa-award';
      case 'engagement':
        return 'fas fa-comments';
      case 'streak':
        return 'fas fa-fire';
      case 'milestone':
        return 'fas fa-trophy';
      default:
        return 'fas fa-medal';
    }
  }

  getAchievementClass(achievement: Achievement): string {
    if (achievement.isUnlocked) {
      return 'bg-green-100 text-green-800 border-green-200';
    } else if (achievement.progress && achievement.progress > 0) {
      return 'bg-blue-100 text-blue-800 border-blue-200';
    } else {
      return 'bg-gray-100 text-gray-500 border-gray-200';
    }
  }

  // For demo purposes
  private generateSampleAchievements(): Achievement[] {
    return [
      {
        id: '1',
        title: 'First Course Completed',
        description: 'Complete your first course',
        icon: 'fas fa-graduation-cap',
        category: 'milestone',
        isUnlocked: true,
        earnedDate: new Date(Date.now() - 1000 * 60 * 60 * 24 * 7) // 7 days ago
      },
      {
        id: '2',
        title: 'Perfect Score',
        description: 'Score 100% on any quiz',
        icon: 'fas fa-award',
        category: 'quiz',
        isUnlocked: true,
        earnedDate: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3) // 3 days ago
      },
      {
        id: '3',
        title: 'Discussion Starter',
        description: 'Start 5 discussions',
        icon: 'fas fa-comments',
        category: 'engagement',
        isUnlocked: false,
        progress: 3,
        maxProgress: 5
      },
      {
        id: '4',
        title: '7-Day Streak',
        description: 'Learn for 7 consecutive days',
        icon: 'fas fa-fire',
        category: 'streak',
        isUnlocked: false,
        progress: 5,
        maxProgress: 7
      },
      {
        id: '5',
        title: 'Course Creator',
        description: 'Create your first course',
        icon: 'fas fa-chalkboard-teacher',
        category: 'course',
        isUnlocked: false,
        progress: 0,
        maxProgress: 1
      }
    ];
  }
}