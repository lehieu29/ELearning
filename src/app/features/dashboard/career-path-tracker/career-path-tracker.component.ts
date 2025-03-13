// File path: src/app/features/dashboard/career-path-tracker/career-path-tracker.component.ts
import { Component, OnInit } from '@angular/core';
import { BaseComponent } from '@app/shared/components/base/base-component';
import { HttpService } from '@app/shared/services/http.service';
import { takeUntil } from 'rxjs';

export interface CareerPath {
  id: string;
  title: string;
  description: string;
  estimatedTimeToComplete: string;
  medianSalary: string;
  demandLevel: 'low' | 'medium' | 'high' | 'very-high';
  progress: number;
  requiredSkills: CareerSkill[];
  matchScore: number;
  imageUrl?: string;
}

export interface CareerSkill {
  id: string;
  name: string;
  requiredProficiency: number;
  currentProficiency: number;
  courses: {
    id: string;
    title: string;
    enrolled: boolean;
    completed: boolean;
  }[];
}

@Component({
  selector: 'app-career-path-tracker',
  templateUrl: './career-path-tracker.component.html'
})
export class CareerPathTrackerComponent extends BaseComponent implements OnInit {
  careerPaths: CareerPath[] = [];
  filteredPaths: CareerPath[] = [];
  selectedPath: CareerPath | null = null;
  isLoading: boolean = true;
  error: string = '';

  // Filter options
  searchQuery: string = '';
  filterBy: 'all' | 'recommended' | 'in-progress' | 'highest-match' = 'all';

  constructor(private http: HttpService) {
    super();
  }

  ngOnInit(): void {
    this.loadCareerPaths();
  }

  loadCareerPaths(): void {
    this.isLoading = true;

    this.http.get<{ data: CareerPath[] }>('user/career-paths')
      .pipe(takeUntil(this._onDestroySub))
      .subscribe({
        next: (response) => {
          if (response.data) {
            this.careerPaths = response.data;
          } else {
            // For demo purposes
            this.generateSampleData();
          }

          this.filterPaths();
          this.isLoading = false;
        },
        error: (err) => {
          console.error('Error loading career paths:', err);
          // For demo purposes
          this.generateSampleData();
          this.filterPaths();
          this.isLoading = false;
        }
      });
  }

  filterPaths(): void {
    let filtered = [...this.careerPaths];

    // Apply search filter
    if (this.searchQuery) {
      const query = this.searchQuery.toLowerCase();
      filtered = filtered.filter(path =>
        path.title.toLowerCase().includes(query) ||
        path.description.toLowerCase().includes(query)
      );
    }

    // Apply category filter
    switch (this.filterBy) {
      case 'recommended':
        filtered = filtered.filter(path => path.matchScore >= 70);
        break;
      case 'in-progress':
        filtered = filtered.filter(path => path.progress > 0 && path.progress < 100);
        break;
      case 'highest-match':
        filtered = [...filtered].sort((a, b) => b.matchScore - a.matchScore);
        break;
    }

    this.filteredPaths = filtered;

    // Select the first path if none is selected
    if (!this.selectedPath && this.filteredPaths.length > 0) {
      this.selectPath(this.filteredPaths[0]);
    }
  }

  selectPath(path: CareerPath): void {
    this.selectedPath = path;
  }

  onSearch(query: string): void {
    this.searchQuery = query;
    this.filterPaths();
  }

  onFilterChange(filter: 'all' | 'recommended' | 'in-progress' | 'highest-match'): void {
    this.filterBy = filter;
    this.filterPaths();
  }

  getDemandBadgeClass(demand: string): string {
    switch (demand) {
      case 'very-high':
        return 'bg-green-100 text-green-800';
      case 'high':
        return 'bg-blue-100 text-blue-800';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800';
      case 'low':
        return 'bg-gray-100 text-gray-600';
      default:
        return 'bg-gray-100 text-gray-600';
    }
  }

  getMatchScoreClass(score: number): string {
    if (score >= 90) return 'text-green-600';
    if (score >= 70) return 'text-blue-600';
    if (score >= 50) return 'text-yellow-600';
    return 'text-gray-600';
  }

  getNextRecommendedCourse(): { id: string, title: string } | null {
    if (!this.selectedPath) return null;

    // Find the skill with the lowest proficiency
    const lowestSkill = [...this.selectedPath.requiredSkills]
      .sort((a, b) => (a.currentProficiency / a.requiredProficiency) - (b.currentProficiency / b.requiredProficiency))[0];

    if (!lowestSkill) return null;

    // Find the first non-completed course for this skill
    const nextCourse = lowestSkill.courses.find(course => !course.completed);

    if (!nextCourse) return null;

    return { id: nextCourse.id, title: nextCourse.title };
  }

  // For demo purposes
  private generateSampleData(): void {
    this.careerPaths = [
      {
        id: '1',
        title: 'Full Stack Web Developer',
        description: 'Build complete web applications with both frontend and backend expertise.',
        estimatedTimeToComplete: '9-12 months',
        medianSalary: '$105,000',
        demandLevel: 'very-high',
        progress: 45,
        matchScore: 85,
        imageUrl: 'assets/images/career-paths/web-developer.jpg',
        requiredSkills: [
          {
            id: 's1',
            name: 'JavaScript',
            requiredProficiency: 90,
            currentProficiency: 75,
            courses: [
              { id: 'c1', title: 'JavaScript Fundamentals', enrolled: true, completed: true },
              { id: 'c2', title: 'Advanced JavaScript Concepts', enrolled: true, completed: false },
              { id: 'c3', title: 'JavaScript Design Patterns', enrolled: false, completed: false }
            ]
          },
          {
            id: 's2',
            name: 'React',
            requiredProficiency: 85,
            currentProficiency: 60,
            courses: [
              { id: 'c4', title: 'React Basics', enrolled: true, completed: true },
              { id: 'c5', title: 'React Hooks & Context API', enrolled: true, completed: false },
              { id: 'c6', title: 'Redux & State Management', enrolled: false, completed: false }
            ]
          },
          {
            id: 's3',
            name: 'Node.js',
            requiredProficiency: 80,
            currentProficiency: 40,
            courses: [
              { id: 'c7', title: 'Node.js Fundamentals', enrolled: true, completed: false },
              { id: 'c8', title: 'Building RESTful APIs with Express', enrolled: false, completed: false }
            ]
          },
          {
            id: 's4',
            name: 'Databases',
            requiredProficiency: 75,
            currentProficiency: 30,
            courses: [
              { id: 'c9', title: 'SQL Fundamentals', enrolled: true, completed: false },
              { id: 'c10', title: 'MongoDB & NoSQL Databases', enrolled: false, completed: false }
            ]
          }
        ]
      },
      {
        id: '2',
        title: 'Data Scientist',
        description: 'Extract insights and value from data using statistical analysis and machine learning.',
        estimatedTimeToComplete: '12-18 months',
        medianSalary: '$120,000',
        demandLevel: 'high',
        progress: 20,
        matchScore: 65,
        imageUrl: 'assets/images/career-paths/data-scientist.jpg',
        requiredSkills: [
          {
            id: 's5',
            name: 'Python',
            requiredProficiency: 90,
            currentProficiency: 60,
            courses: [
              { id: 'c11', title: 'Python for Data Science', enrolled: true, completed: true },
              { id: 'c12', title: 'Advanced Python Programming', enrolled: true, completed: false }
            ]
          },
          {
            id: 's6',
            name: 'Statistics',
            requiredProficiency: 85,
            currentProficiency: 30,
            courses: [
              { id: 'c13', title: 'Descriptive & Inferential Statistics', enrolled: true, completed: false },
              { id: 'c14', title: 'Statistical Hypothesis Testing', enrolled: false, completed: false }
            ]
          },
          {
            id: 's7',
            name: 'Machine Learning',
            requiredProficiency: 80,
            currentProficiency: 15,
            courses: [
              { id: 'c15', title: 'Introduction to Machine Learning', enrolled: false, completed: false },
              { id: 'c16', title: 'Supervised Learning Algorithms', enrolled: false, completed: false }
            ]
          }
        ]
      },
      {
        id: '3',
        title: 'UX/UI Designer',
        description: 'Design user-centered digital experiences with a focus on usability and aesthetics.',
        estimatedTimeToComplete: '6-9 months',
        medianSalary: '$95,000',
        demandLevel: 'high',
        progress: 0,
        matchScore: 50,
        imageUrl: 'assets/images/career-paths/ux-designer.jpg',
        requiredSkills: [
          {
            id: 's8',
            name: 'User Research',
            requiredProficiency: 85,
            currentProficiency: 25,
            courses: [
              { id: 'c17', title: 'User Research Fundamentals', enrolled: false, completed: false },
              { id: 'c18', title: 'Usability Testing', enrolled: false, completed: false }
            ]
          },
          {
            id: 's9',
            name: 'Visual Design',
            requiredProficiency: 90,
            currentProficiency: 40,
            courses: [
              { id: 'c19', title: 'Color Theory & Typography', enrolled: false, completed: false },
              { id: 'c20', title: 'Design Systems', enrolled: false, completed: false }
            ]
          },
          {
            id: 's10',
            name: 'Wireframing & Prototyping',
            requiredProficiency: 85,
            currentProficiency: 35,
            courses: [
              { id: 'c21', title: 'Sketch & Figma Essentials', enrolled: false, completed: false },
              { id: 'c22', title: 'Interactive Prototyping', enrolled: false, completed: false }
            ]
          }
        ]
      },
      {
        id: '4',
        title: 'DevOps Engineer',
        description: 'Bridge development and operations, focusing on automation, CI/CD, and infrastructure.',
        estimatedTimeToComplete: '9-15 months',
        medianSalary: '$115,000',
        demandLevel: 'very-high',
        progress: 10,
        matchScore: 45,
        imageUrl: 'assets/images/career-paths/devops-engineer.jpg',
        requiredSkills: [
          {
            id: 's11',
            name: 'Linux Administration',
            requiredProficiency: 85,
            currentProficiency: 30,
            courses: [
              { id: 'c23', title: 'Linux Fundamentals', enrolled: true, completed: true },
              { id: 'c24', title: 'Advanced Linux Administration', enrolled: false, completed: false }
            ]
          },
          {
            id: 's12',
            name: 'Cloud Platforms',
            requiredProficiency: 80,
            currentProficiency: 20,
            courses: [
              { id: 'c25', title: 'AWS Essentials', enrolled: true, completed: false },
              { id: 'c26', title: 'Google Cloud Platform Fundamentals', enrolled: false, completed: false }
            ]
          },
          {
            id: 's13',
            name: 'Container Orchestration',
            requiredProficiency: 75,
            currentProficiency: 10,
            courses: [
              { id: 'c27', title: 'Docker & Containerization', enrolled: false, completed: false },
              { id: 'c28', title: 'Kubernetes Basics', enrolled: false, completed: false }
            ]
          }
        ]
      }
    ];
  }
}