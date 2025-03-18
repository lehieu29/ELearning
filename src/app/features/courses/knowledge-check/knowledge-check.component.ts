import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { BaseComponent } from '@app/shared/components/base/base-component';
import { CourseService } from '@app/shared/services/course.service';
import { NotificationService } from '@app/shared/services/notification.service';
import { takeUntil, finalize, catchError } from 'rxjs/operators';
import { of } from 'rxjs';

interface KnowledgeQuestion {
  id: string;
  text: string;
  type: 'multiple-choice' | 'true-false' | 'matching' | 'fill-in-blank';
  options?: { id: string; text: string }[];
  correctAnswer?: string | string[] | { [key: string]: string };
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

interface KnowledgeCheckAttempt {
  id: string;
  score: number;
  passed: boolean;
  submittedAt: string;
  answers: { [questionId: string]: string | string[] | { [key: string]: string } };
}

@Component({
  selector: 'app-knowledge-check',
  templateUrl: './knowledge-check.component.html'
})
export class KnowledgeCheckComponent extends BaseComponent implements OnInit, OnDestroy {
  courseId: string;
  lessonId: string;
  knowledgeCheckId: string;
  
  knowledgeCheck: KnowledgeCheck;
  userAnswers: { [questionId: string]: string | string[] | { [key: string]: string } } = {};
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
  
  /**
   * Khởi tạo component với các dịch vụ cần thiết
   * Initialize component with required services
   * @param route Service để truy cập thông tin route
   * @param fb FormBuilder để tạo form
   * @param courseService Service để lấy dữ liệu khóa học
   * @param notificationService Service để hiển thị thông báo
   */
  constructor(
    private route: ActivatedRoute,
    private fb: FormBuilder,
    private courseService: CourseService,
    private notificationService: NotificationService
  ) {
    super();
  }
  
  /**
   * Khởi tạo component và theo dõi tham số từ route
   * Initialize component and subscribe to route parameters
   */
  ngOnInit(): void {
    this.route.parent.paramMap
      .pipe(takeUntil(this._onDestroySub))
      .subscribe({
        next: params => {
          this.courseId = params.get('courseId');
        },
        error: err => {
          console.error('Lỗi khi lấy tham số route cha:', err);
          this.error = 'Không thể tải thông tin khóa học. Vui lòng thử lại sau.';
          this.isLoading = false;
        }
      });
    
    this.route.paramMap
      .pipe(takeUntil(this._onDestroySub))
      .subscribe({
        next: params => {
          this.knowledgeCheckId = params.get('knowledgeCheckId');
          this.lessonId = params.get('lessonId');
          
          if (this.courseId && this.knowledgeCheckId) {
            this.loadKnowledgeCheck();
          } else {
            this.error = 'Không thể tải bài kiểm tra kiến thức: Thiếu thông tin cần thiết.';
            this.isLoading = false;
          }
        },
        error: err => {
          console.error('Lỗi khi lấy tham số route:', err);
          this.error = 'Không thể tải thông tin bài kiểm tra. Vui lòng thử lại sau.';
          this.isLoading = false;
        }
      });
  }
  
  /**
   * Tải thông tin bài kiểm tra kiến thức
   * Load knowledge check information
   */
  loadKnowledgeCheck(): void {
    this.isLoading = true;
    this.error = '';
    
    this.courseService.getKnowledgeCheck(this.courseId, this.knowledgeCheckId)
      .pipe(
        takeUntil(this._onDestroySub),
        finalize(() => {
          if (this.error) {
            this.isLoading = false;
          }
        }),
        catchError(err => {
          console.error('Lỗi khi tải bài kiểm tra kiến thức:', err);
          this.error = 'Không thể tải bài kiểm tra kiến thức. Vui lòng thử lại sau.';
          return of(null);
        })
      )
      .subscribe(check => {
        if (check) {
          this.knowledgeCheck = check;
          this.totalPoints = check.questions.reduce((sum, q) => sum + q.points, 0);
          
          // Check if user has already made attempts
          this.loadUserAttempts();
        } else {
          this.isLoading = false;
        }
      });
  }
  
  /**
   * Tải lịch sử các lần làm bài của người dùng
   * Load user's attempt history
   */
  loadUserAttempts(): void {
    if (!this.courseId || !this.knowledgeCheckId) {
      this.error = 'Không thể tải lịch sử làm bài: Thiếu thông tin cần thiết';
      this.isLoading = false;
      return;
    }
    
    this.courseService.getUserKnowledgeCheckAttempts(this.courseId, this.knowledgeCheckId)
      .pipe(
        takeUntil(this._onDestroySub),
        finalize(() => {
          this.isLoading = false;
        }),
        catchError(err => {
          console.error('Lỗi khi tải lịch sử làm bài:', err);
          // Continue anyway, assuming no attempts
          return of([]);
        })
      )
      .subscribe(attempts => {
        this.attemptCount = attempts.length;
        
        if (attempts.length > 0) {
          // Sort attempts by date, newest first
          attempts.sort((a, b) => 
            new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime()
          );
          
          const lastAttempt = attempts[0];
          if (lastAttempt.passed) {
            this.isCompleted = true;
            this.hasPassed = true;
            this.score = lastAttempt.score;
            this.userAnswers = lastAttempt.answers || {};
          }
        }
        
        // Initialize the form for answering questions
        this.initAnswersForm();
        
        // Start timer if there's a time limit and the user hasn't completed yet
        if (this.knowledgeCheck?.timeLimit && !this.isCompleted) {
          this.startTimer();
        }
      });
  }
  
  /**
   * Khởi tạo form dựa trên loại câu hỏi
   * Initialize form based on question types
   */
  initAnswersForm(): void {
    if (!this.knowledgeCheck?.questions) {
      this.answersForm = this.fb.group({});
      return;
    }
    
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
  
  /**
   * Lấy câu hỏi hiện tại dựa trên chỉ mục
   * Get current question based on index
   * @returns Câu hỏi hiện tại hoặc null nếu không có
   */
  getCurrentQuestion(): KnowledgeQuestion | null {
    if (!this.knowledgeCheck?.questions || this.knowledgeCheck.questions.length === 0) {
      return null;
    }
    
    if (this.currentQuestionIndex >= this.knowledgeCheck.questions.length) {
      return null;
    }
    
    return this.knowledgeCheck.questions[this.currentQuestionIndex];
  }
  
  /**
   * Di chuyển đến câu hỏi tiếp theo
   * Move to the next question
   */
  nextQuestion(): void {
    if (this.currentQuestionIndex < this.knowledgeCheck.questions.length - 1) {
      this.currentQuestionIndex++;
    }
  }
  
  /**
   * Di chuyển đến câu hỏi trước đó
   * Move to the previous question
   */
  previousQuestion(): void {
    if (this.currentQuestionIndex > 0) {
      this.currentQuestionIndex--;
    }
  }
  
  /**
   * Di chuyển đến một câu hỏi cụ thể
   * Go to a specific question
   * @param index Chỉ mục của câu hỏi cần chuyển đến
   */
  goToQuestion(index: number): void {
    if (index >= 0 && index < this.knowledgeCheck.questions.length) {
      this.currentQuestionIndex = index;
    }
  }
  
  /**
   * Kiểm tra xem câu hỏi đã được trả lời chưa
   * Check if a question has been answered
   * @param questionId ID của câu hỏi cần kiểm tra
   * @returns true nếu câu hỏi đã được trả lời
   */
  isQuestionAnswered(questionId: string): boolean {
    const control = this.answersForm.get(questionId);
    return control && control.valid && !control.pristine;
  }
  
  /**
   * Gửi câu trả lời và kết thúc bài kiểm tra
   * Submit answers and complete the knowledge check
   */
  submitAnswers(): void {
    if (this.answersForm.invalid) {
      // Mark all fields as touched to trigger validation messages
      Object.keys(this.answersForm.controls).forEach(key => {
        const control = this.answersForm.get(key);
        control.markAsTouched();
      });
      
      this.notificationService.warning('Vui lòng trả lời tất cả các câu hỏi trước khi nộp bài.');
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
      .pipe(
        takeUntil(this._onDestroySub),
        finalize(() => {
          this.isSubmitting = false;
        }),
        catchError(err => {
          console.error('Lỗi khi nộp bài kiểm tra:', err);
          this.error = 'Không thể nộp bài kiểm tra. Vui lòng thử lại sau.';
          this.notificationService.error('Lỗi khi nộp bài kiểm tra');
          return of(null);
        })
      )
      .subscribe(result => {
        if (result) {
          // Stop timer if running
          this.stopTimer();
          
          this.score = result.score;
          this.hasPassed = result.passed;
          this.isCompleted = true;
          this.userAnswers = userAnswers;
          this.attemptCount++;
          
          if (result.passed) {
            this.notificationService.success('Chúc mừng! Bạn đã hoàn thành bài kiểm tra kiến thức.');
          } else {
            this.notificationService.info('Bạn chưa vượt qua bài kiểm tra. Bạn có thể thử lại sau.');
          }
        }
      });
  }
  
  /**
   * Bắt đầu chế độ xem lại để xem câu trả lời và giải thích
   * Start review mode to see answers and explanations
   */
  startReview(): void {
    this.isReviewing = true;
    this.currentQuestionIndex = 0;
  }
  
  /**
   * Bắt đầu bộ đếm thời gian cho bài kiểm tra
   * Start timer for timed knowledge check
   */
  startTimer(): void {
    if (!this.knowledgeCheck?.timeLimit) return;
    
    this.timeRemaining = this.knowledgeCheck.timeLimit * 60; // Convert minutes to seconds
    
    this.timerInterval = setInterval(() => {
      this.timeRemaining--;
      
      if (this.timeRemaining <= 0) {
        this.stopTimer();
        this.submitAnswers(); // Auto-submit when time runs out
        this.notificationService.warning('Hết thời gian! Bài kiểm tra của bạn đã được nộp tự động.');
      }
    }, 1000);
  }
  
  /**
   * Dừng bộ đếm thời gian
   * Stop the timer
   */
  stopTimer(): void {
    if (this.timerInterval) {
      clearInterval(this.timerInterval);
      this.timerInterval = null;
    }
  }
  
  /**
   * Định dạng thời gian từ giây sang định dạng phút:giây
   * Format time from seconds to minutes:seconds format
   * @param seconds Số giây cần định dạng
   * @returns Chuỗi thời gian định dạng mm:ss
   */
  formatTime(seconds: number): string {
    if (seconds <= 0) return '0:00';
    
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds < 10 ? '0' : ''}${remainingSeconds}`;
  }
  
  /**
   * Bắt đầu làm lại bài kiểm tra
   * Restart the knowledge check
   */
  restartCheck(): void {
    if (this.attemptCount >= this.knowledgeCheck.maxAttempts) {
      this.notificationService.warning(`Bạn đã đạt đến số lần thử tối đa (${this.knowledgeCheck.maxAttempts}) cho bài kiểm tra này.`);
      return;
    }
    
    this.isCompleted = false;
    this.isReviewing = false;
    this.currentQuestionIndex = 0;
    this.initAnswersForm();
    
    if (this.knowledgeCheck.timeLimit) {
      this.startTimer();
    }
    
    this.notificationService.info('Bắt đầu làm lại bài kiểm tra.');
  }
  
  /**
   * Tính phần trăm tiến độ cho thanh tiến trình
   * Calculate percentage for progress bar
   * @returns Phần trăm hoàn thành
   */
  getQuestionProgressPercentage(): number {
    if (!this.knowledgeCheck?.questions || this.knowledgeCheck.questions.length === 0) {
      return 0;
    }
    return ((this.currentQuestionIndex + 1) / this.knowledgeCheck.questions.length) * 100;
  }
  
  /**
   * Kiểm tra xem câu trả lời có đúng không
   * Check if the answer is correct
   * @param questionId ID của câu hỏi cần kiểm tra
   * @returns true nếu câu trả lời đúng
   */
  isAnswerCorrect(questionId: string): boolean {
    if (!this.isCompleted || !this.userAnswers || !this.knowledgeCheck) {
      return false;
    }
    
    const question = this.knowledgeCheck.questions.find(q => q.id === questionId);
    if (!question) return false;
    
    const userAnswer = this.userAnswers[questionId];
    
    if (question.type === 'matching') {
      // For matching questions, compare objects
      const correctAnswers = question.correctAnswer as { [key: string]: string };
      const userMatches = userAnswer as { [key: string]: string };
      
      return Object.keys(correctAnswers).every(
        key => correctAnswers[key] === userMatches[key]
      );
    } else if (Array.isArray(question.correctAnswer)) {
      // For multiple selection questions
      if (!Array.isArray(userAnswer)) return false;
      if (question.correctAnswer.length !== userAnswer.length) return false;
      return question.correctAnswer.every(ans => userAnswer.includes(ans));
    }
    
    // For simple answers (single choice, true/false, fill-in-blank)
    return userAnswer === question.correctAnswer;
  }
  
  /**
   * Dọn dẹp tài nguyên khi component bị hủy
   * Clean up resources when component is destroyed
   */
  override ngOnDestroy(): void {
    this.stopTimer();
    super.ngOnDestroy();
  }
  
  /**
   * Xóa thông báo lỗi
   * Clear error message
   */
  clearError(): void {
    this.error = '';
  }
  
  /**
   * Làm mới bài kiểm tra
   * Refresh the knowledge check
   */
  refreshKnowledgeCheck(): void {
    this.loadKnowledgeCheck();
  }
}
