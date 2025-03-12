// File path: src/app/features/dashboard/deadlines-calendar/deadlines-calendar.component.ts
import { Component, OnInit } from '@angular/core';
import { BaseComponent } from '@app/shared/components/base/base-component';
import { HttpService } from '@app/shared/services/http.service';
import { ApiResponse } from '@app/shared/models/api.model';
import { takeUntil } from 'rxjs';

export interface DeadlineItem {
  id: string;
  title: string;
  dueDate: Date | string;
  courseId: string;
  courseName: string;
  type: 'assignment' | 'quiz' | 'project' | 'exam' | 'other';
  priority: 'high' | 'medium' | 'low';
  completed: boolean;
  url: string;
}

@Component({
  selector: 'app-deadlines-calendar',
  templateUrl: './deadlines-calendar.component.html'
})
export class DeadlinesCalendarComponent extends BaseComponent implements OnInit {
  deadlines: DeadlineItem[] = [];
  upcomingDeadlines: DeadlineItem[] = [];
  selectedMonth: Date = new Date();
  calendarDays: (Date | null)[] = [];
  calendarDeadlines: {[key: string]: DeadlineItem[]} = {};
  
  isLoading: boolean = true;
  error: string = '';
  
  monthNames: string[] = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];
  
  dayNames: string[] = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  
  constructor(private http: HttpService) {
    super();
  }
  
  ngOnInit(): void {
    this.loadDeadlines();
    this.generateCalendarDays();
  }
  
  loadDeadlines(): void {
    this.isLoading = true;
    
    this.http.get<ApiResponse<DeadlineItem[]>>('user/deadlines')
      .pipe(takeUntil(this._onDestroySub))
      .subscribe({
        next: (response) => {
          if (response.data) {
            this.deadlines = response.data.map(deadline => ({
              ...deadline,
              dueDate: new Date(deadline.dueDate)
            }));
          } else {
            // For demo purposes
            this.deadlines = this.generateSampleDeadlines();
          }
          
          this.processDeadlines();
          this.isLoading = false;
        },
        error: (err) => {
          console.error('Error loading deadlines:', err);
          // For demo purposes
          this.deadlines = this.generateSampleDeadlines();
          this.processDeadlines();
          this.isLoading = false;
        }
      });
  }
  
  processDeadlines(): void {
    // Format upcoming deadlines (next 7 days)
    const now = new Date();
    const weekFromNow = new Date();
    weekFromNow.setDate(now.getDate() + 7);
    
    this.upcomingDeadlines = this.deadlines
      .filter(deadline => {
        const dueDate = new Date(deadline.dueDate);
        return !deadline.completed && dueDate >= now && dueDate <= weekFromNow;
      })
      .sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime());
    
    // Group deadlines by calendar date
    this.groupDeadlinesByDate();
  }
  
  groupDeadlinesByDate(): void {
    this.calendarDeadlines = {};
    
    this.deadlines.forEach(deadline => {
      const dateKey = this.formatDateKey(new Date(deadline.dueDate));
      
      if (!this.calendarDeadlines[dateKey]) {
        this.calendarDeadlines[dateKey] = [];
      }
      
      this.calendarDeadlines[dateKey].push(deadline);
    });
  }
  
  formatDateKey(date: Date): string {
    return `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}`;
  }
  
  generateCalendarDays(): void {
    const year = this.selectedMonth.getFullYear();
    const month = this.selectedMonth.getMonth();
    
    // Get first day of month and last day of month
    const firstDayOfMonth = new Date(year, month, 1);
    const lastDayOfMonth = new Date(year, month + 1, 0);
    
    // Calculate days to show from previous month
    const firstDayOfWeek = firstDayOfMonth.getDay(); // 0 = Sunday, 1 = Monday, etc.
    
    // Initialize calendar days array
    this.calendarDays = [];
    
    // Add days from previous month
    for (let i = 0; i < firstDayOfWeek; i++) {
      this.calendarDays.push(null);
    }
    
    // Add days from current month
    for (let day = 1; day <= lastDayOfMonth.getDate(); day++) {
      this.calendarDays.push(new Date(year, month, day));
    }
    
    // Add days from next month to complete the calendar grid
    const remainingDays = 42 - this.calendarDays.length; // 6 rows * 7 columns = 42 cells
    for (let i = 0; i < remainingDays; i++) {
      this.calendarDays.push(null);
    }
  }
  
  previousMonth(): void {
    this.selectedMonth = new Date(this.selectedMonth.getFullYear(), this.selectedMonth.getMonth() - 1, 1);
    this.generateCalendarDays();
  }
  
  nextMonth(): void {
    this.selectedMonth = new Date(this.selectedMonth.getFullYear(), this.selectedMonth.getMonth() + 1, 1);
    this.generateCalendarDays();
  }
  
  getDeadlinesForDay(day: Date | null): DeadlineItem[] {
    if (!day) return [];
    
    const dateKey = this.formatDateKey(day);
    return this.calendarDeadlines[dateKey] || [];
  }
  
  hasDeadlines(day: Date | null): boolean {
    return this.getDeadlinesForDay(day).length > 0;
  }
  
  isToday(day: Date | null): boolean {
    if (!day) return false;
    
    const today = new Date();
    return day.getDate() === today.getDate() && 
           day.getMonth() === today.getMonth() && 
           day.getFullYear() === today.getFullYear();
  }
  
  getPriorityClass(priority: string): string {
    switch (priority) {
      case 'high':
        return 'bg-red-500';
      case 'medium':
        return 'bg-yellow-500';
      case 'low':
        return 'bg-blue-500';
      default:
        return 'bg-gray-500';
    }
  }
  
  // For demo purposes
  private generateSampleDeadlines(): DeadlineItem[] {
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);
    
    const nextWeek = new Date(today);
    nextWeek.setDate(today.getDate() + 7);
    
    const nextMonth = new Date(today);
    nextMonth.setMonth(today.getMonth() + 1);
    
    return [
      {
        id: '1',
        title: 'Web Development Project',
        dueDate: tomorrow,
        courseId: 'course1',
        courseName: 'Web Development Bootcamp',
        type: 'project',
        priority: 'high',
        completed: false,
        url: '/courses/course1/assignments/1'
      },
      {
        id: '2',
        title: 'Data Structures Quiz',
        dueDate: new Date(today.getFullYear(), today.getMonth(), today.getDate() + 3),
        courseId: 'course2',
        courseName: 'Algorithms & Data Structures',
        type: 'quiz',
        priority: 'medium',
        completed: false,
        url: '/courses/course2/quizzes/1'
      },
      {
        id: '3',
        title: 'Python Final Project',
        dueDate: nextWeek,
        courseId: 'course3',
        courseName: 'Python for Data Science',
        type: 'project',
        priority: 'high',
        completed: false,
        url: '/courses/course3/assignments/2'
      },
      {
        id: '4',
        title: 'JavaScript Mid-term Exam',
        dueDate: new Date(today.getFullYear(), today.getMonth(), today.getDate() + 5),
        courseId: 'course1',
        courseName: 'Web Development Bootcamp',
        type: 'exam',
        priority: 'high',
        completed: false,
        url: '/courses/course1/exams/1'
      },
      {
        id: '5',
        title: 'Database Design Assignment',
        dueDate: nextMonth,
        courseId: 'course4',
        courseName: 'Database Systems',
        type: 'assignment',
        priority: 'low',
        completed: false,
        url: '/courses/course4/assignments/3'
      }
    ];
  }
}