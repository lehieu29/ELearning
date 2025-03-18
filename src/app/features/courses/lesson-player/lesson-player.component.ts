import { Component, OnInit, AfterViewInit, ViewChild, ElementRef, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { BaseComponent } from '@app/shared/components/base/base-component';
import { CourseService } from '@app/shared/services/course.service';
import { NotificationService } from '@app/shared/services/notification.service';
import { Lesson, Attachment } from '@app/shared/models/course.model';
import { takeUntil } from 'rxjs/operators';

@Component({
  selector: 'app-lesson-player',
  templateUrl: './lesson-player.component.html'
})
export class LessonPlayerComponent extends BaseComponent implements OnInit, AfterViewInit {
  @ViewChild('videoPlayer') videoPlayer: ElementRef<HTMLVideoElement>;
  
  courseId: string;
  lessonId: string;
  lesson: Lesson;
  
  videoUrl: string;
  currentTime: number = 0;
  duration: number = 0;
  playbackRate: number = 1;
  volume: number = 1;
  isPlaying: boolean = false;
  isMuted: boolean = false;
  isFullscreen: boolean = false;
  showTranscript: boolean = false;
  showAnnotations: boolean = false;
  playerMode: 'normal' | 'picture-in-picture' = 'normal';
  
  isLoading: boolean = true;
  error: string = '';
  completionTracked: boolean = false;
  completionThreshold: number = 0.9; // 90% watched to mark as completed
  
  // Course navigation
  nextLessonId: string | null = null;
  prevLessonId: string | null = null;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private courseService: CourseService,
    private notificationService: NotificationService
  ) {
    super();
  }

  /**
   * Khởi tạo component và đăng ký theo dõi các tham số từ URL
   * Initialize component and subscribe to URL parameters
   */
  ngOnInit(): void {
    this.route.parent.paramMap
      .pipe(takeUntil(this._onDestroySub))
      .subscribe(params => {
        this.courseId = params.get('courseId');
      });

    this.route.paramMap
      .pipe(takeUntil(this._onDestroySub))
      .subscribe(params => {
        this.lessonId = params.get('lessonId');
        if (this.courseId && this.lessonId) {
          this.loadLessonData();
        }
      });
  }

  /**
   * Thiết lập các sự kiện cho video player sau khi view được khởi tạo
   * Set up video player events after view initialization
   */
  ngAfterViewInit(): void {
    if (this.videoPlayer) {
      const video = this.videoPlayer.nativeElement;
      
      video.addEventListener('loadedmetadata', () => {
        this.duration = video.duration;
      });
      
      video.addEventListener('timeupdate', () => {
        this.currentTime = video.currentTime;
        
        // Track completion when 90% of the video is watched
        if (!this.completionTracked && video.currentTime > this.duration * this.completionThreshold) {
          this.trackCompletion();
        }
      });
      
      video.addEventListener('play', () => {
        this.isPlaying = true;
      });
      
      video.addEventListener('pause', () => {
        this.isPlaying = false;
      });
      
      video.addEventListener('volumechange', () => {
        this.isMuted = video.muted;
        this.volume = video.volume;
      });
      
      video.addEventListener('error', (e) => {
        console.error('Lỗi video:', e);
        this.error = 'Có lỗi xảy ra khi phát video. Vui lòng thử lại sau.';
      });
    }
  }

  /**
   * Tải dữ liệu bài học từ API
   * Load lesson data from API
   */
  loadLessonData(): void {
    this.isLoading = true;
    this.error = '';
    
    this.courseService.getLessonById(this.courseId, this.lessonId)
      .pipe(takeUntil(this._onDestroySub))
      .subscribe({
        next: (lesson) => {
          this.lesson = lesson;
          this.videoUrl = lesson.videoUrl;
          this.loadNavigationData();
          
          // Reset completion tracking for a new lesson
          this.completionTracked = false;
          
          // Check if this lesson was already completed in the past
          if (lesson.isCompleted) {
            this.completionTracked = true;
          }
          
          this.isLoading = false;
        },
        error: (err) => {
          console.error('Lỗi khi tải dữ liệu bài học:', err);
          this.error = 'Không thể tải nội dung bài học. Vui lòng thử lại sau.';
          this.isLoading = false;
        }
      });
  }

  /**
   * Tải dữ liệu điều hướng (bài học trước/sau)
   * Load navigation data (previous/next lesson)
   */
  loadNavigationData(): void {
    this.courseService.getLessonNavigation(this.courseId, this.lessonId)
      .pipe(takeUntil(this._onDestroySub))
      .subscribe({
        next: (navigation) => {
          this.prevLessonId = navigation.prevLessonId;
          this.nextLessonId = navigation.nextLessonId;
        },
        error: (err) => {
          console.error('Lỗi khi tải dữ liệu điều hướng:', err);
          // Silent fail - non-critical feature
        }
      });
  }

  /**
   * Điều khiển phát/tạm dừng video
   * Toggle play/pause of the video
   */
  togglePlay(): void {
    const video = this.videoPlayer?.nativeElement;
    if (!video) return;
    
    if (video.paused) {
      video.play()
        .catch(err => {
          console.error('Lỗi khi phát video:', err);
          this.notificationService.error('Không thể phát video. Vui lòng thử lại.');
        });
    } else {
      video.pause();
    }
  }

  /**
   * Điều khiển tắt/bật tiếng
   * Toggle mute/unmute of the video
   */
  toggleMute(): void {
    const video = this.videoPlayer?.nativeElement;
    if (!video) return;
    
    video.muted = !video.muted;
  }

  /**
   * Điều chỉnh âm lượng
   * Adjust volume
   * @param value Giá trị âm lượng mới (0-1)
   */
  setVolume(value: number): void {
    const video = this.videoPlayer?.nativeElement;
    if (!video) return;
    
    video.volume = value;
    if (value > 0 && video.muted) {
      video.muted = false;
    }
  }

  /**
   * Điều chỉnh tốc độ phát
   * Set playback rate
   * @param rate Tốc độ phát (0.5, 1, 1.5, 2)
   */
  setPlaybackRate(rate: number): void {
    const video = this.videoPlayer?.nativeElement;
    if (!video) return;
    
    video.playbackRate = rate;
    this.playbackRate = rate;
  }

  /**
   * Tua đến vị trí cụ thể trong video
   * Seek to a specific position in the video
   * @param time Thời gian (giây) cần tua đến
   */
  seekTo(time: number): void {
    const video = this.videoPlayer?.nativeElement;
    if (!video) return;
    
    // Ensure time is within valid range
    const validTime = Math.max(0, Math.min(time, video.duration));
    video.currentTime = validTime;
  }

  /**
   * Chuyển đổi chế độ toàn màn hình
   * Toggle fullscreen mode
   */
  toggleFullscreen(): void {
    const videoContainer = this.videoPlayer?.nativeElement.parentElement;
    if (!videoContainer) return;
    
    if (!document.fullscreenElement) {
      videoContainer.requestFullscreen().catch(err => {
        console.error('Lỗi khi chuyển sang chế độ toàn màn hình:', err);
        this.notificationService.error('Không thể chuyển sang chế độ toàn màn hình.');
      });
      this.isFullscreen = true;
    } else {
      document.exitFullscreen().catch(err => {
        console.error('Lỗi khi thoát chế độ toàn màn hình:', err);
      });
      this.isFullscreen = false;
    }
  }

  /**
   * Chuyển đổi chế độ hình trong hình
   * Toggle picture-in-picture mode
   */
  togglePictureInPicture(): void {
    const video = this.videoPlayer?.nativeElement;
    if (!video) return;
    
    if (document.pictureInPictureElement !== video) {
      video.requestPictureInPicture().catch(err => {
        console.error('Lỗi khi chuyển sang chế độ hình trong hình:', err);
        this.notificationService.error('Không hỗ trợ chế độ hình trong hình trên trình duyệt này.');
      });
      this.playerMode = 'picture-in-picture';
    } else {
      document.exitPictureInPicture().catch(err => {
        console.error('Lỗi khi thoát chế độ hình trong hình:', err);
      });
      this.playerMode = 'normal';
    }
  }

  /**
   * Chuyển đổi hiển thị phụ đề
   * Toggle transcript display
   */
  toggleTranscript(): void {
    this.showTranscript = !this.showTranscript;
    
    // Auto-hide annotations if both are active
    if (this.showTranscript && this.showAnnotations) {
      this.showAnnotations = false;
    }
  }

  /**
   * Chuyển đổi hiển thị công cụ chú thích
   * Toggle annotation tools
   */
  toggleAnnotationTools(): void {
    this.showAnnotations = !this.showAnnotations;
    
    // Auto-hide transcript if both are active
    if (this.showAnnotations && this.showTranscript) {
      this.showTranscript = false;
    }
  }

  /**
   * Điều hướng đến bài học tiếp theo
   * Navigate to next lesson
   */
  goToNextLesson(): void {
    if (this.nextLessonId) {
      // Pause video before navigation
      if (this.videoPlayer?.nativeElement) {
        this.videoPlayer.nativeElement.pause();
      }
      
      this.router.navigate(['/courses', this.courseId, 'lessons', this.nextLessonId])
        .then(() => {
          this.notificationService.info('Đã chuyển đến bài học tiếp theo');
        })
        .catch(err => {
          console.error('Lỗi khi điều hướng đến bài học tiếp theo:', err);
        });
    } else {
      this.notificationService.info('Đây là bài học cuối cùng của khóa học');
    }
  }

  /**
   * Điều hướng đến bài học trước đó
   * Navigate to previous lesson
   */
  goToPrevLesson(): void {
    if (this.prevLessonId) {
      // Pause video before navigation
      if (this.videoPlayer?.nativeElement) {
        this.videoPlayer.nativeElement.pause();
      }
      
      this.router.navigate(['/courses', this.courseId, 'lessons', this.prevLessonId])
        .then(() => {
          this.notificationService.info('Đã chuyển đến bài học trước đó');
        })
        .catch(err => {
          console.error('Lỗi khi điều hướng đến bài học trước đó:', err);
        });
    } else {
      this.notificationService.info('Đây là bài học đầu tiên của khóa học');
    }
  }

  /**
   * Định dạng thời gian từ giây sang MM:SS
   * Format time from seconds to MM:SS format
   * @param time Thời gian cần định dạng tính bằng giây
   * @returns Chuỗi thời gian dạng MM:SS
   */
  formatTime(time: number): string {
    if (isNaN(time) || time === Infinity) {
      return '0:00';
    }
    
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
  }

  /**
   * Theo dõi tiến độ hoàn thành bài học
   * Track lesson completion progress
   */
  trackCompletion(): void {
    if (this.completionTracked) return;
    
    this.courseService.markLessonComplete(this.courseId, this.lessonId)
      .pipe(takeUntil(this._onDestroySub))
      .subscribe({
        next: () => {
          this.completionTracked = true;
          this.notificationService.success('Tiến độ bài học đã được lưu lại');
        },
        error: (err) => {
          console.error('Lỗi khi theo dõi hoàn thành bài học:', err);
          // Silent fail - will try again later
        }
      });
  }

  /**
   * Tải xuống tài liệu đính kèm
   * Download an attachment
   * @param attachment Tài liệu đính kèm cần tải xuống
   */
  downloadAttachment(attachment: Attachment): void {
    if (!attachment || !attachment.url) {
      this.notificationService.error('Không thể tải xuống tài liệu này');
      return;
    }
    
    const link = document.createElement('a');
    link.href = attachment.url;
    link.download = attachment.title || 'download';
    link.target = '_blank';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  /**
   * Tải về video bài học
   * Download lesson video
   */
  downloadVideo(): void {
    if (!this.videoUrl) {
      this.notificationService.error('Không thể tải xuống video này');
      return;
    }
    
    const filename = `${this.lesson?.title || 'lesson'}.mp4`;
    
    this.notificationService.info('Đang chuẩn bị tải xuống video...');
    
    const a = document.createElement('a');
    a.href = this.videoUrl;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  }

  /**
   * Báo cáo vấn đề với video hoặc nội dung
   * Report an issue with the video or content
   */
  reportIssue(): void {
    // In a real implementation, this would open a modal or form
    this.notificationService.info('Tính năng báo cáo vấn đề sẽ sớm được cập nhật');
  }

  /**
   * Quay lại trang tổng quan khóa học
   * Return to course overview page
   */
  returnToCourse(): void {
    this.router.navigate(['/courses', this.courseId]);
  }
}
