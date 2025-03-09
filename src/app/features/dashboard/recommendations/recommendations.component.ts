/* src/app/features/dashboard/recommendations/recommendations.component.ts */
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-recommendations',
  standalone: false,
  templateUrl: './recommendations.component.html',
  styleUrls: ['./recommendations.component.scss']
})
export class RecommendationsComponent implements OnInit {
  recommendedCourses = [];
  isLoading = true;
  selectedCategory = 'all';
  categories = [];

  constructor(private router: Router) { }

  ngOnInit(): void {
    // Simulate API call
    setTimeout(() => {
      this.loadRecommendations();
      this.extractCategories();
      this.isLoading = false;
    }, 1000);
  }

  /* src/app/features/dashboard/recommendations/recommendations.component.ts (continued) */
  loadRecommendations(): void {
    // This would typically be an API call
    this.recommendedCourses = [
      {
        id: 'nd110',
        title: 'Machine Learning Engineer Nanodegree',
        thumbnail: 'assets/images/courses/ml-engineer.jpg',
        level: 'Intermediate',
        duration: '4 Months',
        price: 399,
        description: 'Learn advanced machine learning techniques and algorithms and how to package and deploy your models to a production environment.',
        category: 'Machine Learning',
        rating: 4.8,
        enrollmentCount: 12500
      },
      {
        id: 'nd120',
        title: 'Deep Learning Nanodegree',
        thumbnail: 'assets/images/courses/deep-learning.jpg',
        level: 'Advanced',
        duration: '4 Months',
        price: 399,
        description: 'Learn to implement neural networks with PyTorch, build convolutional networks for image recognition, and recurrent networks for sequence generation.',
        category: 'Machine Learning',
        rating: 4.9,
        enrollmentCount: 9800
      },
      {
        id: 'nd130',
        title: 'Full Stack Web Developer Nanodegree',
        thumbnail: 'assets/images/courses/web-developer.jpg',
        level: 'Intermediate',
        duration: '4 Months',
        price: 399,
        description: 'Build database-backed APIs and web applications with JavaScript, Node, and React.',
        category: 'Web Development',
        rating: 4.7,
        enrollmentCount: 15200
      },
      {
        id: 'nd140',
        title: 'Data Analyst Nanodegree',
        thumbnail: 'assets/images/courses/data-analyst.jpg',
        level: 'Beginner',
        duration: '4 Months',
        price: 399,
        description: 'Learn to use Python, SQL, and statistics to uncover insights, communicate critical findings, and create data-driven solutions.',
        category: 'Data Science',
        rating: 4.6,
        enrollmentCount: 18300
      },
      {
        id: 'nd150',
        title: 'Cloud Developer Nanodegree',
        thumbnail: 'assets/images/courses/cloud-developer.jpg',
        level: 'Intermediate',
        duration: '4 Months',
        price: 399,
        description: 'Learn cloud architecture, deployment, security, containers, and serverless applications with AWS.',
        category: 'Cloud Computing',
        rating: 4.7,
        enrollmentCount: 7600
      },
      {
        id: 'nd160',
        title: 'React Developer Nanodegree',
        thumbnail: 'assets/images/courses/react-developer.jpg',
        level: 'Intermediate',
        duration: '3 Months',
        price: 349,
        description: 'Build declarative user interfaces for the web with React, and manage application state with Redux.',
        category: 'Web Development',
        rating: 4.8,
        enrollmentCount: 11200
      }
    ];
  }

  extractCategories(): void {
    // Extract unique categories
    const uniqueCategories = [...new Set(this.recommendedCourses.map(course => course.category))];
    this.categories = ['all', ...uniqueCategories];
  }

  filterByCategory(category: string): void {
    this.selectedCategory = category;
  }

  getFilteredCourses() {
    if (this.selectedCategory === 'all') {
      return this.recommendedCourses;
    }
    return this.recommendedCourses.filter(course => course.category === this.selectedCategory);
  }

  viewCourseDetails(courseId: string): void {
    this.router.navigate(['/courses', courseId]);
  }
}