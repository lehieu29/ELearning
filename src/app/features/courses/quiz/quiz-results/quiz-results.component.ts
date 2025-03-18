import { Component, Input, Output, EventEmitter, OnChanges, SimpleChanges } from '@angular/core';
import { BaseComponent } from '@app/shared/components/base/base-component';

interface QuizResultData {
  score: number;                // Raw score points
  totalQuestions: number;       // Total number of questions
  correctAnswers: number;       // Number of correctly answered questions
  percentageScore: number;      // Percentage score (0-100)
  passingScore: number;         // Passing threshold percentage
  passed: boolean;              // Whether the user passed
  timeSpent: number;            // Time spent in seconds
  attemptsRemaining?: number;   // Number of attempts remaining
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
export class QuizResultsComponent extends BaseComponent implements OnChanges {
  @Input() results: QuizResultData;
  @Input() showDetailedFeedback = true;
  @Input() quizTitle: string = '';
  @Output() retryQuiz = new EventEmitter<void>();
  @Output() viewSolutions = new EventEmitter<void>();
  @Output() continueCourse = new EventEmitter<void>();
  
  // Analytics tracking
  correctByCategory: { [category: string]: number } = {};
  totalByCategory: { [category: string]: number } = {};
  expandedQuestions: Set<string> = new Set();
  
  /**
   * Phản ứng khi thay đổi input properties
   * React to changes in input properties
   * @param changes Các thay đổi của input properties
   */
  ngOnChanges(changes: SimpleChanges): void {
    if (changes.results && this.results) {
      this.calculateCategoryStats();
    }
  }
  
  /**
   * Tính toán thống kê theo danh mục (nếu có)
   * Calculate statistics by category (if available)
   */
  calculateCategoryStats(): void {
    this.correctByCategory = {};
    this.totalByCategory = {};
    
    if (this.results.feedbackByQuestion) {
      this.results.feedbackByQuestion.forEach(feedback => {
        // In a real implementation, we would use question category data
        // This is just a placeholder for demonstration
        const category = 'general';
        
        if (!this.totalByCategory[category]) {
          this.totalByCategory[category] = 0;
          this.correctByCategory[category] = 0;
        }
        
        this.totalByCategory[category]++;
        if (feedback.isCorrect) {
          this.correctByCategory[category]++;
        }
      });
    }
  }
  
  /**
   * Lấy màu dựa trên điểm số
   * Get color based on score
   * @returns CSS class for text color
   */
  getScoreColor(): string {
    if (this.results.percentageScore >= 80) {
      return 'text-green-600';
    } else if (this.results.percentageScore >= 60) {
      return 'text-yellow-600';
    } else {
      return 'text-red-600';
    }
  }
  
  /**
   * Định dạng thời gian đã sử dụng
   * Format time spent
   * @returns Thời gian định dạng dạng "Xm Ys"
   */
  formatTimeSpent(): string {
    const minutes = Math.floor(this.results.timeSpent / 60);
    const seconds = this.results.timeSpent % 60;
    return `${minutes}m ${seconds}s`;
  }
  
  /**
   * Xử lý sự kiện khi nhấp nút làm lại bài kiểm tra
   * Handle event when retry button is clicked
   */
  onRetryClick(): void {
    this.retryQuiz.emit();
  }
  
  /**
   * Xử lý sự kiện khi nhấp nút xem giải thích
   * Handle event when view solutions button is clicked
   */
  onViewSolutionsClick(): void {
    this.viewSolutions.emit();
  }
  
  /**
   * Xử lý sự kiện khi nhấp nút tiếp tục khóa học
   * Handle event when continue course button is clicked
   */
  onContinueClick(): void {
    this.continueCourse.emit();
  }
  
  /**
   * Mở rộng/thu gọn phản hồi của câu hỏi
   * Expand/collapse question feedback
   * @param questionId ID của câu hỏi
   */
  toggleQuestionFeedback(questionId: string): void {
    if (this.expandedQuestions.has(questionId)) {
      this.expandedQuestions.delete(questionId);
    } else {
      this.expandedQuestions.add(questionId);
    }
  }
  
  /**
   * Kiểm tra xem câu hỏi có được mở rộng không
   * Check if a question is expanded
   * @param questionId ID của câu hỏi
   * @returns true nếu câu hỏi đang được mở rộng
   */
  isQuestionExpanded(questionId: string): boolean {
    return this.expandedQuestions.has(questionId);
  }
  
  /**
   * Lấy phần trăm hoàn thành theo danh mục
   * Get completion percentage by category
   * @param category Danh mục cần tính
   * @returns Phần trăm hoàn thành
   */
  getCategoryPercentage(category: string): number {
    if (!this.totalByCategory[category] || this.totalByCategory[category] === 0) {
      return 0;
    }
    return (this.correctByCategory[category] / this.totalByCategory[category]) * 100;
  }
}
