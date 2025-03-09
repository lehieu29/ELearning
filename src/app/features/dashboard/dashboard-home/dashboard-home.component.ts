/* src/app/features/dashboard/dashboard-home/dashboard-home.component.ts */
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '@app/shared/services/auth.service';

@Component({
  selector: 'app-dashboard-home',
  standalone: false,
  templateUrl: './dashboard-home.component.html',
  styleUrls: ['./dashboard-home.component.scss']
})
export class DashboardHomeComponent implements OnInit {
  userFullName: string = 'Student';
  enrolledCourses = [];
  recommendedCourses = [];
  isLoading = true;

  constructor(
    private authService: AuthService,
    private router: Router
  ) { }

  ngOnInit(): void {
    // Load user data
    const userData = this.authService.getUserData();
    if (userData && userData.fullName) {
      this.userFullName = userData.fullName;
    }

    // Simulate API calls with setTimeout
    setTimeout(() => {
      this.loadEnrolledCourses();
      this.loadRecommendedCourses();
      this.isLoading = false;
    }, 1000);
  }

  loadEnrolledCourses(): void {
    // This would typically be an API call to fetch the user's enrolled courses
    this.enrolledCourses = [
      {
        id: 'nd101',
        title: 'AI Programming with Python',
        thumbnail: 'assets/images/courses/ai-python.jpg',
        progress: 45,
        nextLesson: 'Introduction to NumPy',
        estimatedTimeToComplete: '1 hour',
        lastAccessed: new Date(new Date().setDate(new Date().getDate() - 2))
      },
      {
        id: 'nd201',
        title: 'Data Scientist Nanodegree',
        thumbnail: 'assets/images/courses/data-science.jpg',
        progress: 25,
        nextLesson: 'SQL for Data Analysis',
        estimatedTimeToComplete: '2.5 hours',
        lastAccessed: new Date(new Date().setDate(new Date().getDate() - 7))
      }
    ];
  }

  loadRecommendedCourses(): void {
    // This would typically be an API call to fetch personalized recommendations
    this.recommendedCourses = [
      {
        id: 'nd110',
        title: 'Machine Learning Engineer Nanodegree',
        thumbnail: 'assets/images/courses/ml-engineer.jpg',
        level: 'Intermediate',
        duration: '4 Months',
        price: 399
      },
      {
        id: 'nd120',
        title: 'Deep Learning Nanodegree',
        thumbnail: 'assets/images/courses/deep-learning.jpg',
        level: 'Advanced',
        duration: '4 Months',
        price: 399
      },
      {
        id: 'nd130',
        title: 'Full Stack Web Developer',
        thumbnail: 'assets/images/courses/web-developer.jpg',
        level: 'Intermediate',
        duration: '4 Months',
        price: 399
      }
    ];
  }

  continueLastCourse(): void {
    if (this.enrolledCourses.length > 0) {
      const latestCourse = this.enrolledCourses[0];
      this.router.navigate(['/learning', latestCourse.id]);
    }
  }

  viewAllCourses(): void {
    this.router.navigate(['/dashboard/enrolled-courses']);
  }

  exploreRecommendations(): void {
    this.router.navigate(['/courses/catalog']);
  }
}