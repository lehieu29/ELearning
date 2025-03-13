// File path: src/app/features/dashboard/recommendation-engine/recommendation-engine.component.ts
import { Component, OnInit } from '@angular/core';
import { BaseComponent } from '@app/shared/components/base/base-component';
import { CourseService } from '@app/shared/services/course.service';
import { HttpService } from '@app/shared/services/http.service';
import { Course } from '@app/shared/models/course.model';
import { ApiResponse } from '@app/shared/models/api.model';
import { takeUntil } from 'rxjs';

export interface RecommendedCourse extends Course {
  reason?: string;
  matchScore?: number;
}

@Component({
  selector: 'app-recommendation-engine',
  templateUrl: './recommendation-engine.component.html'
})
export class RecommendationEngineComponent extends BaseComponent implements OnInit {
  recommendedCourses: any = [];
  filteredCourses: RecommendedCourse[] = [];

  isLoading: boolean = true;
  error: string = '';

  activeFilter: 'all' | 'category' | 'popular' | 'career' | 'skill' = 'all';

  filters = [
    { label: 'All', value: 'all' },
    { label: 'By Category', value: 'category' },
    { label: 'Popular', value: 'popular' },
    { label: 'Career', value: 'career' },
    { label: 'Skills', value: 'skill' }
  ];

  constructor(
    private courseService: CourseService,
    private http: HttpService
  ) {
    super();
  }

  ngOnInit(): void {
    this.loadRecommendations();
  }

  loadRecommendations(): void {
    this.isLoading = true;
    this.error = '';

    this.http.get<ApiResponse<RecommendedCourse[]>>('user/recommendations')
      .pipe(takeUntil(this._onDestroySub))
      .subscribe({
        next: (response) => {
          if (response.data) {
            this.recommendedCourses = response.data;
          } else {
            // For demo purposes
            this.generateSampleRecommendations();
          }

          this.filteredCourses = this.recommendedCourses;
          this.isLoading = false;
        },
        error: (err) => {
          console.error('Error loading recommendations:', err);
          // For demo purposes
          this.generateSampleRecommendations();
          this.filteredCourses = this.recommendedCourses;
          this.isLoading = false;
        }
      });
  }

  filterRecommendations(filter: 'all' | 'category' | 'popular' | 'career' | 'skill'): void {
    this.activeFilter = filter;

    if (filter === 'all') {
      this.filteredCourses = this.recommendedCourses;
      return;
    }

    // Apply filter based on the reason field
    this.filteredCourses = this.recommendedCourses.filter(course => {
      switch (filter) {
        case 'category':
          return course.reason?.includes('category') || course.reason?.includes('interest');
        case 'popular':
          return course.reason?.includes('popular') || course.reason?.includes('trending');
        case 'career':
          return course.reason?.includes('career') || course.reason?.includes('job');
        case 'skill':
          return course.reason?.includes('skill') || course.reason?.includes('path');
        default:
          return true;
      }
    });
  }

  // For demo purposes
  private generateSampleRecommendations(): void {
    // First, try to get some courses from the course service
    this.courseService.getCourses({ limit: 5 })
      .pipe(takeUntil(this._onDestroySub))
      .subscribe({
        next: (response) => {
          if (response.courses && response.courses.length > 0) {
            this.recommendedCourses = response.courses.map((course, index) => {
              return {
                ...course,
                reason: this.getReasonByIndex(index),
                matchScore: Math.floor(Math.random() * 30) + 70 // 70-100%
              };
            });
          } else {
            this.createMockRecommendations();
          }
        },
        error: () => {
          this.createMockRecommendations();
        }
      });
  }

  private createMockRecommendations(): void {
    // Create mock recommendations if we couldn't get any from the service
    this.recommendedCourses = [
      {
        id: 'course1',
        title: 'Advanced JavaScript Patterns',
        subtitle: 'Master Modern JavaScript Design Patterns',
        description: 'Learn advanced JavaScript patterns and techniques to write better, more maintainable code.',
        thumbnail: 'assets/images/courses/javascript.jpg',
        level: 'advanced',
        category: 'Web Development',
        tags: ['JavaScript', 'Frontend', 'Programming'],
        duration: 1200, // in minutes
        price: 49.99,
        rating: 4.8,
        reviewsCount: 128,
        studentsCount: 3450,
        language: 'English',
        instructors: [
          {
            id: 'instructor1',
            fullName: 'John Doe',
            avatar: 'assets/images/avatars/instructor1.jpg',
            bio: 'Senior JavaScript Developer with 10+ years of experience',
            expertise: ['JavaScript', 'React', 'Node.js'],
            rating: 4.9,
            coursesCount: 5,
            studentsCount: 12000,
            socialLinks: {
              website: 'https://johndoe.com',
              github: 'https://github.com/johndoe',
              linkedin: 'https://linkedin.com/in/johndoe'
            }
          }
        ],
        createdAt: new Date(2023, 1, 15),
        updatedAt: new Date(2023, 5, 20),
        status: 'published',
        featured: true,
        requirements: ['Intermediate JavaScript knowledge', 'Basic HTML and CSS'],
        outcomes: ['Master advanced JavaScript patterns', 'Build scalable web applications', 'Optimize code performance'],
        syllabus: {
          sections: [],
          totalLessons: 42,
          totalDuration: 1200
        },
        reason: 'Based on your interest in Web Development',
        matchScore: 95
      },
      {
        id: 'course2',
        title: 'Machine Learning Fundamentals',
        subtitle: 'Build a Strong Foundation in ML',
        description: 'Start your machine learning journey with this comprehensive course covering all the essentials.',
        thumbnail: 'assets/images/courses/ml.jpg',
        level: 'beginner',
        category: 'Data Science',
        tags: ['Machine Learning', 'Python', 'Data Science'],
        duration: 1800, // in minutes
        price: 59.99,
        rating: 4.7,
        reviewsCount: 98,
        studentsCount: 2150,
        language: 'English',
        instructors: [
          {
            id: 'instructor2',
            fullName: 'Jane Smith',
            avatar: 'assets/images/avatars/instructor2.jpg',
            bio: 'ML Engineer and Data Scientist with 8+ years of experience',
            expertise: ['Python', 'Machine Learning', 'Data Science'],
            rating: 4.8,
            coursesCount: 3,
            studentsCount: 8500,
            socialLinks: {
              website: 'https://janesmith.com',
              github: 'https://github.com/janesmith',
              linkedin: 'https://linkedin.com/in/janesmith'
            }
          }
        ],
        createdAt: new Date(2023, 2, 20),
        updatedAt: new Date(2023, 6, 15),
        status: 'published',
        featured: true,
        requirements: ['Basic Python knowledge', 'High school math'],
        outcomes: ['Understand ML fundamentals', 'Build your first ML models', 'Prepare for advanced ML topics'],
        syllabus: {
          sections: [],
          totalLessons: 36,
          totalDuration: 1800
        },
        reason: 'Popular among Data Science enthusiasts',
        matchScore: 85
      },
      {
        id: 'course3',
        title: 'AWS Cloud Practitioner Certification',
        subtitle: 'Complete Guide to AWS Certification',
        description: 'Prepare for and pass the AWS Cloud Practitioner exam with this comprehensive course.',
        thumbnail: 'assets/images/courses/aws.jpg',
        level: 'beginner',
        category: 'Cloud Computing',
        tags: ['AWS', 'Cloud', 'Certification'],
        duration: 900, // in minutes
        price: 39.99,
        rating: 4.9,
        reviewsCount: 156,
        studentsCount: 4200,
        language: 'English',
        instructors: [
          {
            id: 'instructor3',
            fullName: 'Michael Johnson',
            avatar: 'assets/images/avatars/instructor3.jpg',
            bio: 'AWS Certified Solutions Architect and Trainer',
            expertise: ['AWS', 'Cloud Architecture', 'DevOps'],
            rating: 4.9,
            coursesCount: 7,
            studentsCount: 15000,
            socialLinks: {
              website: 'https://michaeljohnson.com',
              github: 'https://github.com/michaeljohnson',
              linkedin: 'https://linkedin.com/in/michaeljohnson'
            }
          }
        ],
        createdAt: new Date(2023, 3, 10),
        updatedAt: new Date(2023, 7, 5),
        status: 'published',
        featured: false,
        requirements: ['No prior AWS experience required', 'Basic IT knowledge recommended'],
        outcomes: ['Pass the AWS Certified Cloud Practitioner exam', 'Understand AWS core services', 'Build a foundation for advanced AWS certifications'],
        syllabus: {
          sections: [],
          totalLessons: 28,
          totalDuration: 900
        },
        reason: 'Recommended for career advancement in IT',
        matchScore: 78
      },
      {
        id: 'course4',
        title: 'UI/UX Design Principles',
        subtitle: 'Create User-Centered Digital Experiences',
        description: 'Learn the fundamentals of UI/UX design to create beautiful, functional, and user-friendly interfaces.',
        thumbnail: 'assets/images/courses/uiux.jpg',
        level: 'intermediate',
        category: 'Design',
        tags: ['UI/UX', 'Design', 'User Experience'],
        duration: 1500, // in minutes
        price: 54.99,
        rating: 4.6,
        reviewsCount: 112,
        studentsCount: 2800,
        language: 'English',
        instructors: [
          {
            id: 'instructor4',
            fullName: 'Sarah Williams',
            avatar: 'assets/images/avatars/instructor4.jpg',
            bio: 'UI/UX Designer with experience at top tech companies',
            expertise: ['UI Design', 'UX Research', 'Figma', 'Adobe XD'],
            rating: 4.7,
            coursesCount: 4,
            studentsCount: 9500,
            socialLinks: {
              website: 'https://sarahwilliams.com',
              dribbble: 'https://dribbble.com/sarahwilliams',
              linkedin: 'https://linkedin.com/in/sarahwilliams'
            }
          }
        ],
        createdAt: new Date(2023, 4, 5),
        updatedAt: new Date(2023, 8, 12),
        status: 'published',
        featured: true,
        requirements: ['Basic design knowledge', 'No coding experience required'],
        outcomes: ['Create user-centered designs', 'Build professional UI/UX portfolios', 'Conduct effective user research'],
        syllabus: {
          sections: [],
          totalLessons: 32,
          totalDuration: 1500
        },
        reason: 'Complements your Web Development skills',
        matchScore: 88
      }
    ];
  }

  private getReasonByIndex(index: number): string {
    const reasons = [
      'Based on your recent course activity',
      'Popular among students with similar interests',
      'Recommended for career advancement',
      'Complements your existing skills',
      'Part of your learning path'
    ];

    return reasons[index % reasons.length];
  }

  getMatchScoreClass(score: number | undefined): string {
    if (!score) return 'bg-gray-100 text-gray-800';

    if (score >= 90) {
      return 'bg-green-100 text-green-800';
    } else if (score >= 80) {
      return 'bg-blue-100 text-blue-800';
    } else if (score >= 70) {
      return 'bg-yellow-100 text-yellow-800';
    } else {
      return 'bg-gray-100 text-gray-800';
    }
  }
}