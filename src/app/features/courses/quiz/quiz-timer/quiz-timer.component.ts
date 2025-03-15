import { Component, Input, Output, EventEmitter, OnInit, OnDestroy } from '@angular/core';
import { interval, Subscription } from 'rxjs';
import { takeWhile } from 'rxjs/operators';

@Component({
  selector: 'app-quiz-timer',
  templateUrl: './quiz-timer.component.html'
})
export class QuizTimerComponent implements OnInit, OnDestroy {
  @Input() durationSeconds: number = 0;
  @Input() warningThreshold: number = 60; // seconds
  @Output() timerComplete = new EventEmitter<void>();
  
  remainingSeconds: number = 0;
  private timerSubscription: Subscription;
  progress: number = 100;
  
  ngOnInit(): void {
    this.startTimer();
  }
  
  ngOnDestroy(): void {
    this.stopTimer();
  }
  
  startTimer(): void {
    this.remainingSeconds = this.durationSeconds;
    const startTime = this.remainingSeconds;
    
    this.timerSubscription = interval(1000)
      .pipe(
        takeWhile(() => this.remainingSeconds > 0)
      )
      .subscribe(() => {
        this.remainingSeconds--;
        this.progress = (this.remainingSeconds / startTime) * 100;
        
        if (this.remainingSeconds === 0) {
          this.timerComplete.emit();
        }
      });
  }
  
  stopTimer(): void {
    if (this.timerSubscription) {
      this.timerSubscription.unsubscribe();
    }
  }
}
