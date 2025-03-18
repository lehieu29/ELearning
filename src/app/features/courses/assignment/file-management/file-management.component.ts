import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { BaseComponent } from '@app/shared/components/base/base-component';
import { CourseService } from '@app/shared/services/course.service';
import { SubmissionStatus } from '@app/shared/models/assignment.model';
import { takeUntil, finalize, catchError } from 'rxjs/operators';
import { HttpEventType } from '@angular/common/http';
import { NotificationService } from '@app/shared/services/notification.service';
import { of } from 'rxjs';

interface UploadedFile {
  id: string;
  name: string;
  size: number;
  type: string;
  uploadedAt: Date;
  url: string;
}

@Component({
  selector: 'app-file-management',
  templateUrl: './file-management.component.html'
})
export class FileManagementComponent extends BaseComponent implements OnInit {
  @Input() courseId: string;
  @Input() assignmentId: string;
  @Input() submissionStatus: SubmissionStatus;
  @Output() uploadProgress = new EventEmitter<number>();
  @Output() submissionComplete = new EventEmitter<void>();
  
  files: UploadedFile[] = [];
  isLoading = true;
  error: string = '';
  selectedFiles: File[] = [];
  isUploading = false;
  isDeleting = false;
  isSubmitting = false;
  progress = 0;
  
  // Cấu hình giới hạn tập tin
  fileConfig = {
    maxSizeInMB: 20,
    acceptedTypes: ['.pdf', '.doc', '.docx', '.txt', '.zip', '.rar', '.jpg', '.jpeg', '.png']
  };
  
  /**
   * Khởi tạo component với các dịch vụ cần thiết
   * Initialize component with required services
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
   * Khởi tạo component và tải danh sách tập tin
   * Initialize component and load files list
   */
  ngOnInit(): void {
    this.loadFiles();
  }
  
  /**
   * Tải danh sách tập tin của bài tập từ server
   * Load assignment files from server
   */
  loadFiles(): void {
    if (!this.courseId || !this.assignmentId) {
      this.error = 'Thiếu thông tin khóa học hoặc bài tập';
      this.isLoading = false;
      return;
    }
    
    this.isLoading = true;
    this.error = '';
    
    this.courseService.getAssignmentFiles(this.courseId, this.assignmentId)
      .pipe(
        takeUntil(this._onDestroySub),
        finalize(() => {
          this.isLoading = false;
        }),
        catchError(err => {
          console.error('Lỗi khi tải danh sách tập tin:', err);
          this.error = 'Không thể tải danh sách tập tin. Vui lòng thử lại sau.';
          return of([]);
        })
      )
      .subscribe(files => {
        this.files = files;
      });
  }
  
  /**
   * Xử lý khi người dùng chọn tập tin từ hộp thoại
   * Handle when user selects files from dialog
   * @param event Sự kiện chọn tập tin
   */
  onFileSelected(event: any): void {
    const fileList: FileList = event.target.files;
    if (!fileList || fileList.length === 0) return;
    
    // Chuyển đổi FileList thành mảng để xử lý dễ dàng hơn
    // Convert FileList to array for easier processing
    this.selectedFiles = Array.from(fileList).filter(file => this.validateFile(file));
    
    // Tự động tải lên nếu có tập tin đã chọn
    // Automatically upload if files are selected
    if (this.selectedFiles.length > 0) {
      this.uploadFiles();
    }
  }
  
  /**
   * Kiểm tra tính hợp lệ của tập tin
   * Validate file against constraints
   * @param file Tập tin cần kiểm tra
   * @returns true nếu tập tin hợp lệ
   */
  validateFile(file: File): boolean {
    // Kiểm tra kích thước
    // Check file size
    const maxSizeInBytes = this.fileConfig.maxSizeInMB * 1024 * 1024;
    if (file.size > maxSizeInBytes) {
      this.notificationService.error(
        `Tập tin ${file.name} vượt quá kích thước cho phép (${this.fileConfig.maxSizeInMB}MB)`
      );
      return false;
    }
    
    // Kiểm tra loại tập tin
    // Check file type
    const fileExt = '.' + file.name.split('.').pop().toLowerCase();
    if (!this.fileConfig.acceptedTypes.includes(fileExt)) {
      this.notificationService.error(
        `Loại tập tin ${fileExt} không được chấp nhận. Định dạng được chấp nhận: ${this.fileConfig.acceptedTypes.join(', ')}`
      );
      return false;
    }
    
    return true;
  }
  
  /**
   * Tải các tập tin đã chọn lên server
   * Upload selected files to server
   */
  uploadFiles(): void {
    if (this.selectedFiles.length === 0) return;
    
    this.isUploading = true;
    this.progress = 0;
    this.error = '';
    
    this.courseService.uploadAssignmentFiles(this.courseId, this.assignmentId, this.selectedFiles)
      .pipe(
        takeUntil(this._onDestroySub),
        finalize(() => {
          if (this.progress !== 100) {
            this.progress = 0;
            this.isUploading = false;
          }
        }),
        catchError(err => {
          console.error('Lỗi khi tải tập tin lên:', err);
          this.error = 'Không thể tải tập tin lên. Vui lòng thử lại sau.';
          this.isUploading = false;
          this.notificationService.error('Tải tập tin lên thất bại');
          return of(null);
        })
      )
      .subscribe(event => {
        if (!event) return;
        
        // Cập nhật tiến trình nếu đang tải lên
        // Update progress if uploading
        if (event.type === HttpEventType.UploadProgress && event.total) {
          this.progress = Math.round((event.loaded / event.total) * 100);
          this.uploadProgress.emit(this.progress);
        } 
        // Hoàn thành tải lên
        // Upload complete
        else if (event.type === HttpEventType.Response) {
          setTimeout(() => {
            this.loadFiles();
            this.isUploading = false;
            this.selectedFiles = [];
            this.notificationService.success('Tải tập tin lên thành công');
          }, 300);
        }
      });
  }
  
  /**
   * Xóa một tập tin đã tải lên
   * Delete an uploaded file
   * @param fileId ID của tập tin cần xóa
   */
  deleteFile(fileId: string): void {
    if (!confirm('Bạn có chắc chắn muốn xóa tập tin này không?')) {
      return;
    }
    
    this.isDeleting = true;
    this.error = '';
    
    this.courseService.deleteAssignmentFile(this.courseId, this.assignmentId, fileId)
      .pipe(
        takeUntil(this._onDestroySub),
        finalize(() => {
          this.isDeleting = false;
        }),
        catchError(err => {
          console.error('Lỗi khi xóa tập tin:', err);
          this.error = 'Không thể xóa tập tin. Vui lòng thử lại sau.';
          this.notificationService.error('Xóa tập tin thất bại');
          return of(false);
        })
      )
      .subscribe(success => {
        if (success !== false) {
          this.files = this.files.filter(file => file.id !== fileId);
          this.notificationService.success('Đã xóa tập tin thành công');
        }
      });
  }
  
  /**
   * Nộp bài tập với các tập tin đã tải lên
   * Submit assignment with uploaded files
   */
  submitAssignment(): void {
    if (this.files.length === 0) {
      this.notificationService.warning('Vui lòng tải lên ít nhất một tập tin trước khi nộp bài.');
      return;
    }
    
    if (!confirm('Bạn có chắc chắn muốn nộp bài tập này không? Sau khi nộp, bạn sẽ không thể chỉnh sửa nữa.')) {
      return;
    }
    
    this.isSubmitting = true;
    this.error = '';
    
    this.courseService.submitAssignment(this.courseId, this.assignmentId)
      .pipe(
        takeUntil(this._onDestroySub),
        finalize(() => {
          this.isSubmitting = false;
        }),
        catchError(err => {
          console.error('Lỗi khi nộp bài tập:', err);
          this.error = 'Không thể nộp bài tập. Vui lòng thử lại sau.';
          this.notificationService.error('Nộp bài tập thất bại');
          return of(false);
        })
      )
      .subscribe(success => {
        if (success !== false) {
          this.notificationService.success('Đã nộp bài tập thành công');
          this.submissionComplete.emit();
        }
      });
  }
  
  /**
   * Định dạng kích thước tập tin để hiển thị
   * Format file size for display
   * @param bytes Kích thước tập tin tính bằng byte
   * @returns Chuỗi hiển thị kích thước đã định dạng
   */
  formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }
  
  /**
   * Lấy biểu tượng phù hợp với loại tập tin
   * Get appropriate icon for file type
   * @param fileName Tên tập tin
   * @returns Tên biểu tượng phù hợp
   */
  getFileIcon(fileName: string): string {
    const extension = fileName.split('.').pop()?.toLowerCase() || '';
    
    switch (extension) {
      case 'pdf': return 'file-pdf';
      case 'doc':
      case 'docx': return 'file-word';
      case 'xls':
      case 'xlsx': return 'file-excel';
      case 'ppt':
      case 'pptx': return 'file-powerpoint';
      case 'zip':
      case 'rar': return 'file-archive';
      case 'jpg':
      case 'jpeg':
      case 'png':
      case 'gif': return 'file-image';
      case 'mp4':
      case 'avi':
      case 'mov': return 'file-video';
      default: return 'file-text';
    }
  }
  
  /**
   * Xóa thông báo lỗi
   * Clear error message
   */
  clearError(): void {
    this.error = '';
  }
}
