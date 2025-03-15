import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { BaseComponent } from '@app/shared/components/base/base-component';
import { CourseService } from '@app/shared/services/course.service';
import { takeUntil } from 'rxjs/operators';

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
  
  constructor(
    private route: ActivatedRoute,
    private courseService: CourseService
  ) {
    super();
  }
  
  ngOnInit(): void {
    this.route.parent.paramMap
      .pipe(takeUntil(this._onDestroySub))
      .subscribe(params => {
        this.courseId = params.get('courseId');
        
        this.route.paramMap
          .pipe(takeUntil(this._onDestroySub))
          .subscribe(childParams => {
            this.lessonId = childParams.get('lessonId');
            if (this.courseId && this.lessonId) {
              this.loadExercises();
            }
          });
      });
  }
  
  loadExercises(): void {
    this.isLoading = true;
    
    this.courseService.getLessonExercises(this.courseId, this.lessonId)
      .pipe(takeUntil(this._onDestroySub))
      .subscribe({
        next: (exercises) => {
          this.exercises = exercises;
          this.totalPoints = this.exercises.reduce((sum, exercise) => sum + exercise.points, 0);
          this.earnedPoints = this.exercises
            .filter(ex => ex.completed)
            .reduce((sum, ex) => sum + ex.points, 0);
          
          if (this.exercises.length > 0) {
            this.setCurrentExercise(0);
          }
          
          this.isLoading = false;
        },
        error: (err) => {
          console.error('Error loading exercises:', err);
          this.error = 'Failed to load exercises. Please try again.';
          this.isLoading = false;
        }
      });
  }
  
  setCurrentExercise(index: number): void {
    if (index >= 0 && index < this.exercises.length) {
      this.currentExerciseIndex = index;
      this.currentExercise = this.exercises[index];
      this.resetExerciseState();
    }
  }
  
  resetExerciseState(): void {
    this.selectedAnswer = null;
    this.isShowingFeedback = false;
    this.isCorrect = false;
  }
  
  selectAnswer(answer: any): void {
    this.selectedAnswer = answer;
  }
  
  submitAnswer(): void {
    if (!this.selectedAnswer || !this.currentExercise) return;
    
    this.isSubmitting = true;
    
    const submissionData = {
      exerciseId: this.currentExercise.id,
      answer: this.selectedAnswer
    };
    
    this.courseService.submitExerciseAnswer(this.courseId, this.lessonId, submissionData)
      .pipe(takeUntil(this._onDestroySub))
      .subscribe({
        next: (result) => {
          this.isShowingFeedback = true;
          this.isCorrect = result.correct;
          
          if (result.correct && !this.currentExercise.completed) {
            this.currentExercise.completed = true;
            this.earnedPoints += this.currentExercise.points;
          }
          
          this.isSubmitting = false;
        },
        error: (err) => {
          console.error('Error submitting answer:', err);
          this.error = 'Failed to submit your answer. Please try again.';
          this.isSubmitting = false;
        }
      });
  }
  
  nextExercise(): void {
    if (this.currentExerciseIndex < this.exercises.length - 1) {
      this.setCurrentExercise(this.currentExerciseIndex + 1);
    }
  }
  
  previousExercise(): void {
    if (this.currentExerciseIndex > 0) {
      this.setCurrentExercise(this.currentExerciseIndex - 1);
    }
  }
  
  retryExercise(): void {
    this.resetExerciseState();
  }
  
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
}
