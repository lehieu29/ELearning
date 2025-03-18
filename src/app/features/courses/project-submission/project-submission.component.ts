import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { BaseComponent } from '@app/shared/components/base/base-component';
import { CourseService } from '@app/shared/services/course.service';
import { NotificationService } from '@app/shared/services/notification.service';
import { Project } from '@app/shared/models/project.model';
import { takeUntil, finalize, catchError } from 'rxjs/operators';
import { of } from 'rxjs';

interface ProjectSubmission {
  id?: string;
  version: number;
  status: 'draft' | 'submitted' | 'graded' | 'returned';
  submittedAt?: Date;
  reviewedAt?: Date;
  grade?: number;
  feedback?: string;
  files?: Array<{fileName: string, fileUrl: string}>;
}

@Component({
  selector: 'app-project-submission',
  templateUrl: './project-submission.component.html'
})
export class ProjectSubmissionComponent extends BaseComponent implements OnInit {
  courseId: string;
  projectId: string;
  project: Project;
  
  projectForm: FormGroup;
  submissionFiles: File[] = [];
  isLoading = true;
  isLoadingHistory = false;
  isSubmitting = false;
  error: string = '';
  
  submission: ProjectSubmission = {
    version: 1,
    status: 'draft',
    submittedAt: null,
    reviewedAt: null,
    feedback: null,
    grade: null
  };
  
  submissionHistory = [];
  isFilesDragOver = false;

  /**
   * Khởi tạo component với các dịch vụ cần thiết
   * Initialize component with required services
   * @param route Service để truy cập thông tin route
   * @param fb Service để tạo và quản lý forms
   * @param courseService Service để tương tác với dữ liệu khóa học
   * @param notificationService Service để hiển thị thông báo
   */
  constructor(
    private route: ActivatedRoute,
    private fb: FormBuilder,
    private courseService: CourseService,
    private notificationService: NotificationService
  ) {
    super();
    
    this.projectForm = this.fb.group({
      title: ['', [Validators.required, Validators.maxLength(100)]],
      description: ['', [Validators.required, Validators.minLength(50), Validators.maxLength(1000)]],
      githubUrl: ['', Validators.pattern('https?://(www\\.)?github\\.com/.+')],
      additionalNotes: ['', Validators.maxLength(500)]
    });
  }
  
  /**
   * Khởi tạo component và theo dõi các tham số từ route
   * Initialize component and track route parameters
   */
  ngOnInit(): void {
    this.route.parent.paramMap
      .pipe(takeUntil(this._onDestroySub))
      .subscribe({
        next: params => {
          this.courseId = params.get('courseId');
          
          this.route.paramMap
            .pipe(takeUntil(this._onDestroySub))
            .subscribe({
              next: childParams => {
                this.projectId = childParams.get('projectId');
                if (this.courseId && this.projectId) {
                  this.loadProjectDetails();
                  this.loadSubmissionHistory();
                } else {
                  this.error = 'Không tìm thấy thông tin khóa học hoặc dự án';
                  this.isLoading = false;
                }
              },
              error: err => {
                console.error('Lỗi khi đọc tham số route:', err);
                this.error = 'Không thể tải thông tin dự án. Vui lòng thử lại sau.';
                this.isLoading = false;
              }
            });
        },
        error: err => {
          console.error('Lỗi khi đọc tham số route cha:', err);
          this.error = 'Không thể tải thông tin khóa học. Vui lòng thử lại sau.';
          this.isLoading = false;
        }
      });
  }
  
  /**
   * Tải thông tin chi tiết về dự án
   * Load project details
   */
  loadProjectDetails(): void {
    this.isLoading = true;
    this.error = '';
    
    this.courseService.getProjectDetails(this.courseId, this.projectId)
      .pipe(
        takeUntil(this._onDestroySub),
        finalize(() => {
          if (!this.project) {
            this.isLoading = false;
          }
        }),
        catchError(err => {
          console.error('Lỗi khi tải thông tin dự án:', err);
          this.error = 'Không thể tải thông tin dự án. Vui lòng thử lại sau.';
          return of(null);
        })
      )
      .subscribe(project => {
        if (project) {
          this.project = project;
          
          // Check for in-progress submission
          this.courseService.getProjectDraft(this.courseId, this.projectId)
            .pipe(
              takeUntil(this._onDestroySub),
              finalize(() => {
                this.isLoading = false;
              }),
              catchError(err => {
                console.error('Lỗi khi tải bản nháp:', err);
                // Don't show error for draft loading - non-critical
                return of(null);
              })
            )
            .subscribe(draft => {
              if (draft) {
                this.projectForm.patchValue({
                  title: draft.title,
                  description: draft.description,
                  githubUrl: draft.githubUrl,
                  additionalNotes: draft.additionalNotes
                });
                
                this.submission = {
                  ...this.submission,
                  ...draft
                };
              }
            });
        }
      });
  }
  
  /**
   * Tải lịch sử nộp bài của dự án
   * Load submission history of the project
   */
  loadSubmissionHistory(): void {
    this.isLoadingHistory = true;
    
    this.courseService.getProjectSubmissionHistory(this.courseId, this.projectId)
      .pipe(
        takeUntil(this._onDestroySub),
        finalize(() => {
          this.isLoadingHistory = false;
        }),
        catchError(err => {
          console.error('Lỗi khi tải lịch sử nộp bài:', err);
          // Don't show error toast for history loading - non-critical
          return of([]);
        })
      )
      .subscribe(history => {
        this.submissionHistory = history;
      });
  }
  
  /**
   * Xử lý khi người dùng chọn tệp tin từ hộp thoại chọn tệp
   * Handle when user selects files from file dialog
   * @param event Sự kiện chọn tệp tin
   */
  onFileSelect(event: any): void {
    if (event.target.files.length > 0) {
      const files = Array.from(event.target.files) as File[];
      this.addFiles(files);
      event.target.value = ''; // Reset input to allow selecting the same file again
    }
  }
  
  /**
   * Xử lý khi người dùng thả tệp tin vào khu vực drop
   * Handle when user drops files into drop area
   * @param event Sự kiện kéo thả tệp tin
   */
  onFileDrop(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.isFilesDragOver = false;
    
    if (event.dataTransfer.files.length > 0) {
      const files = Array.from(event.dataTransfer.files) as File[];
      this.addFiles(files);
    }
  }
  
  /**
   * Xử lý khi người dùng kéo tệp tin vào khu vực drop
   * Handle when user drags files over the drop area
   * @param event Sự kiện kéo tệp tin
   */
  onFileDragOver(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.isFilesDragOver = true;
  }
  
  /**
   * Xử lý khi người dùng kéo tệp tin ra khỏi khu vực drop
   * Handle when user drags files out of the drop area
   * @param event Sự kiện kéo tệp tin
   */
  onFileDragLeave(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.isFilesDragOver = false;
  }
  
  /**
   * Thêm tệp tin vào danh sách nộp sau khi kiểm tra
   * Add files to submission list after validation
   * @param files Danh sách tệp tin
   */
  addFiles(files: File[]): void {
    // Filter for accepted file types and size limits
    const acceptedFileTypes = this.project?.allowedFileTypes || ['.pdf', '.zip', '.doc', '.docx'];
    const maxFileSize = this.project?.maxFileSize || 20 * 1024 * 1024; // 20 MB default
    
    files.forEach(file => {
      const fileExt = '.' + file.name.split('.').pop().toLowerCase();
      
      if (!acceptedFileTypes.includes(fileExt)) {
        this.notificationService.error(`Loại tệp ${fileExt} không được chấp nhận. Các định dạng được hỗ trợ: ${acceptedFileTypes.join(', ')}`);
        return;
      }
      
      if (file.size > maxFileSize) {
        this.notificationService.error(`Tệp ${file.name} vượt quá kích thước tối đa cho phép (${maxFileSize / 1024 / 1024}MB)`);
        return;
      }
      
      // Check for duplicate filename
      if (this.submissionFiles.some(f => f.name === file.name)) {
        this.notificationService.warning(`Tệp ${file.name} đã tồn tại trong danh sách nộp`);
        return;
      }
      
      this.submissionFiles.push(file);
    });
  }
  
  /**
   * Xóa tệp tin khỏi danh sách nộp
   * Remove file from submission list
   * @param index Vị trí của tệp tin cần xóa
   */
  removeFile(index: number): void {
    if (index >= 0 && index < this.submissionFiles.length) {
      this.submissionFiles.splice(index, 1);
    }
  }
  
  /**
   * Lưu dự án dưới dạng bản nháp
   * Save project as draft
   */
  saveDraft(): void {
    if (this.projectForm.invalid) {
      this.markFormGroupTouched(this.projectForm);
      this.notificationService.warning('Vui lòng điền đầy đủ các thông tin bắt buộc trước khi lưu');
      return;
    }
    
    const formData = new FormData();
    
    // Add form values
    Object.keys(this.projectForm.value).forEach(key => {
      if (this.projectForm.value[key] !== null && this.projectForm.value[key] !== undefined) {
        formData.append(key, this.projectForm.value[key]);
      }
    });
    
    // Add files
    this.submissionFiles.forEach(file => {
      formData.append('files', file);
    });
    
    this.isSubmitting = true;
    
    this.courseService.saveProjectDraft(this.courseId, this.projectId, formData)
      .pipe(
        takeUntil(this._onDestroySub),
        finalize(() => {
          this.isSubmitting = false;
        }),
        catchError(err => {
          console.error('Lỗi khi lưu bản nháp:', err);
          this.notificationService.error('Không thể lưu bản nháp. Vui lòng thử lại sau.');
          return of(null);
        })
      )
      .subscribe(result => {
        if (result) {
          this.notificationService.success('Đã lưu bản nháp thành công');
          
          // Update submission status
          this.submission.status = 'draft';
          this.submission.submittedAt = new Date();
        }
      });
  }
  
  /**
   * Nộp dự án chính thức
   * Submit project formally
   */
  submitProject(): void {
    if (this.projectForm.invalid) {
      // Mark all fields as touched to show validation errors
      this.markFormGroupTouched(this.projectForm);
      this.notificationService.warning('Vui lòng sửa các lỗi trước khi nộp bài');
      return;
    }
    
    if (this.submissionFiles.length === 0 && !this.projectForm.value.githubUrl) {
      this.notificationService.warning('Vui lòng tải lên ít nhất một tệp tin hoặc cung cấp đường dẫn GitHub');
      return;
    }
    
    // Confirm submission
    if (!confirm('Bạn có chắc chắn muốn nộp dự án này? Sau khi nộp, bạn sẽ không thể chỉnh sửa nữa trừ khi được giảng viên yêu cầu nộp lại.')) {
      return;
    }
    
    const formData = new FormData();
    
    // Add form values
    Object.keys(this.projectForm.value).forEach(key => {
      if (this.projectForm.value[key] !== null && this.projectForm.value[key] !== undefined) {
        formData.append(key, this.projectForm.value[key]);
      }
    });
    
    // Add files
    this.submissionFiles.forEach(file => {
      formData.append('files', file);
    });
    
    this.isSubmitting = true;
    this.error = '';
    
    this.courseService.submitProject(this.courseId, this.projectId, formData)
      .pipe(
        takeUntil(this._onDestroySub),
        finalize(() => {
          this.isSubmitting = false;
        }),
        catchError(err => {
          console.error('Lỗi khi nộp dự án:', err);
          this.error = 'Không thể nộp dự án. Vui lòng thử lại sau.';
          this.notificationService.error('Không thể nộp dự án. Vui lòng thử lại sau.');
          return of(null);
        })
      )
      .subscribe(response => {
        if (response) {
          this.notificationService.success('Dự án đã được nộp thành công!');
          
          // Update submission state
          this.submission = {
            ...this.submission,
            status: 'submitted',
            submittedAt: new Date(),
            version: response.version
          };
          
          // Reset uploaded files since they've been submitted
          this.submissionFiles = [];
          
          // Refresh submission history
          this.loadSubmissionHistory();
        }
      });
  }
  
  /**
   * Tải xuống tệp tin từ lịch sử nộp bài
   * Download file from submission history
   * @param fileUrl URL của tệp tin
   * @param fileName Tên tệp tin
   */
  downloadFile(fileUrl: string, fileName: string): void {
    if (!fileUrl) {
      this.notificationService.warning('Không thể tải xuống: URL tệp tin không hợp lệ');
      return;
    }
    
    const a = document.createElement('a');
    a.href = fileUrl;
    a.download = fileName || 'project-file';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  }
  
  /**
   * Xóa thông báo lỗi
   * Clear error message
   */
  clearError(): void {
    this.error = '';
  }
  
  /**
   * Đánh dấu tất cả các trường trong form là đã chạm vào để hiển thị lỗi
   * Mark all fields in form as touched to display validation errors
   * @param formGroup Form cần đánh dấu
   */
  private markFormGroupTouched(formGroup: FormGroup): void {
    Object.keys(formGroup.controls).forEach(key => {
      formGroup.get(key).markAsTouched();
    });
  }
  
  /**
   * Kiểm tra xem dự án có thể chỉnh sửa không
   * Check if project can be edited
   * @returns true nếu có thể chỉnh sửa
   */
  canEdit(): boolean {
    return this.submission.status === 'draft' || this.submission.status === 'returned';
  }
  
  /**
   * Lấy màu hiển thị cho trạng thái nộp bài
   * Get display color for submission status
   * @param status Trạng thái nộp bài
   * @returns Các class CSS cho màu sắc
   */
  getStatusClasses(status: string): string {
    switch (status) {
      case 'submitted':
        return 'bg-blue-100 text-blue-800';
      case 'graded':
        return 'bg-green-100 text-green-800';
      case 'returned':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  }
}
