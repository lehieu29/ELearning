// File path: src/app/features/courses/assignment/assignment.component.ts
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { BaseComponent } from '@app/shared/components/base/base-component';
import { CourseService } from '@app/shared/services/course.service';
import { Assignment, SubmissionStatus } from '@app/shared/models/assignment.model';
import { takeUntil } from 'rxjs/operators';

@Component({
  selector: 'app-assignment',
  templateUrl: './assignment.component.html'
})
export class AssignmentComponent extends BaseComponent implements OnInit {
  courseId: string;
  assignmentId: string;
  assignment: Assignment | null = null;
  isLoading: boolean = true;
  error: string = '';
  uploadProgress: number = 0;
  submissionStatus: SubmissionStatus = 'not-submitted';
  
  constructor(
    private route: ActivatedRoute,
    private courseService: CourseService
  ) {
    super();
  }
  
  ngOnInit(): void {
    this.route.parent.paramMap
      .pipe(takeUntil(this._onDestroySub))
      .subscribe(params => {
        this.courseId = params.get('courseId');
      });
      
    this.route.paramMap
      .pipe(takeUntil(this._onDestroySub))
      .subscribe(params => {
        this.assignmentId = params.get('assignmentId');
        if (this.courseId && this.assignmentId) {
          this.loadAssignment();
        }
      });
  }
  
  loadAssignment(): void {
    this.isLoading = true;
    
    this.courseService.getAssignmentById(this.courseId, this.assignmentId)
      .pipe(takeUntil(this._onDestroySub))
      .subscribe({
        next: (assignment) => {
          this.assignment = assignment;
          this.loadSubmissionStatus();
          this.isLoading = false;
        },
        error: (err) => {
          console.error('Error loading assignment:', err);
          this.error = 'Failed to load the assignment. Please try again.';
          this.isLoading = false;
        }
      });
  }
  
  loadSubmissionStatus(): void {
    this.courseService.getAssignmentSubmissionStatus(this.courseId, this.assignmentId)
      .pipe(takeUntil(this._onDestroySub))
      .subscribe({
        next: (status) => {
          this.submissionStatus = status;
        },
        error: (err) => {
          console.error('Error loading submission status:', err);
        }
      });
  }
  
  onFileUploadProgress(progress: number): void {
    this.uploadProgress = progress;
  }
  
  onSubmissionComplete(): void {
    this.submissionStatus = 'submitted';
    this.loadSubmissionStatus();
  }
}
