import { Component, Input, Output, EventEmitter, OnInit, OnDestroy } from '@angular/core';
import { interval, Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { BaseComponent } from '@app/shared/components/base/base-component';

@Component({
  selector: 'app-quiz-timer',
  templateUrl: './quiz-timer.component.html'
})
export class QuizTimerComponent extends BaseComponent implements OnInit, OnDestroy {
  @Input() durationMinutes: number = 0;
  @Input() warningThreshold: number = 60; // Seconds remaining to show warning
  @Input() dangerThreshold: number = 30; // Seconds remaining to show danger
  @Output() timerComplete = new EventEmitter<void>();
  @Output() timeUpdate = new EventEmitter<number>();
  
  remainingSeconds: number = 0;
  totalSeconds: number = 0;
  progress: number = 100;
  isRunning: boolean = false;
  isPaused: boolean = false;
  private timerSubject = new Subject<void>();
  
  /**
   * Khởi tạo bộ đếm giờ
   * Initialize the timer
   */
  ngOnInit(): void {
    this.totalSeconds = this.durationMinutes * 60;
    this.remainingSeconds = this.totalSeconds;
    this.startTimer();
  }
  
  /**
   * Hủy bộ đếm giờ khi component bị hủy
   * Clean up timer when component is destroyed
   */
  override ngOnDestroy(): void {
    this.stopTimer();
    super.ngOnDestroy();
  }
  
  /**
   * Bắt đầu bộ đếm giờ
   * Start the timer
   */
  startTimer(): void {
    if (this.isRunning) return;
    
    this.isRunning = true;
    this.isPaused = false;
    
    interval(1000)
      .pipe(takeUntil(this.timerSubject), takeUntil(this._onDestroySub))
      .subscribe(() => {
        if (this.remainingSeconds > 0) {
          this.remainingSeconds--;
          this.progress = (this.remainingSeconds / this.totalSeconds) * 100;
          this.timeUpdate.emit(this.totalSeconds - this.remainingSeconds);
          
          if (this.remainingSeconds === 0) {
            this.timerComplete.emit();
            this.stopTimer();
          }
        }
      });
  }
  
  /**
   * Dừng bộ đếm giờ
   * Stop the timer
   */
  stopTimer(): void {
    this.isRunning = false;
    this.timerSubject.next();
  }
  
  /**
   * Tạm dừng bộ đếm giờ
   * Pause the timer
   */
  pauseTimer(): void {
    this.isPaused = true;
    this.stopTimer();
  }
  
  /**
   * Tiếp tục bộ đếm giờ sau khi tạm dừng
   * Resume the timer after pausing
   */
  resumeTimer(): void {
    if (this.isPaused) {
      this.startTimer();
    }
  }
  
  /**
   * Định dạng thời gian để hiển thị
   * Format the time for display
   * @returns Chuỗi thời gian dưới dạng MM:SS
   */
  formatTimeRemaining(): string {
    const minutes = Math.floor(this.remainingSeconds / 60);
    const seconds = this.remainingSeconds % 60;
    return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
  }
  
  /**
   * Kiểm tra xem thời gian còn lại có nằm trong ngưỡng cảnh báo không
   * Check if remaining time is within warning threshold
   * @returns true nếu thời gian còn lại nhỏ hơn hoặc bằng ngưỡng cảnh báo
   */
  isWarning(): boolean {
    return this.remainingSeconds <= this.warningThreshold && this.remainingSeconds > this.dangerThreshold;
  }
  
  /**
   * Kiểm tra xem thời gian còn lại có nằm trong ngưỡng nguy hiểm không
   * Check if remaining time is within danger threshold
   * @returns true nếu thời gian còn lại nhỏ hơn hoặc bằng ngưỡng nguy hiểm
   */
  isDanger(): boolean {
    return this.remainingSeconds <= this.dangerThreshold;
  }
  
  /**
   * Lấy màu thanh tiến trình dựa trên thời gian còn lại
   * Get progress bar color based on remaining time
   * @returns Lớp CSS cho màu thanh tiến trình
   */
  getProgressBarColor(): string {
    if (this.isDanger()) {
      return 'bg-red-600';
    } else if (this.isWarning()) {
      return 'bg-yellow-500';
    } else {
      return 'bg-blue-600';
    }
  }
  
  /**
   * Lấy màu văn bản thời gian dựa trên thời gian còn lại
   * Get time text color based on remaining time
   * @returns Lớp CSS cho màu văn bản
   */
  getTimeTextColor(): string {
    if (this.isDanger()) {
      return 'text-red-600';
    } else if (this.isWarning()) {
      return 'text-yellow-600';
    } else {
      return 'text-gray-700';
    }
  }
}
