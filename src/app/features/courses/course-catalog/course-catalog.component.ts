/* src/app/features/courses/course-catalog/course-catalog.component.ts */
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'app-course-catalog',
  templateUrl: './course-catalog.component.html',
  styleUrls: ['./course-catalog.component.scss']
})
export class CourseCatalogComponent implements OnInit {
  courses = [];
  filteredCourses = [];
  categories = [];
  levels = ['Beginner', 'Intermediate', 'Advanced'];
  durations = ['1-2 Months', '3-4 Months', '5+ Months'];

  // Filter state
  selectedCategory = 'all';
  selectedLevel = 'all';
  selectedDuration = 'all';
  searchQuery = '';

  // Pagination
  currentPage = 1;
  pageSize = 9;
  totalPages = 1;

  isLoading = true;

  constructor(
    private router: Router,
    private route: ActivatedRoute
  ) { }

  ngOnInit(): void {
    // Get filter params from URL if any
    this.route.queryParams.subscribe(params => {
      this.selectedCategory = params['category'] || 'all';
      this.selectedLevel = params['level'] || 'all';
      this.selectedDuration = params['duration'] || 'all';
      this.searchQuery = params['search'] || '';
      this.currentPage = parseInt(params['page']) || 1;

      // Load courses with a delay to simulate API call
      setTimeout(() => {
        this.loadCourses();
        this.extractCategories();
        this.applyFilters();
        this.isLoading = false;
      }, 1000);
    });
  }

  loadCourses(): void {
    // In a real app, this would be an API call
    this.courses = [
      {
        id: 'nd101',
        title: 'AI Programming with Python',
        thumbnail: 'assets/images/courses/ai-python.jpg',
        instructor: 'John Smith',
        level: 'Beginner',
        duration: '3 Months',
        price: 399,
        rating: 4.8,
        enrollmentCount: 12500,
        category: 'Artificial Intelligence',
        description: 'Learn Python, NumPy, pandas, Matplotlib, PyTorch, Calculus, and Linear Algebra—the foundations for building your own neural network.',
        skills: ['Python', 'NumPy', 'PyTorch', 'Neural Networks']
      },
      {
        id: 'nd201',
        title: 'Data Scientist Nanodegree',
        thumbnail: 'assets/images/courses/data-science.jpg',
        instructor: 'Jane Doe',
        level: 'Intermediate',
        duration: '4 Months',
        price: 399,
        rating: 4.9,
        enrollmentCount: 15200,
        category: 'Data Science',
        description: 'Learn data science with Python and SQL. Make predictions using machine learning, create experiments with design, and analyze results.',
        skills: ['Python', 'SQL', 'Machine Learning', 'Data Visualization']
      },
      {
        id: 'nd110',
        title: 'Machine Learning Engineer Nanodegree',
        thumbnail: 'assets/images/courses/ml-engineer.jpg',
        instructor: 'Michael Johnson',
        level: 'Advanced',
        duration: '4 Months',
        price: 399,
        rating: 4.7,
        enrollmentCount: 9800,
        category: 'Machine Learning',
        description: 'Learn advanced machine learning techniques and algorithms and how to package and deploy your models to a production environment.',
        skills: ['Python', 'Deep Learning', 'Deployment', 'Production ML']
      },
      {
        id: 'nd120',
        title: 'Deep Learning Nanodegree',
        thumbnail: 'assets/images/courses/deep-learning.jpg',
        instructor: 'Sarah Williams',
        level: 'Advanced',
        duration: '4 Months',
        price: 399,
        rating: 4.8,
        enrollmentCount: 8700,
        category: 'Machine Learning',
        description: 'Learn to implement neural networks with PyTorch, build convolutional networks for image recognition, and recurrent networks for sequence generation.',
        skills: ['PyTorch', 'CNNs', 'RNNs', 'GANs']
      },
      {
        id: 'nd130',
        title: 'Full Stack Web Developer Nanodegree',
        thumbnail: 'assets/images/courses/web-developer.jpg',
        instructor: 'David Lee',
        level: 'Intermediate',
        duration: '4 Months',
        price: 399,
        rating: 4.6,
        enrollmentCount: 18300,
        category: 'Web Development',
        description: 'Build database-backed APIs and web applications with JavaScript, Node, and React.',
        skills: ['JavaScript', 'Node.js', 'React', 'PostgreSQL']
      },
      {
        id: 'nd140',
        title: 'Data Analyst Nanodegree',
        thumbnail: 'assets/images/courses/data-analyst.jpg',
        instructor: 'Emma Thompson',
        level: 'Beginner',
        duration: '3 Months',
        price: 399,
        rating: 4.5,
        enrollmentCount: 14200,
        category: 'Data Science',
        description: 'Learn to use Python, SQL, and statistics to uncover insights, communicate critical findings, and create data-driven solutions.',
        skills: ['Python', 'SQL', 'Statistics', 'Data Visualization']
      },
      {
        id: 'nd150',
        title: 'Cloud Developer Nanodegree',
        thumbnail: 'assets/images/courses/cloud-developer.jpg',
        instructor: 'Robert Chen',
        level: 'Intermediate',
        duration: '4 Months',
        price: 399,
        rating: 4.7,
        enrollmentCount: 7600,
        category: 'Cloud Computing',
        description: 'Learn cloud architecture, deployment, security, containers, and serverless applications with AWS.',
        skills: ['AWS', 'Kubernetes', 'Microservices', 'Serverless']
      },
      {
        id: 'nd160',
        title: 'React Developer Nanodegree',
        thumbnail: 'assets/images/courses/react-developer.jpg',
        instructor: 'Lisa Wang',
        level: 'Intermediate',
        duration: '3 Months',
        price: 349,
        rating: 4.8,
        enrollmentCount: 11200,
        category: 'Web Development',
        description: 'Build declarative user interfaces for the web with React, and manage application state with Redux.',
        skills: ['React', 'Redux', 'JavaScript', 'Web Development']
      },
      {
        id: 'nd170',
        title: 'Intro to Programming Nanodegree',
        thumbnail: 'assets/images/courses/intro-programming.jpg',
        instructor: 'James Wilson',
        level: 'Beginner',
        duration: '2 Months',
        price: 299,
        rating: 4.9,
        enrollmentCount: 21500,
        category: 'Programming',
        description: 'Learn the basics of programming through HTML, CSS, Python, and JavaScript. Get introduced to the programming mindset.',
        skills: ['Python', 'HTML', 'CSS', 'JavaScript']
      },
      {
        id: 'nd180',
        title: 'Android Developer Nanodegree',
        thumbnail: 'assets/images/courses/android-developer.jpg',
        instructor: 'Maria Garcia',
        level: 'Intermediate',
        duration: '4 Months',
        price: 399,
        rating: 4.6,
        enrollmentCount: 9300,
        category: 'Mobile Development',
        description: 'Build Android apps with Java and Kotlin, learning from Google developer experts and making real-world projects.',
        skills: ['Android', 'Java', 'Kotlin', 'Material Design']
      },
      {
        id: 'nd190',
        title: 'iOS Developer Nanodegree',
        thumbnail: 'assets/images/courses/ios-developer.jpg',
        instructor: 'Ryan Kim',
        level: 'Intermediate',
        duration: '4 Months',
        price: 399,
        rating: 4.7,
        enrollmentCount: 8100,
        category: 'Mobile Development',
        description: 'Build iOS apps with Swift, learning user interface design principles and applying them in real-world apps.',
        skills: ['iOS', 'Swift', 'UIKit', 'Core Data']
      },
      {
        id: 'nd200',
        title: 'Blockchain Developer Nanodegree',
        thumbnail: 'assets/images/courses/blockchain-developer.jpg',
        instructor: 'Thomas Brown',
        level: 'Advanced',
        duration: '5 Months',
        price: 499,
        rating: 4.5,
        enrollmentCount: 5200,
        category: 'Blockchain',
        description: 'Learn to design, build, and secure blockchain applications and networks.',
        skills: ['Blockchain', 'Ethereum', 'Smart Contracts', 'dApps']
      }
    ];
  }

  extractCategories(): void {
    const categorySet = new Set(this.courses.map(course => course.category));
    this.categories = Array.from(categorySet);
  }

  applyFilters(): void {
    // Filter courses based on selected criteria
    this.filteredCourses = this.courses.filter(course => {
      // Category filter
      if (this.selectedCategory !== 'all' && course.category !== this.selectedCategory) {
        return false;
      }

      // Level filter
      if (this.selectedLevel !== 'all' && course.level !== this.selectedLevel) {
        return false;
      }

      // Duration filter (simplified)
      if (this.selectedDuration !== 'all') {
        if (
          (this.selectedDuration === '1-2 Months' && !course.duration.includes('1') && !course.duration.includes('2')) ||
          (this.selectedDuration === '3-4 Months' && !course.duration.includes('3') && !course.duration.includes('4')) ||
          (this.selectedDuration === '5+ Months' && !course.duration.includes('5') && !course.duration.includes('6'))
        ) {
          return false;
        }
      }

      // Search filter
      if (this.searchQuery) {
        const query = this.searchQuery.toLowerCase();
        return (
          course.title.toLowerCase().includes(query) ||
          course.description.toLowerCase().includes(query) ||
          course.category.toLowerCase().includes(query) ||
          course.skills.some(skill => skill.toLowerCase().includes(query))
        );
      }

      return true;
    });

    // Calculate total pages
    this.totalPages = Math.ceil(this.filteredCourses.length / this.pageSize);

    // Validate current page
    if (this.currentPage > this.totalPages) {
      this.currentPage = 1;
    }
  }

  getCurrentPageCourses(): any[] {
    const startIndex = (this.currentPage - 1) * this.pageSize;
    const endIndex = startIndex + this.pageSize;
    return this.filteredCourses.slice(startIndex, endIndex);
  }

  updateFilters(): void {
    // Update URL with new filter params
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: {
        category: this.selectedCategory !== 'all' ? this.selectedCategory : null,
        level: this.selectedLevel !== 'all' ? this.selectedLevel : null,
        duration: this.selectedDuration !== 'all' ? this.selectedDuration : null,
        search: this.searchQuery || null,
        page: this.currentPage !== 1 ? this.currentPage : null
      },
      queryParamsHandling: 'merge'
    });

    this.applyFilters();
  }

  setCategory(category: string): void {
    this.selectedCategory = category;
    this.currentPage = 1;
    this.updateFilters();
  }

  setLevel(level: string): void {
    this.selectedLevel = level;
    this.currentPage = 1;
    this.updateFilters();
  }

  setDuration(duration: string): void {
    this.selectedDuration = duration;
    this.currentPage = 1;
    this.updateFilters();
  }

  search(query: string): void {
    this.searchQuery = query;
    this.currentPage = 1;
    this.updateFilters();
  }

  resetFilters(): void {
    this.selectedCategory = 'all';
    this.selectedLevel = 'all';
    this.selectedDuration = 'all';
    this.searchQuery = '';
    this.currentPage = 1;
    this.updateFilters();
  }

  goToPage(page: number): void {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
      this.updateFilters();
    }
  }

  viewCourseDetails(courseId: string): void {
    this.router.navigate(['/courses', courseId]);
  }
}