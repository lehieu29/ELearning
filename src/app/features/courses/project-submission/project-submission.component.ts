import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { BaseComponent } from '@app/shared/components/base/base-component';
import { CourseService } from '@app/shared/services/course.service';
import { NotificationService } from '@app/shared/services/notification.service';
import { Project } from '@app/shared/models/project.model';
import { takeUntil } from 'rxjs/operators';

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
  isSubmitting = false;
  error: string = '';
  
  submission = {
    version: 1,
    status: 'draft',
    submittedAt: null,
    reviewedAt: null,
    feedback: null,
    grade: null
  };
  
  submissionHistory = [];
  isFilesDragOver = false;

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
  
  ngOnInit(): void {
    this.route.parent.paramMap
      .pipe(takeUntil(this._onDestroySub))
      .subscribe(params => {
        this.courseId = params.get('courseId');
        
        this.route.paramMap
          .pipe(takeUntil(this._onDestroySub))
          .subscribe(childParams => {
            this.projectId = childParams.get('projectId');
            if (this.courseId && this.projectId) {
              this.loadProjectDetails();
              this.loadSubmissionHistory();
            }
          });
      });
  }
  
  loadProjectDetails(): void {
    this.isLoading = true;
    this.error = '';
    
    this.courseService.getProjectDetails(this.courseId, this.projectId)
      .pipe(takeUntil(this._onDestroySub))
      .subscribe({
        next: (project) => {
          this.project = project;
          
          // Check for in-progress submission
          this.courseService.getProjectDraft(this.courseId, this.projectId)
            .pipe(takeUntil(this._onDestroySub))
            .subscribe({
              next: (draft) => {
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
                this.isLoading = false;
              },
              error: (err) => {
                console.error('Error loading draft:', err);
                this.isLoading = false;
              }
            });
        },
        error: (err) => {
          console.error('Error loading project details:', err);
          this.error = 'Failed to load project details. Please try again.';
          this.isLoading = false;
        }
      });
  }
  
  loadSubmissionHistory(): void {
    this.courseService.getProjectSubmissionHistory(this.courseId, this.projectId)
      .pipe(takeUntil(this._onDestroySub))
      .subscribe({
        next: (history) => {
          this.submissionHistory = history;
        },
        error: (err) => {
          console.error('Error loading submission history:', err);
        }
      });
  }
  
  onFileSelect(event: any): void {
    if (event.target.files.length > 0) {
      const files = Array.from(event.target.files);
      this.addFiles(files);
    }
  }
  
  onFileDrop(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.isFilesDragOver = false;
    
    if (event.dataTransfer.files.length > 0) {
      const files = Array.from(event.dataTransfer.files);
      this.addFiles(files);
    }
  }
  
  onFileDragOver(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.isFilesDragOver = true;
  }
  
  onFileDragLeave(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.isFilesDragOver = false;
  }
  
  addFiles(files: File[]): void {
    // Filter for accepted file types and size limits
    const acceptedFileTypes = this.project?.allowedFileTypes || ['.pdf', '.zip', '.doc', '.docx'];
    const maxFileSize = this.project?.maxFileSize || 20 * 1024 * 1024; // 20 MB default
    
    files.forEach(file => {
      const fileExt = '.' + file.name.split('.').pop().toLowerCase();
      
      if (!acceptedFileTypes.includes(fileExt)) {
        this.notificationService.error(`File type ${fileExt} not accepted. Allowed types: ${acceptedFileTypes.join(', ')}`);
        return;
      }
      
      if (file.size > maxFileSize) {
        this.notificationService.error(`File ${file.name} exceeds the maximum allowed size (${maxFileSize / 1024 / 1024}MB)`);
        return;
      }
      
      this.submissionFiles.push(file);
    });
  }
  
  removeFile(index: number): void {
    this.submissionFiles.splice(index, index + 1);
  }
  
  saveDraft(): void {
    if (this.projectForm.invalid) return;
    
    const formData = new FormData();
    
    // Add form values
    Object.keys(this.projectForm.value).forEach(key => {
      formData.append(key, this.projectForm.value[key]);
    });
    
    // Add files
    this.submissionFiles.forEach(file => {
      formData.append('files', file);
    });
    
    this.isSubmitting = true;
    
    this.courseService.saveProjectDraft(this.courseId, this.projectId, formData)
      .pipe(takeUntil(this._onDestroySub))
      .subscribe({
        next: () => {
          this.notificationService.success('Draft saved successfully');
          this.isSubmitting = false;
          
          // Update submission status
          this.submission.status = 'draft';
          this.submission.submittedAt = new Date();
        },
        error: (err) => {
          console.error('Error saving draft:', err);
          this.notificationService.error('Failed to save draft. Please try again.');
          this.isSubmitting = false;
        }
      });
  }
  
  submitProject(): void {
    if (this.projectForm.invalid) {
      // Mark all fields as touched to show validation errors
      Object.keys(this.projectForm.controls).forEach(key => {
        const control = this.projectForm.get(key);
        control.markAsTouched();
      });
      
      this.notificationService.warning('Please fix the validation errors before submitting.');
      return;
    }
    
    if (this.submissionFiles.length === 0 && !this.projectForm.value.githubUrl) {
      this.notificationService.warning('Please upload at least one file or provide a GitHub URL.');
      return;
    }
    
    const formData = new FormData();
    
    // Add form values
    Object.keys(this.projectForm.value).forEach(key => {
      formData.append(key, this.projectForm.value[key]);
    });
    
    // Add files
    this.submissionFiles.forEach(file => {
      formData.append('files', file);
    });
    
    this.isSubmitting = true;
    
    this.courseService.submitProject(this.courseId, this.projectId, formData)
      .pipe(takeUntil(this._onDestroySub))
      .subscribe({
        next: (response) => {
          this.notificationService.success('Project submitted successfully!');
          this.isSubmitting = false;
          
          // Update submission state
          this.submission = {
            ...this.submission,
            status: 'submitted',
            submittedAt: new Date(),
            version: response.version
          };
          
          // Refresh submission history
          this.loadSubmissionHistory();
        },
        error: (err) => {
          console.error('Error submitting project:', err);
          this.notificationService.error('Failed to submit project. Please try again.');
          this.isSubmitting = false;
        }
      });
  }
}
