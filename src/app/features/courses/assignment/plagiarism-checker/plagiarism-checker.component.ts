import { Component, Input, OnInit } from '@angular/core';
import { BaseComponent } from '@app/shared/components/base/base-component';
import { CourseService } from '@app/shared/services/course.service';
import { takeUntil } from 'rxjs/operators';

interface PlagiarismResult {
  score: number;
  matches: {
    source: string;
    matchPercentage: number;
    snippets: {
      text: string;
      sourceText: string;
      matchPercentage: number;
    }[];
  }[];
  status: 'not-checked' | 'checking' | 'checked' | 'error';
  lastCheckedDate?: Date;
}

@Component({
  selector: 'app-plagiarism-checker',
  templateUrl: './plagiarism-checker.component.html'
})
export class PlagiarismCheckerComponent extends BaseComponent implements OnInit {
  @Input() courseId: string;
  @Input() assignmentId: string;
  
  isLoading = true;
  error: string = '';
  checkInProgress = false;
  result: PlagiarismResult | null = null;
  
  constructor(private courseService: CourseService) {
    super();
  }
  
  ngOnInit(): void {
    this.loadPlagiarismCheck();
  }
  
  loadPlagiarismCheck(): void {
    this.isLoading = true;
    
    this.courseService.getPlagiarismCheck(this.courseId, this.assignmentId)
      .pipe(takeUntil(this._onDestroySub))
      .subscribe({
        next: (result) => {
          this.result = result;
          this.isLoading = false;
        },
        error: (err) => {
          console.error('Error loading plagiarism check:', err);
          this.error = 'Failed to load plagiarism check results.';
          this.isLoading = false;
        }
      });
  }
  
  runPlagiarismCheck(): void {
    this.checkInProgress = true;
    this.result = {
      ...this.result,
      status: 'checking'
    } as PlagiarismResult;
    
    this.courseService.runPlagiarismCheck(this.courseId, this.assignmentId)
      .pipe(takeUntil(this._onDestroySub))
      .subscribe({
        next: (result) => {
          this.result = result;
          this.checkInProgress = false;
        },
        error: (err) => {
          console.error('Error running plagiarism check:', err);
          this.error = 'Failed to run plagiarism check. Please try again.';
          this.checkInProgress = false;
          this.result = {
            ...this.result,
            status: 'error'
          } as PlagiarismResult;
        }
      });
  }
  
  getPlagiarismSeverity(score: number): string {
    if (score <= 10) return 'Very Low';
    if (score <= 25) return 'Low';
    if (score <= 50) return 'Moderate';
    if (score <= 75) return 'High';
    return 'Very High';
  }
  
  getSeverityColor(score: number): string {
    if (score <= 10) return 'text-green-600';
    if (score <= 25) return 'text-blue-600';
    if (score <= 50) return 'text-yellow-600';
    if (score <= 75) return 'text-orange-600';
    return 'text-red-600';
  }
  
  getSeverityBgColor(score: number): string {
    if (score <= 10) return 'bg-green-100';
    if (score <= 25) return 'bg-blue-100';
    if (score <= 50) return 'bg-yellow-100';
    if (score <= 75) return 'bg-orange-100';
    return 'bg-red-100';
  }
}
