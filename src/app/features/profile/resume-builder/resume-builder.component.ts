import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup, FormArray, Validators, AbstractControl } from '@angular/forms';
import { BaseComponent } from '@app/shared/components/base/base-component';
import { ResumeBuilderService } from '@app/shared/services/resume-builder.service';
import { NotificationService } from '@app/shared/services/notification.service';
import { UserService } from '@app/shared/services/user.service';
import { 
  Resume, 
  ResumeTemplate, 
  ResumeSection, 
  ResumeSectionType,
  ResumeSectionItem,
  EducationItem,
  ExperienceItem,
  SkillItem,
  ProjectItem,
  CourseItem,
  CertificateItem,
  ResumeExportOptions,
  SocialLink
} from '@app/shared/models/resume';
import { takeUntil, finalize, debounceTime, catchError } from 'rxjs/operators';
import { of, Observable, Subscription } from 'rxjs';
import { CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';
import * as uuid from 'uuid';

@Component({
  selector: 'app-resume-builder',
  templateUrl: './resume-builder.component.html'
})
export class ResumeBuilderComponent extends BaseComponent implements OnInit, OnDestroy {
  // Dữ liệu CV
  // Resume data
  // resumes: Resume[] = [];
  // currentResume: Resume | null = null;
  // resumeTemplates: ResumeTemplate[] = [];
  // selectedTemplateId: string = '';
  
  // // Trạng thái UI
  // // UI state
  // isLoading = {
  //   resumes: false,
  //   currentResume: false,
  //   templates: false,
  //   generating: false,
  //   saving: false,
  //   exporting: false
  // };
  // errors = {
  //   resumes: '',
  //   currentResume: '',
  //   templates: '',
  //   generating: '',
  //   saving: '',
  //   exporting: ''
  // };
  // activeTab: 'details' | 'content' | 'preview' | 'export' = 'details';
  // activeSectionTab: ResumeSectionType | 'personal' | 'all' = 'all';
  // showNewResumeModal = false;
  // showSectionModal = false;
  // showSectionItemModal = false;
  // showDeleteConfirmationModal = false;
  // resumeToDelete: string | null = null;
  
  // // Chỉnh sửa dữ liệu
  // // Edit data
  // currentSection: ResumeSection | null = null;
  // editingSectionIndex: number | null = null;
  // editingItemIndex: number | null = null;
  
  // // Forms
  // resumeDetailsForm: FormGroup;
  // personalInfoForm: FormGroup;
  // contactInfoForm: FormGroup;
  // sectionForm: FormGroup;
  // sectionItemForm: FormGroup;
  // newResumeForm: FormGroup;
  // sectionForms: {[key: string]: FormGroup} = {};
  // autoSaveSubscription: Subscription | null = null;
  
  // // Xuất CV
  // // Export options
  // exportOptions: ResumeExportOptions = {
  //   format: 'pdf',
  //   colorScheme: 'blue',
  //   fontFamily: 'roboto',
  //   fontSize: 'medium',
  //   margins: 'normal',
  //   includeSections: []
  // };
  
  // /**
  //  * Khởi tạo component
  //  * Initialize component
  //  * @param fb FormBuilder để tạo form
  //  * @param resumeService Service xử lý CV
  //  * @param userService Service xử lý thông tin người dùng
  //  * @param notificationService Service hiển thị thông báo
  //  */
  // constructor(
  //   private fb: FormBuilder,
  //   private resumeService: ResumeBuilderService,
  //   private userService: UserService,
  //   private notificationService: NotificationService
  // ) {
  //   super();
    
  //   // Khởi tạo form chi tiết CV
  //   // Initialize resume details form
  //   this.resumeDetailsForm = this.fb.group({
  //     title: ['', [Validators.required, Validators.maxLength(100)]],
  //     templateId: ['default-template', Validators.required]
  //   });
    
  //   // Khởi tạo form thông tin cá nhân
  //   // Initialize personal info form
  //   this.personalInfoForm = this.fb.group({
  //     firstName: ['', [Validators.required, Validators.maxLength(50)]],
  //     lastName: ['', [Validators.required, Validators.maxLength(50)]],
  //     jobTitle: ['', [Validators.required, Validators.maxLength(100)]],
  //     photo: ['']
  //   });
    
  //   // Khởi tạo form thông tin liên hệ
  //   // Initialize contact info form
  //   this.contactInfoForm = this.fb.group({
  //     email: ['', [Validators.required, Validators.email]],
  //     phone: ['', Validators.pattern('^[+]?[(]?[0-9]{3}[)]?[-\\s.]?[0-9]{3}[-\\s.]?[0-9]{4,6}$')],
  //     location: ['', Validators.maxLength(100)],
  //     website: ['', Validators.pattern('https?:\\/\\/(www\\.)?[-a-zA-Z0-9@:%._\\+~#=]{1,256}\\.[a-zA-Z0-9()]{1,6}\\b([-a-zA-Z0-9()@:%_\\+.~#?&//=]*)')],
  //     socialLinks: this.fb.array([])
  //   });
    
  //   // Khởi tạo form section
  //   // Initialize section form
  //   this.sectionForm = this.fb.group({
  //     title: ['', [Validators.required, Validators.maxLength(100)]],
  //     type: ['custom', Validators.required],
  //     isVisible: [true]
  //   });
    
  //   // Khởi tạo form mục section
  //   // Initialize section item form
  //   this.sectionItemForm = this.fb.group({
  //     title: ['', [Validators.required, Validators.maxLength(100)]],
  //     subtitle: ['', Validators.maxLength(100)],
  //     startDate: [''],
  //     endDate: [''],
  //     isCurrent: [false],
  //     description: [''],
  //     tags: this.fb.array([]),
  //     location: [''],
  //     url: ['', Validators.pattern('https?:\\/\\/(www\\.)?[-a-zA-Z0-9@:%._\\+~#=]{1,256}\\.[a-zA-Z0-9()]{1,6}\\b([-a-zA-Z0-9()@:%_\\+.~#?&//=]*)')],
      
  //     // Education fields
  //     degree: [''],
  //     institution: [''],
  //     fieldOfStudy: [''],
  //     gpa: [''],
      
  //     // Experience fields
  //     company: [''],
  //     position: [''],
  //     responsibilities: this.fb.array([]),
      
  //     // Skills fields
  //     proficiency: [null],
  //     category: [''],
      
  //     // Projects fields
  //     role: [''],
  //     technologies: this.fb.array([]),
      
  //     // Course fields
  //     provider: [''],
  //     completionDate: [''],
  //     skills: this.fb.array([]),
      
  //     // Certificate fields
  //     issuer: [''],
  //     credentialId: [''],
  //     issueDate: [''],
  //     expirationDate: ['']
  //   });
    
  //   // Khởi tạo form CV mới
  //   // Initialize new resume form
  //   this.newResumeForm = this.fb.group({
  //     title: ['Sơ yếu lý lịch mới', [Validators.required, Validators.maxLength(100)]],
  //     templateId: ['default-template', Validators.required]
  //   });
    
  //   // Thiết lập validation logic cho startDate và endDate
  //   // Set up validation logic for startDate and endDate
  //   this.sectionItemForm.get('isCurrent')?.valueChanges.subscribe(isCurrent => {
  //     const endDateControl = this.sectionItemForm.get('endDate');
  //     if (isCurrent) {
  //       endDateControl?.setValue(null);
  //       endDateControl?.disable();
  //     } else {
  //       endDateControl?.enable();
  //     }
  //   });
  // }
  
  // /**
  //  * Khởi tạo dữ liệu khi component được tải
  //  * Initialize data when component is loaded
  //  */
  // ngOnInit(): void {
  //   this.loadResumes();
  //   this.loadResumeTemplates();
  //   this.setupFormListeners();
    
  //   // Tải thông tin người dùng để điền vào form thông tin cá nhân
  //   // Load user data to populate personal info form
  //   this.userService.getUserProfile()
  //     .pipe(takeUntil(this._onDestroySub))
  //     .subscribe({
  //       next: (user) => {
  //         if (user) {
  //           this.personalInfoForm.patchValue({
  //             firstName: user.firstName || '',
  //             lastName: user.lastName || '',
  //             email: user.email || '',
  //             jobTitle: user.jobTitle || ''
  //           });
            
  //           this.contactInfoForm.patchValue({
  //             email: user.email || '',
  //             phone: user.phoneNumber || ''
  //           });
  //         }
  //       },
  //       error: (error) => {
  //         console.error('Lỗi khi tải thông tin người dùng:', error);
  //       }
  //     });
  // }
  
  // /**
  //  * Dọn dẹp tài nguyên khi component bị hủy
  //  * Clean up resources when component is destroyed
  //  */
  // override ngOnDestroy(): void {
  //   super.ngOnDestroy();
  //   if (this.autoSaveSubscription) {
  //     this.autoSaveSubscription.unsubscribe();
  //   }
  // }
  
  // /**
  //  * Thiết lập các listener cho form để tự động lưu khi có thay đổi
  //  * Set up form listeners for auto-saving on changes
  //  */
  // setupFormListeners(): void {
  //   // Kết hợp tất cả các form và tự động lưu khi có thay đổi
  //   // Combine all forms and auto-save when any changes
  //   const formChanges = [
  //     this.resumeDetailsForm.valueChanges,
  //     this.personalInfoForm.valueChanges,
  //     this.contactInfoForm.valueChanges
  //   ];
    
  //   this.autoSaveSubscription = of(...formChanges)
  //     .pipe(
  //       debounceTime(2000), // Đợi 2 giây không hoạt động
  //       takeUntil(this._onDestroySub)
  //     )
  //     .subscribe(() => {
  //       if (this.currentResume && this.resumeDetailsForm.valid) {
  //         this.saveCurrentResume();
  //       }
  //     });
  // }
  
  // /**
  //  * Tải danh sách CV của người dùng
  //  * Load user's resumes
  //  */
  // loadResumes(): void {
  //   this.isLoading.resumes = true;
  //   this.errors.resumes = '';
    
  //   this.resumeService.getUserResumes()
  //     .pipe(
  //       takeUntil(this._onDestroySub),
  //       finalize(() => {
  //         this.isLoading.resumes = false;
  //       })
  //     )
  //     .subscribe({
  //       next: (resumes) => {
  //         this.resumes = resumes;
          
  //         // Tải CV đầu tiên nếu có
  //         // Load the first resume if available
  //         if (resumes.length > 0 && !this.currentResume) {
  //           this.loadResume(resumes[0].id!);
  //         }
  //       },
  //       error: (error) => {
  //         console.error('Lỗi khi tải danh sách CV:', error);
  //         this.errors.resumes = 'Không thể tải danh sách CV. Vui lòng thử lại sau.';
  //       }
  //     });
  // }
  
  // /**
  //  * Tải thông tin chi tiết của một CV
  //  * Load detailed information of a resume
  //  * @param resumeId ID của CV cần tải
  //  */
  // loadResume(resumeId: string): void {
  //   this.isLoading.currentResume = true;
  //   this.errors.currentResume = '';
    
  //   this.resumeService.getResumeById(resumeId)
  //     .pipe(
  //       takeUntil(this._onDestroySub),
  //       finalize(() => {
  //         this.isLoading.currentResume = false;
  //       })
  //     )
  //     .subscribe({
  //       next: (resume) => {
  //         this.currentResume = resume;
  //         this.selectedTemplateId = resume.templateId;
  //         this.populateForms(resume);
  //         this.activeTab = 'details';
  //       },
  //       error: (error) => {
  //         console.error(`Lỗi khi tải CV (${resumeId}):`, error);
  //         this.errors.currentResume = 'Không thể tải thông tin CV. Vui lòng thử lại sau.';
  //       }
  //     });
  // }
  
  // /**
  //  * Tải danh sách các mẫu CV có sẵn
  //  * Load available resume templates
  //  */
  // loadResumeTemplates(): void {
  //   this.isLoading.templates = true;
  //   this.errors.templates = '';
    
  //   this.resumeService.getResumeTemplates()
  //     .pipe(
  //       takeUntil(this._onDestroySub),
  //       finalize(() => {
  //         this.isLoading.templates = false;
  //       })
  //     )
  //     .subscribe({
  //       next: (templates) => {
  //         this.resumeTemplates = templates;
  //       },
  //       error: (error) => {
  //         console.error('Lỗi khi tải mẫu CV:', error);
  //         this.errors.templates = 'Không thể tải danh sách mẫu CV. Vui lòng thử lại sau.';
  //       }
  //     });
  // }
  
  // /**
  //  * Điền dữ liệu CV vào các form
  //  * Populate forms with resume data
  //  * @param resume CV cần điền dữ liệu
  //  */
  // populateForms(resume: Resume): void {
  //   // Điền form chi tiết CV
  //   // Populate resume details form
  //   this.resumeDetailsForm.patchValue({
  //     title: resume.title,
  //     templateId: resume.templateId
  //   });
    
  //   // Điền form thông tin cá nhân
  //   // Populate personal info form
  //   this.personalInfoForm.patchValue({
  //     firstName: resume.personalInfo.firstName,
  //     lastName: resume.personalInfo.lastName,
  //     jobTitle: resume.personalInfo.jobTitle,
  //     photo: resume.personalInfo.photo || ''
  //   });
    
  //   // Điền form thông tin liên hệ
  //   // Populate contact info form
  //   this.contactInfoForm.patchValue({
  //     email: resume.contactInfo.email,
  //     phone: resume.contactInfo.phone || '',
  //     location: resume.contactInfo.location || '',
  //     website: resume.contactInfo.website || ''
  //   });
    
  //   // Xóa liên kết xã hội hiện tại và thêm liên kết mới
  //   // Clear existing social links and add new ones
  //   const socialLinksArray = this.contactInfoForm.get('socialLinks') as FormArray;
  //   socialLinksArray.clear();
    
  //   resume.socialLinks.forEach(link => {
  //     socialLinksArray.push(this.fb.group({
  //       platform: [link.platform, Validators.required],
  //       url: [link.url, [
  //         Validators.required, 
  //         Validators.pattern('https?:\\/\\/(www\\.)?[-a-zA-Z0-9@:%._\\+~#=]{1,256}\\.[a-zA-Z0-9()]{1,6}\\b([-a-zA-Z0-9()@:%_\\+.~#?&//=]*)')
  //       ]],
  //       customLabel: [link.customLabel || '']
  //     }));
  //   });
    
  //   // Khởi tạo form cho từng section
  //   // Initialize section forms
  //   this.initializeSectionForms(resume.sections);
  // }
  
  // /**
  //  * Khởi tạo các form cho từng section trong CV
  //  * Initialize forms for each resume section
  //  * @param sections Danh sách section trong CV
  //  */
  // initializeSectionForms(sections: ResumeSection[]): void {
  //   // Reset section forms object
  //   this.sectionForms = {};
    
  //   sections.forEach(section => {
  //     const itemsFormArray = this.fb.array([]);
      
  //     section.items.forEach(item => {
  //       const itemForm = this.createItemForm(section.type, item);
  //       itemsFormArray.push(itemForm);
  //     });
      
  //     this.sectionForms[section.id] = this.fb.group({
  //       id: [section.id],
  //       title: [section.title, [Validators.required, Validators.maxLength(100)]],
  //       type: [section.type],
  //       order: [section.order],
  //       isVisible: [section.isVisible],
  //       items: itemsFormArray
  //     });
  //   });
  // }
  
  // /**
  //  * Tạo form cho một mục trong section
  //  * Create form for a section item
  //  * @param sectionType Loại section
  //  * @param item Dữ liệu mục (nếu có)
  //  * @returns Form control cho mục
  //  */
  // createItemForm(sectionType: ResumeSectionType, item?: ResumeSectionItem): FormGroup {
  //   let formGroup: FormGroup;
    
  //   // Tạo cấu trúc form cơ bản
  //   // Create basic form structure
  //   const baseForm = {
  //     id: [item?.id || uuid.v4()],
  //     title: [item?.title || '', [Validators.required, Validators.maxLength(100)]],
  //     subtitle: [item?.subtitle || '', Validators.maxLength(100)],
  //     description: [item?.description || ''],
  //     location: [item?.location || ''],
  //     url: [item?.url || '', Validators.pattern('https?:\\/\\/(www\\.)?[-a-zA-Z0-9@:%._\\+~#=]{1,256}\\.[a-zA-Z0-9()]{1,6}\\b([-a-zA-Z0-9()@:%_\\+.~#?&//=]*)')],
  //     startDate: [item?.startDate || null],
  //     endDate: [item?.endDate || null],
  //     isCurrent: [item?.isCurrent || false],
  //     tags: this.createTagsArray(item?.tags)
  //   };
    
  //   // Thêm trường dữ liệu đặc biệt cho từng loại section
  //   // Add special fields for each section type
  //   switch (sectionType) {
  //     case 'education':
  //       const eduItem = item as EducationItem;
  //       formGroup = this.fb.group({
  //         ...baseForm,
  //         degree: [eduItem?.degree || '', Validators.required],
  //         institution: [eduItem?.institution || '', Validators.required],
  //         fieldOfStudy: [eduItem?.fieldOfStudy || ''],
  //         gpa: [eduItem?.gpa || '']
  //       });
  //       break;
        
  //     case 'experience':
  //       const expItem = item as ExperienceItem;
  //       formGroup = this.fb.group({
  //         ...baseForm,
  //         company: [expItem?.company || '', Validators.required],
  //         position: [expItem?.position || '', Validators.required],
  //         responsibilities: this.createResponsibilitiesArray(expItem?.responsibilities)
  //       });
  //       break;
        
  //     case 'skills':
  //       const skillItem = item as SkillItem;
  //       formGroup = this.fb.group({
  //         ...baseForm,
  //         proficiency: [skillItem?.proficiency || 0],
  //         category: [skillItem?.category || '']
  //       });
  //       break;
        
  //     case 'projects':
  //       const projItem = item as ProjectItem;
  //       formGroup = this.fb.group({
  //         ...baseForm,
  //         role: [projItem?.role || ''],
  //         technologies: this.createTechnologiesArray(projItem?.technologies)
  //       });
  //       break;
        
  //     case 'courses':
  //       const courseItem = item as CourseItem;
  //       formGroup = this.fb.group({
  //         ...baseForm,
  //         provider: [courseItem?.provider || '', Validators.required],
  //         completionDate: [courseItem?.completionDate || null],
  //         skills: this.createSkillsArray(courseItem?.skills)
  //       });
  //       break;
        
  //     case 'certificates':
  //       const certItem = item as CertificateItem;
  //       formGroup = this.fb.group({
  //         ...baseForm,
  //         issuer: [certItem?.issuer || '', Validators.required],
  //         credentialId: [certItem?.credentialId || ''],
  //         issueDate: [certItem?.issueDate || null],
  //         expirationDate: [certItem?.expirationDate || null]
  //       });
  //       break;
        
  //     default:
  //       formGroup = this.fb.group(baseForm);
  //       break;
  //   }
    
  //   return formGroup;
  // }
  
  // /**
  //  * Tạo FormArray cho mảng nhãn (tags)
  //  * Create FormArray for tags array
  //  * @param tags Mảng nhãn (nếu có)
  //  * @returns FormArray chứa các nhãn
  //  */
  // createTagsArray(tags?: string[]): FormArray {
  //   const tagsArray = this.fb.array([]);
  //   if (tags && tags.length > 0) {
  //     tags.forEach(tag => {
  //       tagsArray.push(this.fb.control(tag));
  //     });
  //   }
  //   return tagsArray;
  // }
  
  // /**
  //  * Tạo FormArray cho mảng trách nhiệm
  //  * Create FormArray for responsibilities array
  //  * @param responsibilities Mảng trách nhiệm (nếu có)
  //  * @returns FormArray chứa các trách nhiệm
  //  */
  // createResponsibilitiesArray(responsibilities?: string[]): FormArray {
  //   const responsibilitiesArray = this.fb.array([]);
  //   if (responsibilities && responsibilities.length > 0) {
  //     responsibilities.forEach(responsibility => {
  //       responsibilitiesArray.push(this.fb.control(responsibility));
  //     });
  //   }
  //   return responsibilitiesArray;
  // }
  
  // /**
  //  * Tạo FormArray cho mảng công nghệ
  //  * Create FormArray for technologies array
  //  * @param technologies Mảng công nghệ (nếu có)
  //  * @returns FormArray chứa các công nghệ
  //  */
  // createTechnologiesArray(technologies?: string[]): FormArray {
  //   const technologiesArray = this.fb.array([]);
  //   if (technologies và technologies.length > 0) {
  //     technologies.forEach(technology => {
  //       technologiesArray.push(this.fb.control(technology));
  //     });
  //   }
  //   return technologiesArray;
  // }
  
  // /**
  //  * Tạo FormArray cho mảng kỹ năng
  //  * Create FormArray for skills array
  //  * @param skills Mảng kỹ năng (nếu có)
  //  * @returns FormArray chứa các kỹ năng
  //  */
  // createSkillsArray(skills?: string[]): FormArray {
  //   const skillsArray = this.fb.array([]);
  //   if (skills và skills.length > 0) {
  //     skills.forEach(skill => {
  //       skillsArray.push(this.fb.control(skill));
  //     });
  //   }
  //   return skillsArray;
  // }
  
  // /**
  //  * Lấy FormArray chứa các liên kết xã hội
  //  * Get FormArray containing social links
  //  * @returns FormArray chứa các liên kết xã hội
  //  */
  // get socialLinksFormArray(): FormArray {
  //   return this.contactInfoForm.get('socialLinks') as FormArray;
  // }

  // /**
  //  * Lấy FormArray chứa các kỹ năng của khóa học
  //  * Get FormArray containing course skills
  //  * @returns FormArray chứa các kỹ năng
  //  */
  // get courseSkillsFormArray(): FormArray {
  //   return this.sectionItemForm.get('skills') as FormArray;
  // }

  // /**
  //  * Lấy FormArray chứa các nhãn
  //  * Get FormArray containing tags
  //  * @returns FormArray chứa các nhãn
  //  */
  // get tagsFormArray(): FormArray {
  //   return this.sectionItemForm.get('tags') as FormArray;
  // }

  // /**
  //  * Lấy FormArray chứa các trách nhiệm
  //  * Get FormArray containing responsibilities
  //  * @returns FormArray chứa các trách nhiệm
  //  */
  // get responsibilitiesFormArray(): FormArray {
  //   return this.sectionItemForm.get('responsibilities') as FormArray;
  // }

  // /**
  //  * Lấy FormArray chứa các công nghệ
  //  * Get FormArray containing technologies
  //  * @returns FormArray chứa các công nghệ
  //  */
  // get technologiesFormArray(): FormArray {
  //   return this.sectionItemForm.get('technologies') as FormArray;
  // }
  
  // /**
  //  * Hiển thị modal tạo CV mới
  //  * Show new resume modal
  //  */
  // openNewResumeModal(): void {
  //   this.newResumeForm.reset({
  //     title: 'Sơ yếu lý lịch mới',
  //     templateId: 'default-template'
  //   });
  //   this.showNewResumeModal = true;
  // }
  
  // /**
  //  * Tạo CV mới
  //  * Create new resume
  //  */
  // createNewResume(): void {
  //   if (this.newResumeForm.invalid) {
  //     this.newResumeForm.markAllAsTouched();
  //     return;
  //   }
    
  //   const { title, templateId } = this.newResumeForm.value;
    
  //   const newResume: Partial<Resume> = {
  //     title,
  //     templateId,
  //     isPublished: false,
  //     sections: [],
  //     personalInfo: {
  //       firstName: '',
  //       lastName: '',
  //       jobTitle: ''
  //     },
  //     contactInfo: {
  //       email: ''
  //     },
  //     socialLinks: [],
  //     summary: ''
  //   };
    
  //   this.isLoading.saving = true;
    
  //   this.resumeService.createResume(newResume)
  //     .pipe(
  //       takeUntil(this._onDestroySub),
  //       finalize(() => {
  //         this.isLoading.saving = false;
  //       })
  //     )
  //     .subscribe({
  //       next: (resume) => {
  //         this.resumes.push(resume);
  //         this.loadResume(resume.id!);
  //         this.showNewResumeModal = false;
  //         this.notificationService.success('Đã tạo CV mới thành công!');
  //       },
  //       error: (error) => {
  //         console.error('Lỗi khi tạo CV mới:', error);
  //         this.notificationService.error('Không thể tạo CV mới. Vui lòng thử lại sau.');
  //       }
  //     });
  // }
  
  // /**
  //  * Lưu CV hiện tại
  //  * Save current resume
  //  */
  // saveCurrentResume(): void {
  //   if (!this.currentResume) {
  //     return;
  //   }
    
  //   if (this.resumeDetailsForm.invalid || this.personalInfoForm.invalid || this.contactInfoForm.invalid) {
  //     this.resumeDetailsForm.markAllAsTouched();
  //     this.personalInfoForm.markAllAsTouched();
  //     this.contactInfoForm.markAllAsTouched();
  //     return;
  //   }
    
  //   this.isLoading.saving = true;
    
  //   // Lấy dữ liệu từ form
  //   // Get data from forms
  //   const resumeDetailsData = this.resumeDetailsForm.value;
  //   const personalInfoData = this.personalInfoForm.value;
  //   const contactInfoData = this.contactInfoForm.value;
    
  //   // Chuẩn bị dữ liệu cập nhật
  //   // Prepare update data
  //   const updateData: Partial<Resume> = {
  //     title: resumeDetailsData.title,
  //     templateId: resumeDetailsData.templateId,
  //     personalInfo: {
  //       firstName: personalInfoData.firstName,
  //       lastName: personalInfoData.lastName,
  //       jobTitle: personalInfoData.jobTitle,
  //       photo: personalInfoData.photo
  //     },
  //     contactInfo: {
  //       email: contactInfoData.email,
  //       phone: contactInfoData.phone,
  //       location: contactInfoData.location,
  //       website: contactInfoData.website
  //     },
  //     socialLinks: contactInfoData.socialLinks.map((link: any) => {
  //       return {
  //         platform: link.platform,
  //         url: link.url,
  //         customLabel: link.customLabel
  //       };
  //     })
  //   };
    
  //   // Cập nhật CV
  //   // Update resume
  //   this.resumeService.updateResume(this.currentResume.id!, updateData)
  //     .pipe(
  //       takeUntil(this._onDestroySub),
  //       finalize(() => {
  //         this.isLoading.saving = false;
  //       })
  //     )
  //     .subscribe({
  //       next: (updatedResume) => {
  //         this.currentResume = updatedResume;
          
  //         // Cập nhật trong danh sách CV
  //         // Update in resume list
  //         const index = this.resumes.findIndex(r => r.id === updatedResume.id);
  //         if (index !== -1) {
  //           this.resumes[index] = updatedResume;
  //         }
          
  //         this.notificationService.success('Đã lưu CV thành công!');
  //       },
  //       error: (error) => {
  //         console.error('Lỗi khi lưu CV:', error);
  //         this.notificationService.error('Không thể lưu CV. Vui lòng thử lại sau.');
  //       }
  //     });
  // }
  
  // /**
  //  * Mở hộp thoại xác nhận xóa CV
  //  * Open delete resume confirmation dialog
  //  * @param resumeId ID của CV cần xóa
  //  */
  // confirmDeleteResume(resumeId: string): void {
  //   this.resumeToDelete = resumeId;
  //   this.showDeleteConfirmationModal = true;
  // }
  
  // /**
  //  * Xóa CV
  //  * Delete resume
  //  */
  // deleteResume(): void {
  //   if (!this.resumeToDelete) {
  //     return;
  //   }
    
  //   this.isLoading.saving = true;
    
  //   this.resumeService.deleteResume(this.resumeToDelete)
  //     .pipe(
  //       takeUntil(this._onDestroySub),
  //       finalize(() => {
  //         this.isLoading.saving = false;
  //         this.showDeleteConfirmationModal = false;
  //       })
  //     )
  //     .subscribe({
  //       next: () => {
  //         this.resumes = this.resumes.filter(r => r.id !== this.resumeToDelete);
  //         this.currentResume = null;
  //         this.notificationService.success('Đã xóa CV thành công!');
  //       },
  //       error: (error) => {
  //         console.error('Lỗi khi xóa CV:', error);
  //         this.notificationService.error('Không thể xóa CV. Vui lòng thử lại sau.');
  //       }
  //     });
  // }
  
  // /**
  //  * Hiển thị modal chỉnh sửa section
  //  * Show edit section modal
  //  * @param sectionIndex Index của section cần chỉnh sửa
  //  */
  // openEditSectionModal(sectionIndex: number): void {
  //   const section = this.currentResume?.sections[sectionIndex];
  //   if (!section) {
  //     return;
  //   }
    
  //   this.currentSection = section;
  //   this.editingSectionIndex = sectionIndex;
  //   this.sectionForm.patchValue({
  //     title: section.title,
  //     type: section.type,
  //     isVisible: section.isVisible
  //   });
  //   this.showSectionModal = true;
  // }
  
  // /**
  //  * Lưu section đã chỉnh sửa
  //  * Save edited section
  //  */
  // saveEditedSection(): void {
  //   if (this.sectionForm.invalid) {
  //     this.sectionForm.markAllAsTouched();
  //     return;
  //   }
    
  //   const sectionData = this.sectionForm.value;
    
  //   if (this.currentSection && this.editingSectionIndex !== null) {
  //     this.currentSection.title = sectionData.title;
  //     this.currentSection.type = sectionData.type;
  //     this.currentSection.isVisible = sectionData.isVisible;
      
  //     this.currentResume!.sections[this.editingSectionIndex] = this.currentSection;
  //     this.saveCurrentResume();
  //     this.showSectionModal = false;
  //   }
  // }
  
  // /**
  //  * Hiển thị modal chỉnh sửa mục section
  //  * Show edit section item modal
  //  * @param sectionIndex Index của section chứa mục
  //  * @param itemIndex Index của mục cần chỉnh sửa
  //  */
  // openEditSectionItemModal(sectionIndex: number, itemIndex: number): void {
  //   const section = this.currentResume?.sections[sectionIndex];
  //   if (!section) {
  //     return;
  //   }
    
  //   const item = section.items[itemIndex];
  //   if (!item) {
  //     return;
  //   }
    
  //   this.currentSection = section;
  //   this.editingSectionIndex = sectionIndex;
  //   this.editingItemIndex = itemIndex;
  //   this.sectionItemForm.patchValue(item);
  //   this.showSectionItemModal = true;
  // }
  
  // /**
  //  * Lưu mục section đã chỉnh sửa
  //  * Save edited section item
  //  */
  // saveEditedSectionItem(): void {
  //   if (this.sectionItemForm.invalid) {
  //     this.sectionItemForm.markAllAsTouched();
  //     return;
  //   }
    
  //   const itemData = this.sectionItemForm.value;
    
  //   if (this.currentSection && this.editingSectionIndex !== null && this.editingItemIndex !== null) {
  //     this.currentSection.items[this.editingItemIndex] = itemData;
      
  //     this.currentResume!.sections[this.editingSectionIndex] = this.currentSection;
  //     this.saveCurrentResume();
  //     this.showSectionItemModal = false;
  //   }
  // }
  
  // /**
  //  * Hiển thị modal tạo mục section mới
  //  * Show create new section item modal
  //  * @param sectionIndex Index của section chứa mục mới
  //  */
  // openCreateSectionItemModal(sectionIndex: number): void {
  //   const section = this.currentResume?.sections[sectionIndex];
  //   if (!section) {
  //     return;
  //   }
    
  //   this.currentSection = section;
  //   this.editingSectionIndex = sectionIndex;
  //   this.sectionItemForm.reset();
  //   this.showSectionItemModal = true;
  // }
  
  // /**
  //  * Tạo mục section mới
  //  * Create new section item
  //  */
  // createNewSectionItem(): void {
  //   if (this.sectionItemForm.invalid) {
  //     this.sectionItemForm.markAllAsTouched();
  //     return;
  //   }
    
  //   const itemData = this.sectionItemForm.value;
    
  //   if (this.currentSection && this.editingSectionIndex !== null) {
  //     this.currentSection.items.push(itemData);
      
  //     this.currentResume!.sections[this.editingSectionIndex] = this.currentSection;
  //     this.saveCurrentResume();
  //     this.showSectionItemModal = false;
  //   }
  // }
  
  // /**
  //  * Xóa mục section
  //  * Delete section item
  //  * @param sectionIndex Index của section chứa mục
  //  * @param itemIndex Index của mục cần xóa
  //  */
  // deleteSectionItem(sectionIndex: number, itemIndex: number): void {
  //   const section = this.currentResume?.sections[sectionIndex];
  //   if (!section) {
  //     return;
  //   }
    
  //   section.items.splice(itemIndex, 1);
  //   this.currentResume!.sections[sectionIndex] = section;
  //   this.saveCurrentResume();
  // }
  
  // /**
  //  * Hiển thị modal chỉnh sửa tùy chọn xuất CV
  //  * Show edit export options modal
  //  */
  // openEditExportOptionsModal(): void {
  //   this.showExportOptionsModal = true;
  // }
  
  // /**
  //  * Lưu tùy chọn xuất CV
  //  * Save export options
  //  */
  // saveExportOptions(): void {
  //   this.showExportOptionsModal = false;
  // }
  
  // /**
  //  * Xuất CV
  //  * Export resume
  //  */
  // exportResume(): void {
  //   if (!this.currentResume) {
  //     return;
  //   }
    
  //   this.isLoading.exporting = true;
    
  //   this.resumeService.exportResume(this.currentResume.id!, this.exportOptions)
  //     .pipe(
  //       takeUntil(this._onDestroySub),
  //       finalize(() => {
  //         this.isLoading.exporting = false;
  //       })
  //     )
  //     .subscribe({
  //       next: (fileUrl) => {
  //         window.open(fileUrl, '_blank');
  //         this.notificationService.success('Đã xuất CV thành công!');
  //       },
  //       error: (error) => {
  //         console.error('Lỗi khi xuất CV:', error);
  //         this.notificationService.error('Không thể xuất CV. Vui lòng thử lại sau.');
  //       }
  //     });
  // }
}
