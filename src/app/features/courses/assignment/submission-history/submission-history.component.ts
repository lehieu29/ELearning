import { Component, Input, OnInit } from '@angular/core';
import { BaseComponent } from '@app/shared/components/base/base-component';
import { CourseService } from '@app/shared/services/course.service';
import { SubmissionHistory } from '@app/shared/models/assignment.model';
import { takeUntil } from 'rxjs/operators';

@Component({
  selector: 'app-submission-history',
  templateUrl: './submission-history.component.html'
})
export class SubmissionHistoryComponent extends BaseComponent implements OnInit {
  @Input() courseId: string;
  @Input() assignmentId: string;
  
  isLoading = true;
  error: string = '';
  submissions: SubmissionHistory[] = [];
  
  constructor(private courseService: CourseService) {
    super();
  }
  
  ngOnInit(): void {
    this.loadSubmissionHistory();
  }
  
  loadSubmissionHistory(): void {
    this.isLoading = true;
    
    this.courseService.getSubmissionHistory(this.courseId, this.assignmentId)
      .pipe(takeUntil(this._onDestroySub))
      .subscribe({
        next: (history) => {
          this.submissions = history;
          this.isLoading = false;
        },
        error: (err) => {
          console.error('Error loading submission history:', err);
          this.error = 'Failed to load submission history. Please try again.';
          this.isLoading = false;
        }
      });
  }
  
  getStatusColor(status: string): string {
    switch (status) {
      case 'graded':
        return 'text-green-600';
      case 'submitted':
        return 'text-blue-600';
      case 'late':
        return 'text-yellow-600';
      case 'rejected':
        return 'text-red-600';
      default:
        return 'text-gray-600';
    }
  }
  
  getStatusBgColor(status: string): string {
    switch (status) {
      case 'graded':
        return 'bg-green-100';
      case 'submitted':
        return 'bg-blue-100';
      case 'late':
        return 'bg-yellow-100';
      case 'rejected':
        return 'bg-red-100';
      default:
        return 'bg-gray-100';
    }
  }
}
