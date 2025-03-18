import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { BaseComponent } from '@app/shared/components/base/base-component';
import { CourseService } from '@app/shared/services/course.service';
import { takeUntil, finalize, catchError } from 'rxjs/operators';
import { of } from 'rxjs';
import { NotificationService } from '@app/shared/services/notification.service';

interface Exercise {
  id: string;
  title: string;
  description: string;
  type: 'multiple-choice' | 'drag-drop' | 'fill-blank' | 'code' | 'match';
  difficulty: 'easy' | 'medium' | 'hard';
  completed: boolean;
  content: any;
  points: number;
}

@Component({
  selector: 'app-interactive-exercises',
  templateUrl: './interactive-exercises.component.html'
})
export class InteractiveExercisesComponent extends BaseComponent implements OnInit {
  courseId: string;
  lessonId: string;
  
  exercises: Exercise[] = [];
  currentExercise: Exercise | null = null;
  currentExerciseIndex = 0;
  
  isLoading = true;
  isSubmitting = false;
  isShowingFeedback = false;
  error: string = '';
  
  selectedAnswer: any = null;
  isCorrect: boolean = false;
  
  totalPoints = 0;
  earnedPoints = 0;

  /**
   * Khởi tạo component với các dependencies cần thiết
   * Initialize the component with required dependencies
   * @param route Service cung cấp quyền truy cập vào thông tin về route
   * @param courseService Service quản lý dữ liệu khóa học
   * @param notificationService Service hiển thị thông báo
   */
  constructor(
    private route: ActivatedRoute,
    private courseService: CourseService,
    private notificationService: NotificationService
  ) {
    super();
  }

  /**
   * Khởi tạo component và đọc thông tin từ route
   * Initialize component and read information from route
   */
  ngOnInit(): void {
    this.route.parent.paramMap
      .pipe(
        takeUntil(this._onDestroySub),
        switchMap(params => {
          // Lưu courseId từ route cha
          this.courseId = params.get('courseId');
          
          // Đọc thông tin về lessonId từ route con
          // switchMap sẽ tự động hủy subscription cũ khi có dữ liệu mới từ route.parent.paramMap
          return this.route.paramMap.pipe(
            map(childParams => {
              // Kết hợp cả courseId và lessonId thành một object để xử lý trong subscribe
              return {
                courseId: this.courseId,
                lessonId: childParams.get('lessonId')
              };
            })
          );
        })
      )
      .subscribe({
        next: ({ courseId, lessonId }) => {
          this.lessonId = lessonId;
          if (courseId && lessonId) {
            // Nếu có đủ thông tin, load dữ liệu bài tập
            this.loadExercises();
          } else {
            // Nếu thiếu thông tin, hiển thị lỗi
            this.error = 'Không thể tải bài tập: Thiếu thông tin khóa học hoặc bài học.';
            this.isLoading = false;
          }
        },
        error: err => {
          // Xử lý lỗi từ bất kỳ observable nào trong pipe
          console.error('Lỗi khi đọc thông tin route:', err);
          this.error = 'Không thể tải thông tin. Vui lòng thử lại sau.';
          this.isLoading = false;
        }
      });
  }

  /**
   * Tải danh sách bài tập tương tác từ API
   * Load interactive exercises from API
   */
  loadExercises(): void {
    this.isLoading = true;
    this.error = '';
    
    this.courseService.getLessonExercises(this.courseId, this.lessonId)
      .pipe(
        takeUntil(this._onDestroySub),
        finalize(() => {
          this.isLoading = false;
        }),
        catchError(err => {
          console.error('Lỗi khi tải bài tập:', err);
          this.error = 'Không thể tải bài tập. Vui lòng thử lại sau.';
          return of([]);
        })
      )
      .subscribe(exercises => {
        this.exercises = exercises;
        
        // Tính tổng điểm và điểm đã đạt được
        // Calculate total points and points earned
        this.calculatePoints();
        
        if (this.exercises.length > 0) {
          this.setCurrentExercise(0);
        }
      });
  }
  
  /**
   * Tính toán tổng điểm và điểm đã đạt được từ các bài tập
   * Calculate total points and earned points from exercises
   */
  calculatePoints(): void {
    this.totalPoints = this.exercises.reduce((sum, exercise) => sum + exercise.points, 0);
    this.earnedPoints = this.exercises
      .filter(ex => ex.completed)
      .reduce((sum, ex) => sum + ex.points, 0);
  }

  /**
   * Chọn và hiển thị bài tập tại vị trí chỉ định
   * Select and display the exercise at the specified index
   * @param index Vị trí của bài tập trong danh sách
   */
  setCurrentExercise(index: number): void {
    if (index >= 0 && index < this.exercises.length) {
      this.currentExerciseIndex = index;
      this.currentExercise = this.exercises[index];
      this.resetExerciseState();
    }
  }

  /**
   * Đặt lại trạng thái của bài tập hiện tại
   * Reset the current exercise state
   */
  resetExerciseState(): void {
    this.selectedAnswer = null;
    this.isShowingFeedback = false;
    this.isCorrect = false;
  }

  /**
   * Chọn câu trả lời cho bài tập hiện tại
   * Select answer for the current exercise
   * @param answer Câu trả lời được chọn
   */
  selectAnswer(answer: any): void {
    this.selectedAnswer = answer;
  }

  /**
   * Gửi câu trả lời của người dùng để kiểm tra
   * Submit user's answer for evaluation
   */
  submitAnswer(): void {
    if (this.selectedAnswer === null || !this.currentExercise) {
      this.notificationService.warning('Vui lòng chọn câu trả lời trước khi nộp.');
      return;
    }
    
    this.isSubmitting = true;
    
    const submissionData = {
      exerciseId: this.currentExercise.id,
      answer: this.selectedAnswer
    };
    
    this.courseService.submitExerciseAnswer(this.courseId, this.lessonId, submissionData)
      .pipe(
        takeUntil(this._onDestroySub),
        finalize(() => {
          this.isSubmitting = false;
        }),
        catchError(err => {
          console.error('Lỗi khi gửi câu trả lời:', err);
          this.error = 'Không thể gửi câu trả lời. Vui lòng thử lại sau.';
          this.notificationService.error('Đã xảy ra lỗi khi gửi câu trả lời.');
          return of({ correct: false });
        })
      )
      .subscribe(result => {
        this.isShowingFeedback = true;
        this.isCorrect = result.correct;
        
        if (result.correct && !this.currentExercise.completed) {
          // Cập nhật trạng thái hoàn thành và điểm số
          // Update completion status and points
          this.currentExercise.completed = true;
          this.earnedPoints += this.currentExercise.points;
          
          // Thông báo kết quả
          // Notify result
          this.notificationService.success('Chính xác! Bạn đã nhận được ' + this.currentExercise.points + ' điểm.');
        } else if (!result.correct) {
          this.notificationService.info('Rất tiếc! Câu trả lời chưa chính xác.');
        }
      });
  }

  /**
   * Di chuyển đến bài tập tiếp theo trong danh sách
   * Move to the next exercise in the list
   */
  nextExercise(): void {
    if (this.currentExerciseIndex < this.exercises.length - 1) {
      this.setCurrentExercise(this.currentExerciseIndex + 1);
    }
  }

  /**
   * Di chuyển đến bài tập trước đó trong danh sách
   * Move to the previous exercise in the list
   */
  previousExercise(): void {
    if (this.currentExerciseIndex > 0) {
      this.setCurrentExercise(this.currentExerciseIndex - 1);
    }
  }

  /**
   * Làm lại bài tập hiện tại
   * Retry the current exercise
   */
  retryExercise(): void {
    this.resetExerciseState();
  }

  /**
   * Lấy lớp CSS dựa trên độ khó của bài tập
   * Get CSS class based on exercise difficulty
   * @param difficulty Độ khó của bài tập
   * @returns Tên lớp CSS tương ứng với độ khó
   */
  getDifficultyClass(difficulty: string): string {
    switch(difficulty) {
      case 'easy':
        return 'bg-green-100 text-green-800';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800';
      case 'hard':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  }
  
  /**
   * Đánh dấu một bài tập là đã hoàn thành
   * Mark an exercise as completed
   * @param exercise Bài tập cần đánh dấu hoàn thành
   */
  markExerciseAsCompleted(exercise: Exercise): void {
    if (exercise.completed) return;
    
    this.courseService.markExerciseAsCompleted(this.courseId, this.lessonId, exercise.id)
      .pipe(
        takeUntil(this._onDestroySub),
        catchError(err => {
          console.error('Lỗi khi đánh dấu bài tập hoàn thành:', err);
          return of(false);
        })
      )
      .subscribe(success => {
        if (success) {
          exercise.completed = true;
          this.earnedPoints += exercise.points;
          this.notificationService.success('Bài tập đã được đánh dấu là hoàn thành.');
        }
      });
  }
  
  /**
   * Kiểm tra xem đã hoàn thành tất cả bài tập chưa
   * Check if all exercises are completed
   * @returns true nếu tất cả bài tập đã hoàn thành
   */
  areAllExercisesCompleted(): boolean {
    return this.exercises.length > 0 && this.exercises.every(ex => ex.completed);
  }
  
  /**
   * Tính phần trăm tiến độ hoàn thành
   * Calculate completion progress percentage
   * @returns Phần trăm hoàn thành
   */
  getProgressPercentage(): number {
    if (this.totalPoints === 0) return 0;
    return Math.round((this.earnedPoints / this.totalPoints) * 100);
  }
}
