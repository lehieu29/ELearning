import { Component, Input, Output, EventEmitter } from '@angular/core';
import { BaseComponent } from '@app/shared/components/base/base-component';
import { CourseService } from '@app/shared/services/course.service';
import { SubmissionStatus } from '@app/shared/models/assignment.model';
import { takeUntil } from 'rxjs/operators';
import { HttpEventType } from '@angular/common/http';

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
export class FileManagementComponent extends BaseComponent {
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
  progress = 0;
  
  constructor(private courseService: CourseService) {
    super();
  }
  
  ngOnInit(): void {
    this.loadFiles();
  }
  
  loadFiles(): void {
    this.isLoading = true;
    
    this.courseService.getAssignmentFiles(this.courseId, this.assignmentId)
      .pipe(takeUntil(this._onDestroySub))
      .subscribe({
        next: (files) => {
          this.files = files;
          this.isLoading = false;
        },
        error: (err) => {
          console.error('Error loading files:', err);
          this.error = 'Failed to load your files. Please try again.';
          this.isLoading = false;
        }
      });
  }
  
  onFileSelected(event: any): void {
    const fileList: FileList = event.target.files;
    this.selectedFiles = [];
    
    if (fileList.length > 0) {
      for (let i = 0; i < fileList.length; i++) {
        this.selectedFiles.push(fileList.item(i));
      }
    }
  }
  
  uploadFiles(): void {
    if (this.selectedFiles.length === 0) return;
    
    this.isUploading = true;
    this.progress = 0;
    
    this.courseService.uploadAssignmentFiles(this.courseId, this.assignmentId, this.selectedFiles)
      .pipe(takeUntil(this._onDestroySub))
      .subscribe({
        next: (event) => {
          if (event.type === HttpEventType.UploadProgress) {
            const progress = Math.round((event.loaded / event.total) * 100);
            this.progress = progress;
            this.uploadProgress.emit(progress);
          } else if (event.type === HttpEventType.Response) {
            this.loadFiles();
            this.isUploading = false;
            this.selectedFiles = [];
            this.progress = 0;
          }
        },
        error: (err) => {
          console.error('Error uploading files:', err);
          this.error = 'Failed to upload files. Please try again.';
          this.isUploading = false;
        }
      });
  }
  
  deleteFile(fileId: string): void {
    this.courseService.deleteAssignmentFile(this.courseId, this.assignmentId, fileId)
      .pipe(takeUntil(this._onDestroySub))
      .subscribe({
        next: () => {
          this.files = this.files.filter(file => file.id !== fileId);
        },
        error: (err) => {
          console.error('Error deleting file:', err);
          this.error = 'Failed to delete file. Please try again.';
        }
      });
  }
  
  submitAssignment(): void {
    this.courseService.submitAssignment(this.courseId, this.assignmentId)
      .pipe(takeUntil(this._onDestroySub))
      .subscribe({
        next: () => {
          this.submissionComplete.emit();
        },
        error: (err) => {
          console.error('Error submitting assignment:', err);
          this.error = 'Failed to submit assignment. Please try again.';
        }
      });
  }
  
  formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }
}
