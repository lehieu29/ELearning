import { Component, Input, OnInit, OnChanges, SimpleChanges, Output, EventEmitter } from '@angular/core';
import { BaseComponent } from '@app/shared/components/base/base-component';
import { CourseService } from '@app/shared/services/course.service';
import { takeUntil } from 'rxjs/operators';

interface Timestamp {
  id: string;
  time: number; // in seconds
  label: string;
  description?: string;
  tags?: string[];
}

@Component({
  selector: 'app-interactive-timestamp',
  templateUrl: './interactive-timestamp.component.html'
})
export class InteractiveTimestampComponent extends BaseComponent implements OnInit, OnChanges {
  @Input() courseId: string;
  @Input() lessonId: string;
  @Input() timestamps: Timestamp[] = [];
  @Input() videoElement: HTMLVideoElement;
  @Input() autoLoad: boolean = true;
  
  @Output() seekRequested = new EventEmitter<number>();
  
  sortedTimestamps: Timestamp[] = [];
  expandedTimestamp: string | null = null;
  isLoading: boolean = false;
  error: string = '';
  
  constructor(private courseService: CourseService) {
    super();
  }
  
  /**
   * Khởi tạo component và tải dữ liệu mốc thời gian nếu cần
   * Initialize component and load timestamp data if needed
   */
  ngOnInit(): void {
    this.processTimestamps();
    
    if (this.autoLoad && this.courseId && this.lessonId && (!this.timestamps || this.timestamps.length === 0)) {
      this.loadTimestamps();
    }
  }

  /**
   * Xử lý khi các Input thay đổi
   * Handle when Input properties change
   * @param changes Các thay đổi của Input
   */
  ngOnChanges(changes: SimpleChanges): void {
    if (changes.timestamps && !changes.timestamps.firstChange) {
      this.processTimestamps();
    }
    
    if ((changes.courseId || changes.lessonId) && this.autoLoad && this.courseId && this.lessonId) {
      this.loadTimestamps();
    }
  }

  /**
   * Tải dữ liệu mốc thời gian từ API
   * Load timestamp data from API
   */
  loadTimestamps(): void {
    this.isLoading = true;
    this.error = '';
    
    this.courseService.getLessonTimestamps(this.courseId, this.lessonId)
      .pipe(takeUntil(this._onDestroySub))
      .subscribe({
        next: (timestamps) => {
          this.timestamps = timestamps;
          this.processTimestamps();
          this.isLoading = false;
        },
        error: (err) => {
          console.error('Lỗi khi tải dữ liệu mốc thời gian:', err);
          this.error = 'Không thể tải mốc thời gian. Vui lòng thử lại sau.';
          this.isLoading = false;
        }
      });
  }

  /**
   * Xử lý và sắp xếp mốc thời gian
   * Process and sort timestamps
   */
  processTimestamps(): void {
    if (this.timestamps && this.timestamps.length) {
      // Sắp xếp mốc thời gian theo thứ tự tăng dần
      // Sort timestamps in ascending order
      this.sortedTimestamps = [...this.timestamps].sort((a, b) => a.time - b.time);
    } else {
      this.sortedTimestamps = [];
    }
  }

  /**
   * Điều hướng video đến mốc thời gian cụ thể
   * Navigate video to specific timestamp
   * @param time Thời gian cần di chuyển đến (giây)
   */
  seekToTimestamp(time: number): void {
    if (this.videoElement) {
      this.videoElement.currentTime = time;
      this.videoElement.play().catch(err => {
        console.error('Lỗi khi phát video:', err);
      });
    }
    
    // Thông báo sự kiện tìm kiếm ra ngoài
    // Emit seek event for external handling
    this.seekRequested.emit(time);
  }

  /**
   * Định dạng thời gian từ giây sang MM:SS
   * Format time from seconds to MM:SS
   * @param seconds Thời gian tính bằng giây
   * @returns Chuỗi định dạng MM:SS
   */
  formatTime(seconds: number): string {
    if (seconds === undefined || seconds === null) return '0:00';
    
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  }

  /**
   * Chuyển đổi hiển thị/ẩn mô tả của mốc thời gian
   * Toggle the visibility of timestamp description
   * @param id ID của mốc thời gian
   */
  toggleExpand(id: string): void {
    if (this.expandedTimestamp === id) {
      this.expandedTimestamp = null;
    } else {
      this.expandedTimestamp = id;
    }
  }
  
  /**
   * Lấy mốc thời gian theo ID
   * Get timestamp by ID
   * @param id ID của mốc thời gian
   * @returns Đối tượng mốc thời gian hoặc null
   */
  getTimestampById(id: string): Timestamp | null {
    return this.timestamps.find(t => t.id === id) || null;
  }
  
  /**
   * Lấy mốc thời gian hiện tại dựa trên thời gian của video
   * Get current timestamp based on video time
   * @param currentTime Thời gian hiện tại của video (giây)
   * @returns Mốc thời gian hiện tại hoặc null
   */
  getCurrentTimestamp(currentTime: number): Timestamp | null {
    if (!this.sortedTimestamps.length) return null;
    
    // Tìm mốc thời gian gần nhất trước currentTime
    // Find the nearest timestamp before currentTime
    for (let i = this.sortedTimestamps.length - 1; i >= 0; i--) {
      if (this.sortedTimestamps[i].time <= currentTime) {
        return this.sortedTimestamps[i];
      }
    }
    
    return null;
  }
}
