import { Component, Input, Output, EventEmitter, OnChanges, SimpleChanges } from '@angular/core';
import { BaseComponent } from '@app/shared/components/base/base-component';
import { CourseService } from '@app/shared/services/course.service';
import { takeUntil } from 'rxjs/operators';

interface TranscriptSegment {
  id: string;
  start: number; // Time in seconds
  end: number;   // Time in seconds
  text: string;
  isActive: boolean;
}

@Component({
  selector: 'app-transcript',
  templateUrl: './transcript.component.html'
})
export class TranscriptComponent extends BaseComponent implements OnChanges {
  @Input() courseId: string;
  @Input() lessonId: string;
  @Input() currentTime: number = 0;
  @Input() videoUrl: string;
  @Output() seekTo = new EventEmitter<number>();
  
  isLoading: boolean = true;
  error: string = '';
  segments: TranscriptSegment[] = [];
  activeSegmentId: string | null = null;
  
  // Display options
  isExpanded: boolean = true;
  isAutoscroll: boolean = true;
  isSearching: boolean = false;
  searchQuery: string = '';
  filteredSegments: TranscriptSegment[] = [];
  
  constructor(private courseService: CourseService) {
    super();
  }
  
  /**
   * Xử lý khi các Input thay đổi để cập nhật phụ đề và trạng thái hoạt động
   * Handle changes to input properties to update transcript and active state
   * @param changes Các thay đổi của các input properties
   */
  ngOnChanges(changes: SimpleChanges): void {
    // Load transcript when lessonId changes
    if ((changes.lessonId && !changes.lessonId.firstChange) || 
        (changes.courseId && !changes.courseId.firstChange)) {
      this.loadTranscript();
    }
    
    // Update active segment when currentTime changes
    if (changes.currentTime && !changes.currentTime.firstChange) {
      this.updateActiveSegment();
    }
  }
  
  /**
   * Tải nội dung phụ đề từ API dựa trên khóa học và bài học
   * Load transcript content from API based on course and lesson
   */
  loadTranscript(): void {
    if (!this.courseId || !this.lessonId) {
      return;
    }
    
    this.isLoading = true;
    this.error = '';
    
    this.courseService.getLessonTranscript(this.courseId, this.lessonId)
      .pipe(takeUntil(this._onDestroySub))
      .subscribe({
        next: (transcript) => {
          this.segments = transcript.map(segment => ({
            ...segment,
            isActive: false
          }));
          this.filteredSegments = [...this.segments];
          this.isLoading = false;
          this.updateActiveSegment();
        },
        error: (err) => {
          console.error('Lỗi khi tải nội dung phụ đề:', err);
          this.error = 'Không thể tải nội dung phụ đề. Vui lòng thử lại sau.';
          this.isLoading = false;
          this.segments = [];
          this.filteredSegments = [];
        }
      });
  }
  
  /**
   * Cập nhật đoạn phụ đề hiện tại đang hoạt động dựa trên thời gian video hiện tại
   * Update which transcript segment is active based on current video time
   */
  updateActiveSegment(): void {
    if (!this.segments.length || this.currentTime === undefined) {
      return;
    }
    
    // Tìm đoạn phụ đề tương ứng với thời gian hiện tại
    // Find the segment that corresponds to the current time
    const activeSegment = this.segments.find(
      segment => this.currentTime >= segment.start && this.currentTime < segment.end
    );
    
    // Đặt lại tất cả các đoạn phụ đề về trạng thái không hoạt động
    // Reset all segments to inactive
    this.segments.forEach(segment => segment.isActive = false);
    
    // Đánh dấu đoạn phụ đề đang hoạt động
    // Mark the active segment
    if (activeSegment) {
      activeSegment.isActive = true;
      this.activeSegmentId = activeSegment.id;
      
      // Tự động cuộn đến đoạn phụ đề đang hoạt động nếu được bật
      // Auto-scroll to active segment if enabled
      if (this.isAutoscroll) {
        this.scrollToActiveSegment();
      }
    }
    
    // Đảm bảo danh sách đã lọc cũng được cập nhật
    // Ensure filtered list is also updated
    this.updateFilteredSegments();
  }
  
  /**
   * Cuộn đến đoạn phụ đề đang hoạt động trên giao diện
   * Scroll to active transcript segment in the UI
   */
  scrollToActiveSegment(): void {
    if (!this.activeSegmentId) return;
    
    setTimeout(() => {
      const element = document.getElementById(`segment-${this.activeSegmentId}`);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }, 100);
  }
  
  /**
   * Xử lý khi người dùng nhấp vào một đoạn phụ đề để di chuyển video đến thời điểm đó
   * Handle when user clicks on a transcript segment to seek the video to that time
   * @param time Thời gian (giây) để di chuyển đến
   */
  onSegmentClick(time: number): void {
    this.seekTo.emit(time);
  }
  
  /**
   * Chuyển đổi chế độ hiển thị phụ đề (thu gọn/mở rộng)
   * Toggle transcript display mode (collapsed/expanded)
   */
  toggleExpand(): void {
    this.isExpanded = !this.isExpanded;
  }
  
  /**
   * Chuyển đổi tính năng tự động cuộn
   * Toggle auto-scroll feature
   */
  toggleAutoscroll(): void {
    this.isAutoscroll = !this.isAutoscroll;
    if (this.isAutoscroll) {
      this.scrollToActiveSegment();
    }
  }
  
  /**
   * Chuyển đổi chế độ tìm kiếm
   * Toggle search mode
   */
  toggleSearch(): void {
    this.isSearching = !this.isSearching;
    if (!this.isSearching) {
      this.searchQuery = '';
      this.filterSegments();
    } else {
      // Focus on search input when search is enabled
      setTimeout(() => {
        const searchInput = document.querySelector('.transcript-search-input');
        if (searchInput) {
          (searchInput as HTMLInputElement).focus();
        }
      }, 100);
    }
  }
  
  /**
   * Lọc các đoạn phụ đề dựa trên từ khóa tìm kiếm
   * Filter transcript segments based on search query
   */
  filterSegments(): void {
    if (!this.searchQuery.trim()) {
      this.filteredSegments = [...this.segments];
      return;
    }
    
    const query = this.searchQuery.toLowerCase();
    this.filteredSegments = this.segments.filter(
      segment => segment.text.toLowerCase().includes(query)
    );
  }
  
  /**
   * Cập nhật danh sách đoạn phụ đề đã lọc để giữ trạng thái hoạt động
   * Update filtered segments list while preserving active state
   */
  private updateFilteredSegments(): void {
    if (!this.searchQuery.trim()) {
      this.filteredSegments = [...this.segments];
      return;
    }
    
    // Bảo toàn trạng thái hoạt động khi áp dụng bộ lọc
    // Preserve active state when applying filter
    const query = this.searchQuery.toLowerCase();
    this.filteredSegments = this.segments.filter(
      segment => segment.text.toLowerCase().includes(query)
    ).map(segment => ({
      ...segment
    }));
  }
  
  /**
   * Định dạng thời gian từ giây sang định dạng MM:SS
   * Format time from seconds to MM:SS format
   * @param seconds Thời gian tính bằng giây
   * @returns Chuỗi thời gian đã định dạng
   */
  formatTime(seconds: number): string {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  }
}
