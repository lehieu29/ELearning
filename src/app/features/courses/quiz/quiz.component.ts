import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { BaseComponent } from '@app/shared/components/base/base-component';
import { CourseService } from '@app/shared/services/course.service';
import { Quiz, Question, QuizAttempt } from '@app/shared/models/quiz.model';
import { takeUntil } from 'rxjs/operators';

@Component({
  selector: 'app-quiz',
  templateUrl: './quiz.component.html'
})
export class QuizComponent extends BaseComponent implements OnInit {
  courseId: string;
  quizId: string;
  quiz: Quiz | null = null;
  currentAttempt: QuizAttempt | null = null;
  
  // Quiz state
  isLoading: boolean = true;
  error: string = '';
  currentQuestionIndex: number = 0;
  userAnswers: { [questionId: string]: string | string[] } = {};
  quizStarted: boolean = false;
  quizCompleted: boolean = false;
  timeSpent: number = 0;
  
  // Results
  results: {
    score: number;
    totalQuestions: number;
    correctAnswers: number;
    percentageScore: number;
    passingScore: number;
    passed: boolean;
    timeSpent: number;
    attemptsRemaining?: number;
    feedbackByQuestion?: {
      questionId: string;
      isCorrect: boolean;
      points: number;
      feedback?: string;
    }[];
  } | null = null;
  
  // View states
  showResults: boolean = false;
  showSolutions: boolean = false;
  showRetryMechanism: boolean = false;
  
  constructor(
    private route: ActivatedRoute,
    private router: Router,
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
        this.quizId = params.get('quizId');
        if (this.quizId) {
          this.loadQuiz();
        }
      });
  }
  
  loadQuiz(): void {
    this.isLoading = true;
    this.userAnswers = {};
    
    this.courseService.getQuizById(this.courseId, this.quizId)
      .pipe(takeUntil(this._onDestroySub))
      .subscribe({
        next: (quiz) => {
          this.quiz = quiz;
          
          // If configured to randomize questions
          if (this.quiz.randomizeQuestions) {
            this.quiz.questions = this.shuffleArray([...this.quiz.questions]);
          }
          
          this.loadAttemptHistory();
          this.isLoading = false;
        },
        error: (err) => {
          console.error('Error loading quiz:', err);
          this.error = 'Failed to load the quiz. Please try again.';
          this.isLoading = false;
        }
      });
  }
  
  loadAttemptHistory(): void {
    this.courseService.getQuizAttempts(this.courseId, this.quizId)
      .pipe(takeUntil(this._onDestroySub))
      .subscribe({
        next: (attempts) => {
          if (attempts && attempts.length > 0) {
            // Sort by date, most recent first
            attempts.sort((a, b) => {
              const dateA = new Date(a.completedAt || a.startedAt);
              const dateB = new Date(b.completedAt || b.startedAt);
              return dateB.getTime() - dateA.getTime();
            });
            
            // Get most recent attempt
            this.currentAttempt = attempts[0];
            
            // If the user has completed attempts and the last one was successful
            if (this.currentAttempt.completedAt && this.currentAttempt.passed) {
              this.showRetryMechanism = true;
            }
          }
        },
        error: (err) => {
          console.error('Error loading attempt history:', err);
        }
      });
  }
  
  startQuiz(): void {
    this.quizStarted = true;
    this.currentQuestionIndex = 0;
    this.userAnswers = {};
    this.timeSpent = 0;
    
    // Create a new attempt
    const now = new Date();
    
    this.courseService.createQuizAttempt(this.courseId, this.quizId)
      .pipe(takeUntil(this._onDestroySub))
      .subscribe({
        next: (attemptId) => {
          console.log('New attempt created:', attemptId);
        },
        error: (err) => {
          console.error('Error creating attempt:', err);
        }
      });
  }
  
  submitQuiz(): void {
    this.quizCompleted = true;
    
    const answers = Object.keys(this.userAnswers).map(questionId => ({
      questionId,
      answer: this.userAnswers[questionId]
    }));
    
    // Calculate score (in a real app, this would happen on the server)
    this.calculateResults();
    
    // Submit to API
    this.courseService.submitQuizAttempt(this.courseId, this.quizId, {
      answers,
      timeSpent: this.timeSpent
    })
      .pipe(takeUntil(this._onDestroySub))
      .subscribe({
        next: (result) => {
          this.showResults = true;
        },
        error: (err) => {
          console.error('Error submitting quiz:', err);
          this.error = 'Failed to submit quiz. Please try again.';
        }
      });
  }
  
  calculateResults(): void {
    if (!this.quiz) return;
    
    let correctAnswers = 0;
    let totalScore = 0;
    const feedbackByQuestion = [];
    
    this.quiz.questions.forEach(question => {
      const userAnswer = this.userAnswers[question.id];
      let isCorrect = false;
      let points = 0;
      
      if (question.type === 'multiple-choice') {
        // For multiple choice, check if arrays match
        isCorrect = this.areArraysEqual(userAnswer as string[], question.correctAnswer as string[]);
        points = isCorrect ? question.points : 0;
      } else {
        // For single-choice, true-false, etc.
        isCorrect = userAnswer === question.correctAnswer;
        points = isCorrect ? question.points : 0;
      }
      
      if (isCorrect) {
        correctAnswers++;
        totalScore += question.points;
      }
      
      feedbackByQuestion.push({
        questionId: question.id,
        isCorrect,
        points,
        feedback: question.explanation
      });
    });
    
    const totalPossibleScore = this.quiz.questions.reduce(
      (total, q) => total + q.points, 0
    );
    
    const percentageScore = Math.round((totalScore / totalPossibleScore) * 100);
    
    this.results = {
      score: totalScore,
      totalQuestions: this.quiz.questions.length,
      correctAnswers,
      percentageScore,
      passingScore: this.quiz.passingScore,
      passed: percentageScore >= this.quiz.passingScore,
      timeSpent: this.timeSpent,
      feedbackByQuestion,
      attemptsRemaining: this.quiz.maxAttempts 
        ? this.quiz.maxAttempts - (this.currentAttempt ? 1 : 0)
        : undefined
    };
  }
  
  getCurrentQuestion(): Question | null {
    if (!this.quiz || !this.quiz.questions || this.quiz.questions.length === 0) {
      return null;
    }
    
    return this.quiz.questions[this.currentQuestionIndex];
  }
  
  onAnswerSelected(questionId: string, answer: string | string[]): void {
    this.userAnswers[questionId] = answer;
  }
  
  onNextQuestion(): void {
    if (this.currentQuestionIndex < this.quiz.questions.length - 1) {
      this.currentQuestionIndex++;
    }
  }
  
  onPreviousQuestion(): void {
    if (this.currentQuestionIndex > 0) {
      this.currentQuestionIndex--;
    }
  }
  
  onTimerComplete(): void {
    this.submitQuiz();
  }
  
  onTimeUpdate(seconds: number): void {
    this.timeSpent = seconds;
  }
  
  retryQuiz(): void {
    this.showResults = false;
    this.showSolutions = false;
    this.quizCompleted = false;
    this.quizStarted = false;
    this.results = null;
    this.startQuiz();
  }
  
  viewSolutions(): void {
    this.showSolutions = true;
    this.showResults = false;
  }
  
  continueCourse(): void {
    // Navigate to the next lesson
    this.router.navigate(['/courses', this.courseId, 'lessons', 'next']);
  }
  
  getQuestionProgress(): string {
    return `Question ${this.currentQuestionIndex + 1} of ${this.quiz?.questions.length}`;
  }
  
  getProgressPercentage(): number {
    if (!this.quiz || !this.quiz.questions || this.quiz.questions.length === 0) {
      return 0;
    }
    
    return ((this.currentQuestionIndex + 1) / this.quiz.questions.length) * 100;
  }
  
  isQuestionAnswered(questionId: string): boolean {
    return this.userAnswers[questionId] !== undefined;
  }
  
  areAllQuestionsAnswered(): boolean {
    if (!this.quiz || !this.quiz.questions) return false;
    return this.quiz.questions.every(q => this.isQuestionAnswered(q.id));
  }
  
  // Helper methods
  private shuffleArray<T>(array: T[]): T[] {
    const newArray = [...array];
    for (let i = newArray.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
    }
    return newArray;
  }
  
  private areArraysEqual(arr1: any[], arr2: any[]): boolean {
    if (!arr1 || !arr2) return false;
    if (arr1.length !== arr2.length) return false;
    
    const sorted1 = [...arr1].sort();
    const sorted2 = [...arr2].sort();
    
    return sorted1.every((value, index) => value === sorted2[index]);
  }
}
