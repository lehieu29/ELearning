/* src/app/features/dashboard/enrolled-courses/enrolled-courses.component.ts */
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-enrolled-courses',
  standalone: false,
  templateUrl: './enrolled-courses.component.html',
  styleUrls: ['./enrolled-courses.component.scss']
})
export class EnrolledCoursesComponent implements OnInit {
  enrolledCourses = [];
  archivedCourses = [];
  isLoading = true;
  activeTab: 'current' | 'archived' = 'current';
  sortOption = 'recent';
  
  constructor(private router: Router) { }
  
  ngOnInit(): void {
    // Simulate API call
    setTimeout(() => {
      this.loadEnrolledCourses();
      this.loadArchivedCourses();
      this.isLoading = false;
    }, 1000);
  }
  
  loadEnrolledCourses(): void {
    // This would typically be an API call
    this.enrolledCourses = [
      {
        id: 'nd101',
        title: 'AI Programming with Python',
        thumbnail: 'assets/images/courses/ai-python.jpg',
        progress: 45,
        nextLesson: 'Introduction to NumPy',
        estimatedTimeToComplete: '1 hour',
        lastAccessed: new Date(new Date().setDate(new Date().getDate() - 2)),
        instructor: 'John Smith',
        category: 'Artificial Intelligence'
      },
      {
        id: 'nd201',
        title: 'Data Scientist Nanodegree',
        thumbnail: 'assets/images/courses/data-science.jpg',
        progress: 25,
        nextLesson: 'SQL for Data Analysis',
        estimatedTimeToComplete: '2.5 hours',
        lastAccessed: new Date(new Date().setDate(new Date().getDate() - 7)),
        instructor: 'Jane Doe',
        category: 'Data Science'
      },
      {
        id: 'nd301',
        title: 'Full Stack Web Developer',
        thumbnail: 'assets/images/courses/web-developer.jpg',
        progress: 65,
        nextLesson: 'Building REST APIs with Express',
        estimatedTimeToComplete: '1.5 hours',
        lastAccessed: new Date(new Date().setDate(new Date().getDate() - 1)),
        instructor: 'Michael Johnson',
        category: 'Web Development'
      }
    ];
  }
  
  loadArchivedCourses(): void {
    // This would typically be an API call
    this.archivedCourses = [
      {
        id: 'nd401',
        title: 'Intro to Programming Nanodegree',
        thumbnail: 'assets/images/courses/intro-programming.jpg',
        progress: 100,
        completedDate: new Date(new Date().setMonth(new Date().getMonth() - 3)),
        category: 'Programming'
      },
      {
        id: 'nd501',
        title: 'Digital Marketing Nanodegree',
        thumbnail: 'assets/images/courses/digital-marketing.jpg',
        progress: 85,
        completedDate: new Date(new Date().setMonth(new Date().getMonth() - 6)),
        category: 'Marketing'
      }
    ];
  }
  
  setActiveTab(tab: 'current' | 'archived'): void {
    this.activeTab = tab;
  }
  
  setSortOption(option: string): void {
    this.sortOption = option;
    this.sortCourses();
  }
  
  sortCourses(): void {
    switch (this.sortOption) {
      case 'recent':
        this.enrolledCourses.sort((a, b) => b.lastAccessed.getTime() - a.lastAccessed.getTime());
        break;
      case 'progress':
        this.enrolledCourses.sort((a, b) => b.progress - a.progress);
        break;
      case 'title':
        this.enrolledCourses.sort((a, b) => a.title.localeCompare(b.title));
        break;
    }
  }
  
  continueCourse(courseId: string): void {
    this.router.navigate(['/learning', courseId]);
  }
  
  exploreCourses(): void {
    this.router.navigate(['/courses/catalog']);
  }
}