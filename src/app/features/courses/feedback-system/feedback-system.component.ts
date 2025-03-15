import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { BaseComponent } from '@app/shared/components/base/base-component';
import { CourseService } from '@app/shared/services/course.service';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Course } from '@app/shared/models/course.model';
import { Review } from '@app/shared/models/review.model';
import { takeUntil } from 'rxjs/operators';

@Component({
  selector: 'app-feedback-system',
  templateUrl: './feedback-system.component.html'
})
export class FeedbackSystemComponent extends BaseComponent implements OnInit {
  courseId: string;
  course: Course;
  reviews: Review[] = [];
  userReview: Review | null = null;
  isLoadingCourse = true;
  isLoadingReviews = true;
  isSubmitting = false;
  error: string = '';
  hasSubmittedReview = false;
  
  reviewForm: FormGroup;
  
  // Rating criteria
  ratingCriteria = [
    { id: 'content', name: 'Content Quality', description: 'Quality and accuracy of the course material' },
    { id: 'instructor', name: 'Instructor', description: 'Teaching style and clarity of explanation' },
    { id: 'structure', name: 'Course Structure', description: 'Organization and flow of the course' },
    { id: 'resources', name: 'Resources', description: 'Quality of supplementary materials and resources' }
  ];
  
  constructor(
    private route: ActivatedRoute,
    private courseService: CourseService,
    private fb: FormBuilder
  ) {
    super();
    
    this.reviewForm = this.fb.group({
      overallRating: [0, [Validators.required, Validators.min(1), Validators.max(5)]],
      content: [0, [Validators.required, Validators.min(1), Validators.max(5)]],
      instructor: [0, [Validators.required, Validators.min(1), Validators.max(5)]],
      structure: [0, [Validators.required, Validators.min(1), Validators.max(5)]],
      resources: [0, [Validators.required, Validators.min(1), Validators.max(5)]],
      title: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(100)]],
      comment: ['', [Validators.required, Validators.minLength(10), Validators.maxLength(1000)]],
      recommend: [null, Validators.required]
    });
  }
  
  ngOnInit(): void {
    this.route.parent.paramMap
      .pipe(takeUntil(this._onDestroySub))
      .subscribe(params => {
        this.courseId = params.get('courseId');
        if (this.courseId) {
          this.loadCourseDetails();
          this.loadReviews();
        }
      });
  }
  
  loadCourseDetails(): void {
    this.isLoadingCourse = true;
    
    this.courseService.getCourseById(this.courseId)
      .pipe(takeUntil(this._onDestroySub))
      .subscribe({
        next: (course) => {
          this.course = course;
          this.isLoadingCourse = false;
        },
        error: (err) => {
          console.error('Error loading course details:', err);
          this.error = 'Failed to load course details. Please try again.';
          this.isLoadingCourse = false;
        }
      });
  }
  
  loadReviews(): void {
    this.isLoadingReviews = true;
    
    this.courseService.getCourseReviews(this.courseId)
      .pipe(takeUntil(this._onDestroySub))
      .subscribe({
        next: (response) => {
          this.reviews = response.reviews || [];
          this.userReview = response.userReview || null;
          
          // If user already has a review, populate the form with it
          if (this.userReview) {
            this.reviewForm.patchValue({
              overallRating: this.userReview.rating,
              content: this.userReview.detailedRatings?.content || 0,
              instructor: this.userReview.detailedRatings?.instructor || 0,
              structure: this.userReview.detailedRatings?.structure || 0,
              resources: this.userReview.detailedRatings?.resources || 0,
              title: this.userReview.title,
              comment: this.userReview.comment,
              recommend: this.userReview.recommend
            });
            this.hasSubmittedReview = true;
          }
          
          this.isLoadingReviews = false;
        },
        error: (err) => {
          console.error('Error loading reviews:', err);
          this.error = 'Failed to load course reviews. Please try again.';
          this.isLoadingReviews = false;
        }
      });
  }
  
  submitReview(): void {
    if (this.reviewForm.invalid) {
      // Mark all fields as touched to trigger validation messages
      Object.keys(this.reviewForm.controls).forEach(key => {
        const control = this.reviewForm.get(key);
        control.markAsTouched();
      });
      return;
    }
    
    this.isSubmitting = true;
    
    const reviewData = {
      courseId: this.courseId,
      rating: this.reviewForm.value.overallRating,
      title: this.reviewForm.value.title,
      comment: this.reviewForm.value.comment,
      recommend: this.reviewForm.value.recommend,
      detailedRatings: {
        content: this.reviewForm.value.content,
        instructor: this.reviewForm.value.instructor,
        structure: this.reviewForm.value.structure,
        resources: this.reviewForm.value.resources
      }
    };
    
    const request = this.userReview 
      ? this.courseService.updateReview(this.courseId, this.userReview.id, reviewData)
      : this.courseService.createReview(this.courseId, reviewData);
    
    request.pipe(takeUntil(this._onDestroySub))
      .subscribe({
        next: (review) => {
          this.userReview = review;
          this.hasSubmittedReview = true;
          this.isSubmitting = false;
          
          // If it's a new review, add it to the reviews list
          if (!this.reviews.some(r => r.id === review.id)) {
            this.reviews.unshift(review);
          } else {
            // If updating, replace the existing review
            const index = this.reviews.findIndex(r => r.id === review.id);
            if (index !== -1) {
              this.reviews[index] = review;
            }
          }
        },
        error: (err) => {
          console.error('Error submitting review:', err);
          this.error = 'Failed to submit your review. Please try again.';
          this.isSubmitting = false;
        }
      });
  }
  
  editReview(): void {
    this.hasSubmittedReview = false;
  }
  
  getAverageRating(criteriaId: string): number {
    if (!this.reviews || this.reviews.length === 0) return 0;
    
    const totalRatings = this.reviews.reduce((sum, review) => {
      return sum + (review.detailedRatings?.[criteriaId] || 0);
    }, 0);
    
    return totalRatings / this.reviews.length;
  }
  
  getOverallAverageRating(): number {
    if (!this.reviews || this.reviews.length === 0) return 0;
    
    const totalRating = this.reviews.reduce((sum, review) => sum + review.rating, 0);
    return totalRating / this.reviews.length;
  }
  
  getRecommendationPercentage(): number {
    if (!this.reviews || this.reviews.length === 0) return 0;
    
    const recommendCount = this.reviews.filter(review => review.recommend).length;
    return (recommendCount / this.reviews.length) * 100;
  }
  
  getRatingDistribution(): number[] {
    const distribution = [0, 0, 0, 0, 0]; // 5 stars to 1 star
    
    if (!this.reviews || this.reviews.length === 0) return distribution;
    
    this.reviews.forEach(review => {
      const rating = Math.round(review.rating);
      if (rating >= 1 && rating <= 5) {
        distribution[5 - rating]++;
      }
    });
    
    return distribution;
  }
  
  getPercentOfTotal(count: number): number {
    if (!this.reviews || this.reviews.length === 0) return 0;
    return (count / this.reviews.length) * 100;
  }
}
