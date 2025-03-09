/* src/app/features/courses/course-details/course-details.component.ts */
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';

@Component({
  selector: 'app-course-details',
  templateUrl: './course-details.component.html',
  styleUrls: ['./course-details.component.scss']
})
export class CourseDetailsComponent implements OnInit {
  courseId: string;
  course: any;
  isLoading = true;
  activeTab: 'overview' | 'syllabus' | 'instructors' | 'reviews' = 'overview';
  videoUrl: SafeResourceUrl;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private sanitizer: DomSanitizer
  ) { }

  ngOnInit(): void {
    this.route.paramMap.subscribe(params => {
      this.courseId = params.get('id');
      this.loadCourseDetails();
    });
  }

  loadCourseDetails(): void {
    // Simulate API call with a delay
    setTimeout(() => {
      // In a real app, this would be an API call
      this.course = this.getCourseById(this.courseId);

      if (this.course) {
        // Sanitize video URL
        this.videoUrl = this.sanitizer.bypassSecurityTrustResourceUrl(this.course.previewVideo);
      } else {
        // Handle course not found
        // In a real app, you might want to navigate to a 404 page
        this.router.navigate(['/courses']);
      }

      this.isLoading = false;
    }, 1000);
  }

  getCourseById(id: string): any {
    // This is a mock implementation for the demo
    // In a real app, this data would come from an API
    const courses = [
      {
        id: 'nd101',
        title: 'AI Programming with Python',
        thumbnail: 'assets/images/courses/ai-python.jpg',
        previewVideo: 'https://www.youtube.com/embed/SGHai8n0sVU',
        instructor: {
          name: 'John Smith',
          title: 'Senior AI Engineer',
          bio: 'John has over 10 years of experience in AI and machine learning. He has worked at leading tech companies and has taught AI courses for over 5 years.',
          avatar: 'assets/images/instructors/john-smith.jpg'
        },
        level: 'Beginner',
        duration: '3 Months',
        price: 399,
        rating: 4.8,
        enrollmentCount: 12500,
        reviewCount: 856,
        category: 'Artificial Intelligence',
        description: 'Learn Python, NumPy, pandas, Matplotlib, PyTorch, Calculus, and Linear Algebra—the foundations for building your own neural network.',
        longDescription: `
          In this Nanodegree program, you'll learn the essential foundations of AI: the programming tools (Python, NumPy, PyTorch), the math (calculus and linear algebra), and the key techniques of neural networks (gradient descent and backpropagation).
          
          We've designed this program to prepare you for more advanced programs in AI. You'll learn Python, how to use Jupyter Notebooks, NumPy, Matplotlib, pandas, and prepare you for building deep learning applications with PyTorch.
          
          This program offers a solid foundation in neural networks for intermediate programmers who already know some Python.
        `,
        skills: ['Python', 'NumPy', 'PyTorch', 'Neural Networks', 'Pandas', 'Matplotlib'],
        prerequisites: [
          'Basic Python programming knowledge',
          'High school-level algebra',
          'Basic statistics knowledge'
        ],
        syllabus: [
          {
            title: 'Introduction to Python',
            lessons: [
              'Python Installation and Setup',
              'Variables and Data Types',
              'Control Flow',
              'Functions and Modules',
              'Object-Oriented Programming'
            ],
            duration: '2 weeks'
          },
          {
            title: 'NumPy and Pandas',
            lessons: [
              'Introduction to NumPy',
              'Arrays and Operations',
              'Introduction to Pandas',
              'Data Manipulation',
              'Data Visualization with Matplotlib'
            ],
            duration: '2 weeks'
          },
          {
            title: 'Linear Algebra Essentials',
            lessons: [
              'Vectors and Matrices',
              'Matrix Operations',
              'Linear Transformations',
              'Eigenvalues and Eigenvectors',
              'Principal Component Analysis'
            ],
            duration: '2 weeks'
          },
          {
            title: 'Calculus Essentials',
            lessons: [
              'Derivatives',
              'Partial Derivatives',
              'Chain Rule',
              'Gradient Descent',
              'Optimization'
            ],
            duration: '2 weeks'
          },
          {
            title: 'Neural Networks',
            lessons: [
              'Perceptrons',
              'Activation Functions',
              'Feedforward Networks',
              'Backpropagation',
              'Building a Neural Network from Scratch'
            ],
            duration: '3 weeks'
          },
          {
            title: 'PyTorch Basics',
            lessons: [
              'Introduction to PyTorch',
              'Tensors and Operations',
              'Building Neural Networks with PyTorch',
              'Training Models',
              'Final Project: Image Classifier'
            ],
            duration: '3 weeks'
          }
        ],
        projects: [
          {
            title: 'Python Scripting',
            description: 'Write a Python script to perform data analysis on a real-world dataset.'
          },
          {
            title: 'Linear Regression',
            description: 'Implement linear regression from scratch using NumPy.'
          },
          {
            title: 'Image Classifier',
            description: 'Build and train an image classifier using PyTorch.'
          }
        ],
        reviews: [
          {
            name: 'Sarah Johnson',
            avatar: 'assets/images/avatars/avatar1.jpg',
            rating: 5,
            date: '2023-07-15',
            comment: 'This course gave me a solid foundation in AI programming. The projects were challenging but rewarding!'
          },
          {
            name: 'Michael Chen',
            avatar: 'assets/images/avatars/avatar2.jpg',
            rating: 4,
            date: '2023-06-22',
            comment: 'Great introduction to PyTorch and neural networks. Would recommend for beginners in AI.'
          },
          {
            name: 'Emily Rodriguez',
            avatar: 'assets/images/avatars/avatar3.jpg',
            rating: 5,
            date: '2023-05-10',
            comment: 'The math sections were particularly helpful. I now feel comfortable with the foundational concepts of AI.'
          }
        ],
        faqs: [
          {
            question: 'Do I need prior Python experience?',
            answer: 'Yes, basic Python knowledge is required. You should be familiar with variables, loops, conditionals, and functions.'
          },
          {
            question: 'How much math is involved?',
            answer: 'The course covers essential linear algebra and calculus concepts needed for neural networks. High school-level algebra and basic statistics knowledge are recommended prerequisites.'
          },
          {
            question: 'How much time should I dedicate per week?',
            answer: 'We recommend dedicating about 10 hours per week to complete the program in 3 months.'
          }
        ]
      },
      // More courses would be added here
    ];

    return courses.find(course => course.id === id);
  }

  setActiveTab(tab: 'overview' | 'syllabus' | 'instructors' | 'reviews'): void {
    this.activeTab = tab;
  }

  enrollInCourse(): void {
    // In a real app, this would navigate to a checkout page or enrollment API call
    alert('Enrollment functionality would be implemented here');
  }
}