import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { BaseComponent } from '@app/shared/components/base/base-component';
import { CourseService } from '@app/shared/services/course.service';
import { NotificationService } from '@app/shared/services/notification.service';
import { takeUntil } from 'rxjs/operators';

interface KnowledgeQuestion {
  id: string;
  text: string;
  type: 'multiple-choice' | 'true-false' | 'matching' | 'fill-in-blank';
  options?: { id: string; text: string }[];
  correctAnswer?: string | string[];
  explanation?: string;
  points: number;
}

interface KnowledgeCheck {
  id: string;
  title: string;
  description: string;
  lessonId: string;
  questions: KnowledgeQuestion[];
  passingScore: number;
  maxAttempts: number;
  timeLimit?: number; // in minutes
}

@Component({
  selector: 'app-knowledge-check',
  templateUrl: './knowledge-check.component.html'
})
export class KnowledgeCheckComponent extends BaseComponent implements OnInit {
  courseId: string;
  lessonId: string;
  knowledgeCheckId: string;
  
  knowledgeCheck: KnowledgeCheck;
  userAnswers: { [questionId: string]: string | string[] } = {};
  answersForm: FormGroup;
  
  currentQuestionIndex: number = 0;
  isSubmitting = false;
  isLoading = true;
  isCompleted = false;
  isReviewing = false;
  
  score: number = 0;
  totalPoints: number = 0;
  hasPassed: boolean = false;
  attemptCount: number = 0;
  
  timeRemaining: number = 0;
  timerInterval: any;
  
  error: string = '';
  
  constructor(
    private route: ActivatedRoute,
    private fb: FormBuilder,
    private courseService: CourseService,
    private notificationService: NotificationService
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
        this.knowledgeCheckId = params.get('knowledgeCheckId');
        this.lessonId = params.get('lessonId');
        
        if (this.courseId && this.knowledgeCheckId) {
          this.loadKnowledgeCheck();
        }
      });
  }
  
  loadKnowledgeCheck(): void {
    this.isLoading = true;
    
    this.courseService.getKnowledgeCheck(this.courseId, this.knowledgeCheckId)
      .pipe(takeUntil(this._onDestroySub))
      .subscribe({
        next: (check) => {
          this.knowledgeCheck = check;
          this.totalPoints = check.questions.reduce((sum, q) => sum + q.points, 0);
          
          // Check if user has already made attempts
          this.loadUserAttempts();
        },
        error: (err) => {
          console.error('Error loading knowledge check:', err);
          this.error = 'Failed to load the knowledge check. Please try again.';
          this.isLoading = false;
        }
      });
  }
  
  loadUserAttempts(): void {
    this.courseService.getUserKnowledgeCheckAttempts(this.courseId, this.knowledgeCheckId)
      .pipe(takeUntil(this._onDestroySub))
      .subscribe({
        next: (attempts) => {
          this.attemptCount = attempts.length;
          
          if (attempts.length > 0) {
            const lastAttempt = attempts[attempts.length - 1];
            if (lastAttempt.passed) {
              this.isCompleted = true;
              this.hasPassed = true;
              this.score = lastAttempt.score;
            }
          }
          
          // Initialize the form for answering questions
          this.initAnswersForm();
          this.isLoading = false;
          
          // Start timer if there's a time limit and the user hasn't completed yet
          if (this.knowledgeCheck.timeLimit && !this.isCompleted) {
            this.startTimer();
          }
        },
        error: (err) => {
          console.error('Error loading user attempts:', err);
          // Continue anyway, assuming no attempts
          this.initAnswersForm();
          this.isLoading = false;
          
          if (this.knowledgeCheck?.timeLimit && !this.isCompleted) {
            this.startTimer();
          }
        }
      });
  }
  
  initAnswersForm(): void {
    const formControls = {};
    
    this.knowledgeCheck.questions.forEach(question => {
      if (question.type === 'multiple-choice') {
        formControls[question.id] = ['', Validators.required];
      } else if (question.type === 'true-false') {
        formControls[question.id] = ['', Validators.required];
      } else if (question.type === 'matching') {
        // For matching questions, create a group of controls
        const matchingControls = {};
        question.options.forEach(option => {
          matchingControls[option.id] = ['', Validators.required];
        });
        formControls[question.id] = this.fb.group(matchingControls);
      } else if (question.type === 'fill-in-blank') {
        formControls[question.id] = ['', Validators.required];
      }
    });
    
    this.answersForm = this.fb.group(formControls);
  }
  
  getCurrentQuestion(): KnowledgeQuestion | null {
    if (!this.knowledgeCheck?.questions || this.knowledgeCheck.questions.length === 0) {
      return null;
    }
    
    if (this.currentQuestionIndex >= this.knowledgeCheck.questions.length) {
      return null;
    }
    
    return this.knowledgeCheck.questions[this.currentQuestionIndex];
  }
  
  nextQuestion(): void {
    if (this.currentQuestionIndex < this.knowledgeCheck.questions.length - 1) {
      this.currentQuestionIndex++;
    }
  }
  
  previousQuestion(): void {
    if (this.currentQuestionIndex > 0) {
      this.currentQuestionIndex--;
    }
  }
  
  goToQuestion(index: number): void {
    if (index >= 0 && index < this.knowledgeCheck.questions.length) {
      this.currentQuestionIndex = index;
    }
  }
  
  isQuestionAnswered(questionId: string): boolean {
    const control = this.answersForm.get(questionId);
    return control && control.valid;
  }
  
  submitAnswers(): void {
    if (this.answersForm.invalid) {
      Object.keys(this.answersForm.controls).forEach(key => {
        const control = this.answersForm.get(key);
        control.markAsTouched();
      });
      
      this.notificationService.warning('Please answer all questions before submitting.');
      return;
    }
    
    this.isSubmitting = true;
    
    // Process form values to match expected API format
    const userAnswers = {};
    Object.keys(this.answersForm.value).forEach(questionId => {
      userAnswers[questionId] = this.answersForm.value[questionId];
    });
    
    const submission = {
      courseId: this.courseId,
      knowledgeCheckId: this.knowledgeCheckId,
      answers: userAnswers,
      timeSpent: this.knowledgeCheck.timeLimit ? (this.knowledgeCheck.timeLimit * 60) - this.timeRemaining : 0
    };
    
    this.courseService.submitKnowledgeCheck(submission)
      .pipe(takeUntil(this._onDestroySub))
      .subscribe({
        next: (result) => {
          // Stop timer if running
          this.stopTimer();
          
          this.score = result.score;
          this.hasPassed = result.passed;
          this.isCompleted = true;
          this.userAnswers = userAnswers;
          
          if (result.passed) {
            this.notificationService.success('Congratulations! You passed the knowledge check.');
          } else {
            this.notificationService.info('You did not pass the knowledge check. You can try again later.');
          }
          
          this.isSubmitting = false;
        },
        error: (err) => {
          console.error('Error submitting knowledge check:', err);
          this.error = 'Failed to submit your answers. Please try again.';
          this.isSubmitting = false;
        }
      });
  }
  
  startReview(): void {
    this.isReviewing = true;
    this.currentQuestionIndex = 0;
  }
  
  startTimer(): void {
    this.timeRemaining = this.knowledgeCheck.timeLimit * 60; // Convert minutes to seconds
    
    this.timerInterval = setInterval(() => {
      this.timeRemaining--;
      
      if (this.timeRemaining <= 0) {
        this.stopTimer();
        this.submitAnswers(); // Auto-submit when time runs out
      }
    }, 1000);
  }
  
  stopTimer(): void {
    if (this.timerInterval) {
      clearInterval(this.timerInterval);
      this.timerInterval = null;
    }
  }
  
  formatTime(seconds: number): string {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds < 10 ? '0' : ''}${remainingSeconds}`;
  }
  
  restartCheck(): void {
    if (this.attemptCount >= this.knowledgeCheck.maxAttempts) {
      this.notificationService.warning(`You've reached the maximum number of attempts (${this.knowledgeCheck.maxAttempts}) for this knowledge check.`);
      return;
    }
    
    this.isCompleted = false;
    this.isReviewing = false;
    this.currentQuestionIndex = 0;
    this.initAnswersForm();
    
    if (this.knowledgeCheck.timeLimit) {
      this.startTimer();
    }
  }
  
  getQuestionProgressPercentage(): number {
    return ((this.currentQuestionIndex + 1) / this.knowledgeCheck.questions.length) * 100;
  }
  
  isAnswerCorrect(questionId: string): boolean {
    if (!this.isCompleted || !this.userAnswers) {
      return false;
    }
    
    const question = this.knowledgeCheck.questions.find(q => q.id === questionId);
    if (!question) return false;
    
    const userAnswer = this.userAnswers[questionId];
    
    if (Array.isArray(question.correctAnswer)) {
      if (!Array.isArray(userAnswer)) return false;
      if (question.correctAnswer.length !== userAnswer.length) return false;
      return question.correctAnswer.every(ans => userAnswer.includes(ans));
    }
    
    return userAnswer === question.correctAnswer;
  }
  
  ngOnDestroy(): void {
    this.stopTimer();
    super.ngOnDestroy();
  }
}
