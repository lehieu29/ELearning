// File path: src/app/features/dashboard/learning-streaks/learning-streaks.component.ts
import { Component, OnInit } from '@angular/core';
import { BaseComponent } from '@app/shared/components/base/base-component';
import { HttpService } from '@app/shared/services/http.service';
import { takeUntil } from 'rxjs';

export interface LearningDay {
  date: Date;
  minutesLearned: number;
  completed: boolean;
}

export interface WeekSummary {
  weekStart: Date;
  weekEnd: Date;
  daysActive: number;
  totalMinutes: number;
  averageMinutesPerDay: number;
}

@Component({
  selector: 'app-learning-streaks',
  templateUrl: './learning-streaks.component.html'
})
export class LearningStreaksComponent extends BaseComponent implements OnInit {
  isLoading: boolean = true;
  error: string = '';

  // Streak data
  currentStreak: number = 0;
  longestStreak: number = 0;
  totalDaysLearned: number = 0;

  // Calendar data
  calendarDays: LearningDay[] = [];
  weekSummaries: WeekSummary[] = [];
  selectedDate: Date = new Date();
  dayNames: string[] = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  monthNames: string[] = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  // Time period
  timePeriod: 'week' | 'month' | 'year' = 'month';

  constructor(private http: HttpService) {
    super();
  }

  ngOnInit(): void {
    this.loadStreakData();
  }

  loadStreakData(): void {
    this.isLoading = true;

    this.http.get<{
      data: {
        currentStreak: number,
        longestStreak: number,
        totalDaysLearned: number,
        learningDays: {
          date: string,
          minutesLearned: number
        }[]
      }
    }>('user/learning-streaks')
      .pipe(takeUntil(this._onDestroySub))
      .subscribe({
        next: (response) => {
          if (response.data) {
            this.currentStreak = response.data.currentStreak;
            this.longestStreak = response.data.longestStreak;
            this.totalDaysLearned = response.data.totalDaysLearned;

            // Transform string dates to Date objects and map to LearningDay objects
            this.calendarDays = response.data.learningDays.map(day => ({
              date: new Date(day.date),
              minutesLearned: day.minutesLearned,
              completed: day.minutesLearned > 0
            }));
          } else {
            // For demo purposes
            this.generateSampleData();
          }

          this.generateCalendarData();
          this.isLoading = false;
        },
        error: (err) => {
          console.error('Error loading streak data:', err);
          // For demo purposes
          this.generateSampleData();
          this.generateCalendarData();
          this.isLoading = false;
        }
      });
  }

  changeTimePeriod(period: 'week' | 'month' | 'year'): void {
    this.timePeriod = period;
    this.generateCalendarData();
  }

  generateCalendarData(): void {
    // Reset week summaries
    this.weekSummaries = [];

    // Calculate the start and end dates based on the selected time period
    const today = new Date();
    let startDate: Date;
    let endDate: Date = new Date(today);

    switch (this.timePeriod) {
      case 'week':
        startDate = new Date(today);
        startDate.setDate(today.getDate() - 6); // Last 7 days
        break;
      case 'month':
        startDate = new Date(today);
        startDate.setDate(today.getDate() - 29); // Last 30 days
        break;
      case 'year':
        startDate = new Date(today);
        startDate.setDate(today.getDate() - 364); // Last 365 days
        break;
    }

    // Filter calendar days to the selected period
    const filteredDays = this.calendarDays.filter(day =>
      day.date >= startDate && day.date <= endDate
    );

    // Group days by week for weekly summaries
    const weekMap = new Map<string, LearningDay[]>();

    filteredDays.forEach(day => {
      const weekStart = new Date(day.date);
      weekStart.setDate(day.date.getDate() - day.date.getDay()); // Sunday as week start

      const weekKey = weekStart.toISOString().split('T')[0];

      if (!weekMap.has(weekKey)) {
        weekMap.set(weekKey, []);
      }

      weekMap.get(weekKey)?.push(day);
    });

    // Generate week summaries
    weekMap.forEach((days, weekStartStr) => {
      const weekStart = new Date(weekStartStr);
      const weekEnd = new Date(weekStart);
      weekEnd.setDate(weekStart.getDate() + 6);

      const daysActive = days.filter(day => day.completed).length;
      const totalMinutes = days.reduce((sum, day) => sum + day.minutesLearned, 0);

      this.weekSummaries.push({
        weekStart,
        weekEnd,
        daysActive,
        totalMinutes,
        averageMinutesPerDay: daysActive > 0 ? Math.round(totalMinutes / daysActive) : 0
      });
    });

    // Sort week summaries by date (oldest first)
    this.weekSummaries.sort((a, b) => a.weekStart.getTime() - b.weekStart.getTime());
  }

  getStreakColor(streak: number): string {
    if (streak >= 30) return 'bg-green-500';
    if (streak >= 14) return 'bg-blue-500';
    if (streak >= 7) return 'bg-indigo-500';
    if (streak >= 3) return 'bg-purple-500';
    return 'bg-gray-500';
  }

  formatMinutes(minutes: number): string {
    if (minutes < 60) {
      return `${minutes}m`;
    }

    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;

    if (remainingMinutes === 0) {
      return `${hours}h`;
    }

    return `${hours}h ${remainingMinutes}m`;
  }

  formatWeekRange(weekStart: Date, weekEnd: Date): string {
    const startMonth = weekStart.getMonth();
    const endMonth = weekEnd.getMonth();

    const startFormat = `${weekStart.getDate()}`;
    const endFormat = `${weekEnd.getDate()} ${this.monthNames[endMonth]}`;

    return startMonth === endMonth
      ? `${startFormat} - ${endFormat}`
      : `${startFormat} ${this.monthNames[startMonth]} - ${endFormat}`;
  }

  getActivityColorClass(minutes: number): string {
    if (minutes === 0) return 'bg-gray-200';
    if (minutes < 15) return 'bg-green-200';
    if (minutes < 30) return 'bg-green-300';
    if (minutes < 60) return 'bg-green-400';
    return 'bg-green-500';
  }

  getActivityTooltip(day: LearningDay): string {
    const dateStr = day.date.toLocaleDateString();

    if (day.minutesLearned === 0) {
      return `${dateStr}: No learning activity`;
    }

    return `${dateStr}: ${this.formatMinutes(day.minutesLearned)} of learning`;
  }

  // For demo purposes
  private generateSampleData(): void {
    this.currentStreak = 5;
    this.longestStreak = 14;
    this.totalDaysLearned = 47;

    const today = new Date();
    this.calendarDays = [];

    // Generate last 365 days of data
    for (let i = 0; i < 365; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() - i);

      // Simulate learning pattern (more activity on weekends)
      let minutesLearned = 0;

      // Current streak days
      if (i < this.currentStreak) {
        minutesLearned = Math.floor(Math.random() * 60) + 30; // 30-90 minutes
      }
      // Weekend days have higher probability of learning
      else if (date.getDay() === 0 || date.getDay() === 6) {
        minutesLearned = Math.random() < 0.7 ? Math.floor(Math.random() * 120) + 15 : 0; // 15-135 minutes or 0
      }
      // Weekdays have lower probability of learning
      else {
        minutesLearned = Math.random() < 0.4 ? Math.floor(Math.random() * 60) + 15 : 0; // 15-75 minutes or 0
      }

      this.calendarDays.push({
        date,
        minutesLearned,
        completed: minutesLearned > 0
      });
    }
  }
}