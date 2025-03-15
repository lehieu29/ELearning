import { Component, Input, Output, EventEmitter } from '@angular/core';
import { BaseComponent } from '@app/shared/components/base/base-component';

interface QuizResultData {
  score: number;
  totalQuestions: number;
  correctAnswers: number;
  percentageScore: number;
  passingScore: number;
  passed: boolean;
  timeSpent: number; // in seconds
  attemptsRemaining?: number;
  feedbackByQuestion?: {
    questionId: string;
    isCorrect: boolean;
    points: number;
    feedback?: string;
  }[];
}

@Component({
  selector: 'app-quiz-results',
  templateUrl: './quiz-results.component.html'
})
export class QuizResultsComponent extends BaseComponent {
  @Input() results: QuizResultData;
  @Input() showDetailedFeedback = true;
  @Output() retryQuiz = new EventEmitter<void>();
  @Output() viewSolutions = new EventEmitter<void>();
  @Output() continueCourse = new EventEmitter<void>();
  
  getScoreColor(): string {
    if (this.results.percentageScore >= 80) {
      return 'text-green-600';
    } else if (this.results.percentageScore >= 60) {
      return 'text-yellow-600';
    } else {
      return 'text-red-600';
    }
  }
  
  formatTimeSpent(): string {
    const minutes = Math.floor(this.results.timeSpent / 60);
    const seconds = this.results.timeSpent % 60;
    return `${minutes}m ${seconds}s`;
  }
  
  onRetryClick(): void {
    this.retryQuiz.emit();
  }
  
  onViewSolutionsClick(): void {
    this.viewSolutions.emit();
  }
  
  onContinueClick(): void {
    this.continueCourse.emit();
  }
}
