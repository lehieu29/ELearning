import { Component, OnInit, ViewChild, ElementRef, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { BaseComponent } from '@app/shared/components/base/base-component';
import { CourseService } from '../services/course.service';
import { Lesson } from '../models/lesson.model';

@Component({
  selector: 'app-lesson-player',
  templateUrl: './lesson-player.component.html'
})
export class LessonPlayerComponent extends BaseComponent implements OnInit, OnDestroy {
  @ViewChild('videoPlayer') videoPlayer: ElementRef<HTMLVideoElement>;
  
  courseId: string;
  lessonId: string;
  lesson: Lesson | null = null;
  isLoading = true;
  error: string = '';
  playbackSpeed: number = 1;
  showTranscript: boolean = false;
  showAnnotationTools: boolean = false;
  isPictureInPictureActive: boolean = false;
  
  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private courseService: CourseService
  ) {
    super();
  }
  
  ngOnInit(): void {
    this.route.params
      .pipe(takeUntil(this._onDestroySub))
      .subscribe(params => {
        this.courseId = params['courseId'];
        this.lessonId = params['lessonId'];
        
        if (this.courseId && this.lessonId) {
          this.loadLesson();
        }
      });
  }
  
  loadLesson(): void {
    this.isLoading = true;
    
    this.courseService.getLessonById(this.courseId, this.lessonId)
      .pipe(takeUntil(this._onDestroySub))
      .subscribe({
        next: (lesson) => {
          this.lesson = lesson;
          this.isLoading = false;
        },
        error: (error) => {
          this.error = 'Failed to load lesson. Please try again.';
          this.isLoading = false;
          console.error('Error loading lesson:', error);
        }
      });
  }
  
  onVideoEnded(): void {
    // Mark the lesson as completed
    if (this.courseId && this.lessonId) {
      this.courseService.markLessonComplete(this.courseId, this.lessonId)
        .pipe(takeUntil(this._onDestroySub))
        .subscribe({
          next: () => {
            // Navigate to next lesson if available
            if (this.lesson && this.lesson.nextLessonId) {
              this.router.navigate(['/course', this.courseId, 'lesson', this.lesson.nextLessonId]);
            }
          },
          error: (error) => {
            console.error('Error marking lesson as complete:', error);
          }
        });
    }
  }
  
  onSpeedChange(speed: number): void {
    this.playbackSpeed = speed;
    if (this.videoPlayer?.nativeElement) {
      this.videoPlayer.nativeElement.playbackRate = speed;
    }
  }
  
  toggleTranscript(): void {
    this.showTranscript = !this.showTranscript;
  }
  
  toggleAnnotationTools(): void {
    this.showAnnotationTools = !this.showAnnotationTools;
  }
  
  togglePictureInPicture(): void {
    if (document.pictureInPictureElement) {
      document.exitPictureInPicture()
        .then(() => {
          this.isPictureInPictureActive = false;
        })
        .catch(error => {
          console.error('Error exiting picture-in-picture mode:', error);
        });
    } else if (this.videoPlayer?.nativeElement) {
      this.videoPlayer.nativeElement.requestPictureInPicture()
        .then(() => {
          this.isPictureInPictureActive = true;
        })
        .catch(error => {
          console.error('Error entering picture-in-picture mode:', error);
        });
    }
  }
}
