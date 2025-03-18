import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormArray, Validators } from '@angular/forms';
import { BaseComponent } from '@app/shared/components/base/base-component';
import { ResumeBuilderService } from '@app/shared/services/resume-builder.service';
import { NotificationService } from '@app/shared/services/notification.service';
import { UserService } from '@app/shared/services/user.service';
import { 
  Resume, 
  ResumeTemplate, 
  ResumeSection, 
  ResumeSectionType 
} from '@app/shared/models/resume.model';
import { takeUntil, finalize, debounceTime, switchMap, catchError } from 'rxjs/operators';
import { of, Observable, Subscription } from 'rxjs';
import * as dayjs from 'dayjs';
import { CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';

@Component({
  selector: 'app-resume-builder',
  templateUrl: './resume-builder.component.html'
})
export class ResumeBuilderComponent extends BaseComponent implements OnInit {
  // Resume data
  resumes: Resume[] = [];
  currentResume: Resume | null = null;
  resumeTemplates: ResumeTemplate[] = [];
  selectedTemplateId: string = '';
  
  // UI state
  isLoading = {
    resumes: false,
    currentResume: false,
    templates: false,
    generating: false,
    saving: false,
    exporting: false
  };
  errors = {
    resumes: '',
    currentResume: '',
    templates: '',
    generating: '',
    saving: '',
    exporting: ''
  };
  activeTab: 'details' | 'content' | 'preview' | 'export' = 'details';
  activeSectionTab: ResumeSectionType | 'personal' | 'all' = 'all';
  showNewResumeModal = false;
  showDeleteConfirmationModal = false;
  resumeToDelete: string | null = null;
  
  // Forms
  resumeDetailsForm: FormGroup;
  personalInfoForm: FormGroup;
  contactInfoForm: FormGroup;
  sectionForms: {[key: string]: FormGroup} = {};
  autoSaveSubscription: Subscription | null = null;
  
  /**
   * Khởi tạo component
   * Initialize component
   * @param fb FormBuilder để tạo form
   * @param resumeService Service xử lý CV
   * @param userService Service xử lý thông tin người dùng
   * @param notificationService Service hiển thị thông báo
   */
  constructor(
    private fb: FormBuilder,
    private resumeService: ResumeBuilderService,
    private userService: UserService,
    private notificationService: NotificationService
  ) {
    super();
    
    this.resumeDetailsForm = this.fb.group({
      title: ['', [Validators.required, Validators.maxLength(100)]],
      templateId: ['default-template', Validators.required]
    });
    
    this.personalInfoForm = this.fb.group({
      firstName: ['', [Validators.required, Validators.maxLength(50)]],
      lastName: ['', [Validators.required, Validators.maxLength(50)]],
      jobTitle: ['', [Validators.required, Validators.maxLength(100)]],
      photo: ['']
    });
    
    this.contactInfoForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      phone: ['', Validators.pattern('^[+]?[(]?[0-9]{3}[)]?[-\\s.]?[0-9]{3}[-\\s.]?[0-9]{4,6}$')],
      location: ['', Validators.maxLength(100)],
      website: ['', Validators.pattern('https?:\\/\\/(www\\.)?[-a-zA-Z0-9@:%._\\+~#=]{1,256}\\.[a-zA-Z0-9()]{1,6}\\b([-a-zA-Z0-9()@:%_\\+.~#?&//=]*)')],
      socialLinks: this.fb.array([])
    });
  }
  
  /**
   * Khởi tạo dữ liệu khi component được tải
   * Initialize data when component is loaded
   */
  ngOnInit(): void {
    this.loadResumes();
    this.loadResumeTemplates();
    this.setupFormListeners();
    
    // Load user data to populate personal info form
    this.userService.getUserProfile()
      .pipe(takeUntil(this._onDestroySub))
      .subscribe({
        next: (user) => {
          if (user) {
            this.personalInfoForm.patchValue({
              firstName: user.firstName || '',
              lastName: user.lastName || '',
              email: user.email || ''
            });
            
            this.contactInfoForm.patchValue({
              email: user.email || ''
            });
          }
        },
        error: (error) => {
          console.error('Lỗi khi tải thông tin người dùng:', error);
        }
      });
  }
  
  /**
   * Thiết lập các listener cho form để tự động lưu khi có thay đổi
   * Set up form listeners for auto-saving on changes
   */
  setupFormListeners(): void {
    // Combine all forms and auto-save when any changes
    const formChanges = [
      this.resumeDetailsForm.valueChanges,
      this.personalInfoForm.valueChanges,
      this.contactInfoForm.valueChanges
    ];
    
    this.autoSaveSubscription = of(...formChanges)
      .pipe(
        debounceTime(2000), // Wait for 2 seconds of inactivity
        takeUntil(this._onDestroySub)
      )
      .subscribe(() => {
        if (this.currentResume && this.resumeDetailsForm.valid) {
          this.saveCurrentResume();
        }
      });
  }
  
  /**
   * Tải danh sách CV của người dùng
   * Load user's resumes
   */
  loadResumes(): void {
    this.isLoading.resumes = true;
    this.errors.resumes = '';
    
    this.resumeService.getUserResumes()
      .pipe(
        takeUntil(this._onDestroySub),
        finalize(() => {
          this.isLoading.resumes = false;
        })
      )
      .subscribe({
        next: (resumes) => {
          this.resumes = resumes;
          
          // Load the first resume if available
          if (resumes.length > 0 && !this.currentResume) {
            this.loadResume(resumes[0].id!);
          }
        },
        error: (error) => {
          console.error('Lỗi khi tải danh sách CV:', error);
          this.errors.resumes = 'Không thể tải danh sách CV. Vui lòng thử lại sau.';
        }
      });
  }
  
  /**
   * Tải thông tin chi tiết của một CV
   * Load detailed information of a resume
   * @param resumeId ID của CV cần tải
   */
  loadResume(resumeId: string): void {
    this.isLoading.currentResume = true;
    this.errors.currentResume = '';
    
    this.resumeService.getResumeById(resumeId)
      .pipe(
        takeUntil(this._onDestroySub),
        finalize(() => {
          this.isLoading.currentResume = false;
        })
      )
      .subscribe({
        next: (resume) => {
          this.currentResume = resume;
          this.selectedTemplateId = resume.templateId;
          this.populateForms(resume);
        },
        error: (error) => {
          console.error(`Lỗi khi tải CV (${resumeId}):`, error);
          this.errors.currentResume = 'Không thể tải thông tin CV. Vui lòng thử lại sau.';
        }
      });
  }
  
  /**
   * Tải danh sách các mẫu CV có sẵn
   * Load available resume templates
   */
  loadResumeTemplates(): void {
    this.isLoading.templates = true;
    this.errors.templates = '';
    
    this.resumeService.getResumeTemplates()
      .pipe(
        takeUntil(this._onDestroySub),
        finalize(() => {
          this.isLoading.templates = false;
        })
      )
      .subscribe({
        next: (templates) => {
          this.resumeTemplates = templates;
        },
        error: (error) => {
          console.error('Lỗi khi tải mẫu CV:', error);
          this.errors.templates = 'Không thể tải danh sách mẫu CV. Vui lòng thử lại sau.';
        }
      });
  }
  
  /**
   * Điền dữ liệu CV vào các form
   * Populate forms with resume data
   * @param resume CV cần điền dữ liệu
   */
  populateForms(resume: Resume): void {
    // Populate resume details form
    this.resumeDetailsForm.patchValue({
      title: resume.title,
      templateId: resume.templateId
    });
    
    // Populate personal info form
    this.personalInfoForm.patchValue({
      firstName: resume.personalInfo.firstName,
      lastName: resume.personalInfo.lastName,
      jobTitle: resume.personalInfo.jobTitle,
      photo: resume.personalInfo.photo || ''
    });
    
    // Populate contact info form
    this.contactInfoForm.patchValue({
      email: resume.contactInfo.email,
      phone: resume.contactInfo.phone || '',
      location: resume.contactInfo.location || '',
      website: resume.contactInfo.website || ''
    });
    
    // Clear existing social links and add new ones
    const socialLinksArray = this.contactInfoForm.get('socialLinks') as FormArray;
    socialLinksArray.clear();
    
    resume.socialLinks.forEach(link => {
      socialLinksArray.push(this.fb.group({
        platform: [link.platform, Validators.required],
        url: [link.url, [
          Validators.required, 
          Validators.pattern('https?:\\/\\/(www\\.)?[-a-zA-Z0-9@:%._\\+~#=]{1,256}\\.[a-zA-Z0-9()]{1,6}\\b([-a-zA-Z0-9()@:%_\\+.~#?&//=]*)')
        ]],
        customLabel: [link.customLabel || '']
      }));
    });
    
    // Initialize section forms
    this.initializeSectionForms(resume.sections);
  }
  
  /**
   * Khởi tạo các form cho từng section trong CV
   * Initialize forms for each resume section
   * @param sections Danh sách section trong CV
   */
  initializeSectionForms(sections: ResumeSection[]): void {
    // Reset section forms object
    this.sectionForms = {};
    
    sections.forEach(section => {
      const itemsFormArray = this.fb.array([]);
      
      section.items.forEach(item => {
        const itemForm = this.createItemForm(section.type, item);
        itemsFormArray.push(itemForm);
      });
  }
}
