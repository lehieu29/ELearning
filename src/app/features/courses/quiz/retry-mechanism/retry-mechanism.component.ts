import { Component, Input, Output, EventEmitter } from '@angular/core';
import { BaseComponent } from '@app/shared/components/base/base-component';

@Component({
  selector: 'app-retry-mechanism',
  templateUrl: './retry-mechanism.component.html'
})
export class RetryMechanismComponent extends BaseComponent {
  @Input() quizId: string;
  @Input() maxAttempts: number;
  @Input() currentAttempt: number;
  @Input() lastScore: number;
  @Input() passingScore: number;
  @Output() retryQuiz = new EventEmitter<void>();
  
  get attemptsRemaining(): number {
    return this.maxAttempts - this.currentAttempt;
  }
  
  get canRetry(): boolean {
    return this.attemptsRemaining > 0 && this.lastScore < this.passingScore;
  }
  
  get attemptsText(): string {
    if (this.maxAttempts === null || this.maxAttempts === undefined) {
      return 'unlimited attempts';
    }
    
    const remaining = this.attemptsRemaining;
    return `${remaining} ${remaining === 1 ? 'attempt' : 'attempts'} remaining`;
  }
  
  onRetryClick(): void {
    this.retryQuiz.emit();
  }
}
