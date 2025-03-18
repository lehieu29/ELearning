import { Component, Input, Output, EventEmitter } from '@angular/core';
import { BaseComponent } from '@app/shared/components/base/base-component';

@Component({
  selector: 'app-retry-mechanism',
  templateUrl: './retry-mechanism.component.html'
})
export class RetryMechanismComponent extends BaseComponent {
  @Input() quizId: string;
  @Input() maxAttempts: number | null = null;
  @Input() currentAttempt: number = 0;
  @Input() lastScore: number = 0;
  @Input() passingScore: number = 70; // Default passing score
  @Output() retryQuiz = new EventEmitter<void>();
  
  /**
   * Tính toán số lần thử còn lại
   * Calculate the number of attempts remaining
   * @returns Số lần thử còn lại
   */
  get attemptsRemaining(): number {
    if (this.maxAttempts === null || this.maxAttempts === undefined) {
      return Infinity; // Không giới hạn số lần thử / Unlimited attempts
    }
    return Math.max(0, this.maxAttempts - this.currentAttempt);
  }
  
  /**
   * Kiểm tra xem người dùng có thể thử lại không
   * Check if the user can retry the quiz
   * @returns true nếu người dùng có thể thử lại
   */
  get canRetry(): boolean {
    return this.attemptsRemaining > 0 || this.maxAttempts === null || this.maxAttempts === undefined;
  }
  
  /**
   * Lấy văn bản hiển thị về số lần thử
   * Get display text about attempts
   * @returns Chuỗi văn bản hiển thị
   */
  get attemptsText(): string {
    if (this.maxAttempts === null || this.maxAttempts === undefined) {
      return 'không giới hạn số lần thử';
    }
    
    const remaining = this.attemptsRemaining;
    return `còn ${remaining} lần thử`;
  }
  
  /**
   * Xử lý sự kiện khi người dùng nhấp nút thử lại
   * Handle event when retry button is clicked
   */
  onRetryClick(): void {
    if (this.canRetry) {
      this.retryQuiz.emit();
    }
  }
}
