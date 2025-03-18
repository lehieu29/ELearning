import { Component, Input, OnInit } from '@angular/core';
import { BaseComponent } from '@app/shared/components/base/base-component';
import { CourseService } from '@app/shared/services/course.service';
import { NotificationService } from '@app/shared/services/notification.service';
import { takeUntil, finalize, catchError } from 'rxjs/operators';
import { of } from 'rxjs';

interface PlagiarismResult {
  score: number;
  matches: {
    source: string;
    matchPercentage: number;
    snippets: {
      text: string;
      sourceText: string;
      matchPercentage: number;
    }[];
  }[];
  status: 'not-checked' | 'checking' | 'checked' | 'error';
  lastCheckedDate?: Date;
}

@Component({
  selector: 'app-plagiarism-checker',
  templateUrl: './plagiarism-checker.component.html'
})
export class PlagiarismCheckerComponent extends BaseComponent implements OnInit {
  @Input() courseId: string;
  @Input() assignmentId: string;
  
  isLoading = true;
  error: string = '';
  checkInProgress = false;
  result: PlagiarismResult | null = null;
  
  expandedMatches: Set<number> = new Set();
  
  /**
   * Khởi tạo thành phần với các dịch vụ cần thiết
   * Initialize the component with required services
   * @param courseService Dịch vụ quản lý khóa học
   * @param notificationService Dịch vụ hiển thị thông báo
   */
  constructor(
    private courseService: CourseService,
    private notificationService: NotificationService
  ) {
    super();
  }
  
  /**
   * Khởi tạo thành phần và tải kết quả kiểm tra đạo văn
   * Initialize the component and load plagiarism check results
   */
  ngOnInit(): void {
    if (!this.courseId || !this.assignmentId) {
      this.error = 'Thiếu thông tin khóa học hoặc bài tập';
      this.isLoading = false;
      return;
    }
    
    this.loadPlagiarismCheck();
  }
  
  /**
   * Tải kết quả kiểm tra đạo văn từ máy chủ
   * Load plagiarism check results from the server
   */
  loadPlagiarismCheck(): void {
    this.isLoading = true;
    this.error = '';
    
    this.courseService.getPlagiarismCheck(this.courseId, this.assignmentId)
      .pipe(
        takeUntil(this._onDestroySub),
        finalize(() => {
          this.isLoading = false;
        }),
        catchError(err => {
          console.error('Lỗi khi tải kết quả kiểm tra đạo văn:', err);
          this.error = 'Không thể tải kết quả kiểm tra đạo văn. Vui lòng thử lại sau.';
          return of(null);
        })
      )
      .subscribe(result => {
        this.result = result;
      });
  }
  
  /**
   * Thực hiện kiểm tra đạo văn mới
   * Run a new plagiarism check
   */
  runPlagiarismCheck(): void {
    if (this.checkInProgress) return;
    
    this.checkInProgress = true;
    this.error = '';
    
    // Cập nhật trạng thái hiện tại để hiển thị tiến trình
    // Update current state to show progress
    this.result = {
      ...(this.result || { score: 0, matches: [] }),
      status: 'checking'
    } as PlagiarismResult;
    
    this.courseService.runPlagiarismCheck(this.courseId, this.assignmentId)
      .pipe(
        takeUntil(this._onDestroySub),
        finalize(() => {
          this.checkInProgress = false;
        }),
        catchError(err => {
          console.error('Lỗi khi thực hiện kiểm tra đạo văn:', err);
          this.error = 'Không thể hoàn thành kiểm tra đạo văn. Vui lòng thử lại sau.';
          
          // Khôi phục trạng thái trước hoặc đặt trạng thái lỗi
          // Restore previous state or set error state
          this.result = {
            ...(this.result || { score: 0, matches: [] }),
            status: 'error' 
          } as PlagiarismResult;
          
          this.notificationService.error('Kiểm tra đạo văn thất bại');
          return of(null);
        })
      )
      .subscribe(result => {
        if (result) {
          this.result = result;
          
          // Hiển thị thông báo phù hợp dựa trên điểm số
          // Show appropriate notification based on score
          if (result.score <= 10) {
            this.notificationService.success('Kiểm tra hoàn tất: Tỷ lệ trùng lặp rất thấp');
          } else if (result.score <= 25) {
            this.notificationService.success('Kiểm tra hoàn tất: Tỷ lệ trùng lặp thấp');
          } else if (result.score <= 50) {
            this.notificationService.info('Kiểm tra hoàn tất: Tỷ lệ trùng lặp trung bình');
          } else {
            this.notificationService.warning('Kiểm tra hoàn tất: Phát hiện tỷ lệ trùng lặp cao');
          }
        }
      });
  }
  
  /**
   * Mở rộng hoặc thu gọn một kết quả trùng lặp
   * Expand or collapse a match result
   * @param index Chỉ mục của kết quả trùng lặp
   */
  toggleMatchExpansion(index: number): void {
    if (this.expandedMatches.has(index)) {
      this.expandedMatches.delete(index);
    } else {
      this.expandedMatches.add(index);
    }
  }
  
  /**
   * Kiểm tra xem một kết quả trùng lặp có đang được mở rộng không
   * Check if a match is expanded
   * @param index Chỉ mục của kết quả trùng lặp
   * @returns true nếu kết quả đang được mở rộng
   */
  isMatchExpanded(index: number): boolean {
    return this.expandedMatches.has(index);
  }
  
  /**
   * Tạo URL cho nguồn của kết quả trùng lặp
   * Create URL for match source
   * @param source Chuỗi chứa URL nguồn
   * @returns URL đầy đủ hoặc #
   */
  getSourceUrl(source: string): string {
    if (!source) return '#';
    
    if (source.startsWith('http://') || source.startsWith('https://')) {
      return source;
    }
    
    return `https://${source}`;
  }
  
  /**
   * Lấy mô tả mức độ nghiêm trọng của đạo văn dựa trên điểm số
   * Get plagiarism severity description based on score
   * @param score Điểm số trùng lặp
   * @returns Mô tả mức độ nghiêm trọng
   */
  getPlagiarismSeverity(score: number): string {
    if (score <= 10) return 'Rất thấp';
    if (score <= 25) return 'Thấp';
    if (score <= 50) return 'Trung bình';
    if (score <= 75) return 'Cao';
    return 'Rất cao';
  }
  
  /**
   * Lấy màu chữ dựa trên điểm số trùng lặp
   * Get text color based on plagiarism score
   * @param score Điểm số trùng lặp
   * @returns Lớp CSS cho màu chữ
   */
  getSeverityColor(score: number): string {
    if (score <= 10) return 'text-green-600';
    if (score <= 25) return 'text-blue-600';
    if (score <= 50) return 'text-yellow-600';
    if (score <= 75) return 'text-orange-600';
    return 'text-red-600';
  }
  
  /**
   * Lấy màu nền dựa trên điểm số trùng lặp
   * Get background color based on plagiarism score
   * @param score Điểm số trùng lặp
   * @returns Lớp CSS cho màu nền
   */
  getSeverityBgColor(score: number): string {
    if (score <= 10) return 'bg-green-100';
    if (score <= 25) return 'bg-blue-100';
    if (score <= 50) return 'bg-yellow-100';
    if (score <= 75) return 'bg-orange-100';
    return 'bg-red-100';
  }
  
  /**
   * Làm mới kết quả kiểm tra đạo văn
   * Refresh plagiarism check results
   */
  refreshResults(): void {
    this.loadPlagiarismCheck();
  }
  
  /**
   * Xóa thông báo lỗi
   * Clear error message
   */
  clearError(): void {
    this.error = '';
  }
}
