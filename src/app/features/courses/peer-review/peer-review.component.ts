import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { BaseComponent } from '@app/shared/components/base/base-component';
import { CourseService } from '@app/shared/services/course.service';
import { takeUntil } from 'rxjs/operators';

interface PeerReviewAssignment {
  id: string;
  title: string;
  description: string;
  dueDate: Date;
  submissionCount: number;
  status: 'pending' | 'in_progress' | 'completed';
  assignedSubmissions?: PeerSubmission[];
}

interface PeerSubmission {
  id: string;
  studentName: string;
  submissionDate: Date;
  files: any[];
  reviewed: boolean;
  reviewDue: Date;
}

@Component({
  selector: 'app-peer-review',
  templateUrl: './peer-review.component.html'
})
export class PeerReviewComponent extends BaseComponent implements OnInit {
  courseId: string;
  assignments: PeerReviewAssignment[] = [];
  selectedAssignment: PeerReviewAssignment | null = null;
  selectedSubmission: PeerSubmission | null = null;
  
  isLoading = true;
  isReviewFormVisible = false;
  isSubmitting = false;
  error: string = '';
  
  reviewForm: FormGroup;
  
  // Review criteria
  reviewCriteria = [
    { id: 'content', name: 'Content Quality', description: 'Accuracy and quality of the submission content' },
    { id: 'structure', name: 'Organization', description: 'How well the submission is organized and structured' },
    { id: 'creativity', name: 'Creativity', description: 'Original ideas and creative approaches' },
    { id: 'requirements', name: 'Requirements', description: 'How well the submission meets assignment requirements' }
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
      structure: [0, [Validators.required, Validators.min(1), Validators.max(5)]],
      creativity: [0, [Validators.required, Validators.min(1), Validators.max(5)]],
      requirements: [0, [Validators.required, Validators.min(1), Validators.max(5)]],
      feedback: ['', [Validators.required, Validators.minLength(50), Validators.maxLength(1000)]],
      strengthPoints: ['', Validators.maxLength(500)],
      improvementPoints: ['', Validators.maxLength(500)]
    });
  }
  
  ngOnInit(): void {
    this.route.parent.paramMap
      .pipe(takeUntil(this._onDestroySub))
      .subscribe(params => {
        this.courseId = params.get('courseId');
        if (this.courseId) {
          this.loadAssignments();
        }
      });
  }
  
  loadAssignments(): void {
    this.isLoading = true;
    
    this.courseService.getPeerReviewAssignments(this.courseId)
      .pipe(takeUntil(this._onDestroySub))
      .subscribe({
        next: (assignments) => {
          this.assignments = assignments;
          this.isLoading = false;
        },
        error: (err) => {
          console.error('Error loading peer review assignments:', err);
          this.error = 'Failed to load peer review assignments. Please try again.';
          this.isLoading = false;
        }
      });
  }
  
  selectAssignment(assignment: PeerReviewAssignment): void {
    this.selectedAssignment = assignment;
    this.selectedSubmission = null;
    this.isReviewFormVisible = false;
    
    // Load assigned submissions if not already loaded
    if (!assignment.assignedSubmissions) {
      this.courseService.getPeerReviewSubmissions(this.courseId, assignment.id)
        .pipe(takeUntil(this._onDestroySub))
        .subscribe({
          next: (submissions) => {
            this.selectedAssignment.assignedSubmissions = submissions;
          },
          error: (err) => {
            console.error('Error loading submissions:', err);
            this.error = 'Failed to load peer submissions. Please try again.';
          }
        });
    }
  }
  
  selectSubmission(submission: PeerSubmission): void {
    this.selectedSubmission = submission;
    this.resetReviewForm();
  }
  
  startReview(): void {
    this.isReviewFormVisible = true;
  }
  
  cancelReview(): void {
    this.isReviewFormVisible = false;
  }
  
  submitReview(): void {
    if (this.reviewForm.invalid) {
      Object.keys(this.reviewForm.controls).forEach(key => {
        const control = this.reviewForm.get(key);
        control.markAsTouched();
      });
      return;
    }
    
    this.isSubmitting = true;
    
    const reviewData = {
      assignmentId: this.selectedAssignment.id,
      submissionId: this.selectedSubmission.id,
      overallRating: this.reviewForm.value.overallRating,
      detailedRatings: {
        content: this.reviewForm.value.content,
        structure: this.reviewForm.value.structure,
        creativity: this.reviewForm.value.creativity,
        requirements: this.reviewForm.value.requirements
      },
      feedback: this.reviewForm.value.feedback,
      strengthPoints: this.reviewForm.value.strengthPoints,
      improvementPoints: this.reviewForm.value.improvementPoints
    };
    
    this.courseService.submitPeerReview(this.courseId, reviewData)
      .pipe(takeUntil(this._onDestroySub))
      .subscribe({
        next: () => {
          if (this.selectedSubmission) {
            this.selectedSubmission.reviewed = true;
          }
          this.isReviewFormVisible = false;
          this.isSubmitting = false;
        },
        error: (err) => {
          console.error('Error submitting peer review:', err);
          this.error = 'Failed to submit your review. Please try again.';
          this.isSubmitting = false;
        }
      });
  }
  
  resetReviewForm(): void {
    this.reviewForm.reset({
      overallRating: 0,
      content: 0,
      structure: 0,
      creativity: 0,
      requirements: 0,
      feedback: '',
      strengthPoints: '',
      improvementPoints: ''
    });
  }
  
  getStatusClass(status: string): string {
    switch(status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'in_progress':
        return 'bg-blue-100 text-blue-800';
      case 'completed':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  }
  
  getRemainingDays(date: Date): number {
    const now = new Date();
    const dueDate = new Date(date);
    const diffTime = dueDate.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays > 0 ? diffDays : 0;
  }
}
