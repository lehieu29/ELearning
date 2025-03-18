import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { BaseComponent } from '@app/shared/components/base/base-component';
import { UserService } from '@app/shared/services/user.service';
import { NotificationService } from '@app/shared/services/notification.service';
import { User } from '@app/shared/models/user.model';
import { takeUntil, finalize, catchError } from 'rxjs/operators';
import { of } from 'rxjs';

@Component({
  selector: 'app-user-info',
  templateUrl: './user-info.component.html'
})
export class UserInfoComponent extends BaseComponent implements OnInit {
  user: User | null = null;
  userForm: FormGroup;
  isLoading = true;
  isSaving = false;
  isUploading = false;
  isEditing = false;
  error: string = '';
  selectedFile: File | null = null;
  imagePreviewUrl: string | null = null;
  
  // Languages and timezones for dropdown options
  languages = [
    { code: 'vi', name: 'Tiếng Việt' },
    { code: 'en', name: 'English' },
    { code: 'zh', name: 'Chinese' },
    { code: 'ja', name: 'Japanese' },
    { code: 'ko', name: 'Korean' },
    { code: 'fr', name: 'French' },
    { code: 'de', name: 'German' },
    { code: 'es', name: 'Spanish' }
  ];
  
  timezones = [
    { code: 'Asia/Ho_Chi_Minh', name: '(GMT+7:00) Hà Nội, Bangkok' },
    { code: 'Asia/Singapore', name: '(GMT+8:00) Singapore, Philippines' },
    { code: 'Asia/Tokyo', name: '(GMT+9:00) Tokyo, Seoul' },
    { code: 'America/New_York', name: '(GMT-5:00) New York, Miami' },
    { code: 'America/Los_Angeles', name: '(GMT-8:00) Los Angeles, Seattle' },
    { code: 'Europe/London', name: '(GMT+0:00) London, Dublin' },
    { code: 'Europe/Paris', name: '(GMT+1:00) Paris, Berlin, Rome' },
    { code: 'Australia/Sydney', name: '(GMT+10:00) Sydney, Melbourne' }
  ];
  
  /**
   * Khởi tạo component với các dịch vụ cần thiết
   * Initialize component with required services
   * @param fb FormBuilder để tạo form
   * @param userService Service để tương tác với API người dùng
   * @param notificationService Service để hiển thị thông báo
   */
  constructor(
    private fb: FormBuilder,
    private userService: UserService,
    private notificationService: NotificationService
  ) {
    super();
    
    // Tạo form với các trường thông tin cá nhân
    // Create form with personal information fields
    this.userForm = this.fb.group({
      firstName: ['', [Validators.required, Validators.maxLength(50)]],
      lastName: ['', [Validators.required, Validators.maxLength(50)]],
      jobTitle: ['', Validators.maxLength(100)],
      company: ['', Validators.maxLength(100)],
      biography: ['', Validators.maxLength(500)],
      location: ['', Validators.maxLength(100)],
      phone: ['', Validators.pattern(/^[0-9+\-\s()]{6,20}$/)],
      website: ['', Validators.pattern(/^(https?:\/\/)?.+\..+$/)],
      language: [''],
      timeZone: [''],
      interests: [''],
      isProfilePublic: [false]
    });
  }
  
  /**
   * Khởi tạo component và tải dữ liệu người dùng
   * Initialize component and load user data
   */
  ngOnInit(): void {
    this.loadUserProfile();
  }
  
  /**
   * Tải thông tin hồ sơ người dùng từ API
   * Load user profile information from API
   */
  loadUserProfile(): void {
    this.isLoading = true;
    this.error = '';
    
    this.userService.getUserProfile()
      .pipe(
        takeUntil(this._onDestroySub),
        finalize(() => {
          this.isLoading = false;
        }),
        catchError(err => {
          console.error('Lỗi khi tải thông tin người dùng:', err);
          this.error = 'Không thể tải thông tin hồ sơ. Vui lòng thử lại sau.';
          return of(null);
        })
      )
      .subscribe(user => {
        if (user) {
          this.user = user;
          this.populateForm(user);
        }
      });
  }
  
  /**
   * Điền thông tin người dùng vào form
   * Populate form with user information
   * @param user Thông tin người dùng
   */
  populateForm(user: User): void {
    this.userForm.patchValue({
      firstName: user.firstName || '',
      lastName: user.lastName || '',
      jobTitle: user.jobTitle || '',
      company: user.company || '',
      biography: user.biography || '',
      location: user.location || '',
      phone: user.phone || '',
      website: user.website || '',
      language: user.language || '',
      timeZone: user.timeZone || '',
      interests: user.interests ? user.interests.join(', ') : '',
      isProfilePublic: user.isProfilePublic
    });
  }
  
  /**
   * Bật chế độ chỉnh sửa
   * Enable edit mode
   */
  enableEditMode(): void {
    this.isEditing = true;
  }
  
  /**
   * Thoát khỏi chế độ chỉnh sửa và phục hồi dữ liệu ban đầu
   * Exit edit mode and restore original data
   */
  cancelEdit(): void {
    if (this.user) {
      this.populateForm(this.user);
    }
    this.isEditing = false;
    this.selectedFile = null;
    this.imagePreviewUrl = null;
  }
  
  /**
   * Lưu thông tin hồ sơ người dùng đã được cập nhật
   * Save updated user profile information
   */
  saveProfile(): void {
    if (this.userForm.invalid) {
      this.userForm.markAllAsTouched();
      return;
    }
    
    this.isSaving = true;
    
    // Chuyển đổi interests từ chuỗi thành mảng
    // Convert interests from string to array
    const formValue = { ...this.userForm.value };
    if (typeof formValue.interests === 'string') {
      formValue.interests = formValue.interests
        .split(',')
        .map(tag => tag.trim())
        .filter(tag => tag.length > 0);
    }
    
    this.userService.updateUserProfile(formValue)
      .pipe(
        takeUntil(this._onDestroySub),
        finalize(() => {
          this.isSaving = false;
        }),
        catchError(err => {
          console.error('Lỗi khi cập nhật hồ sơ:', err);
          this.notificationService.error('Không thể cập nhật thông tin hồ sơ. Vui lòng thử lại sau.');
          return of(null);
        })
      )
      .subscribe(updatedUser => {
        if (updatedUser) {
          this.user = updatedUser;
          this.isEditing = false;
          this.notificationService.success('Thông tin hồ sơ đã được cập nhật thành công.');
          
          // Nếu người dùng đã chọn ảnh mới, tải lên ảnh đó
          // If user has selected a new image, upload it
          if (this.selectedFile) {
            this.uploadProfileImage();
          }
        }
      });
  }
  
  /**
   * Xử lý khi người dùng chọn file ảnh đại diện mới
   * Handle when user selects a new profile image
   * @param event Sự kiện input file
   */
  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.selectedFile = input.files[0];
      
      // Validate file type and size
      if (!this.selectedFile.type.includes('image')) {
        this.notificationService.error('Vui lòng chọn file hình ảnh.');
        this.selectedFile = null;
        return;
      }
      
      if (this.selectedFile.size > 5 * 1024 * 1024) {
        this.notificationService.error('Kích thước file không được vượt quá 5MB.');
        this.selectedFile = null;
        return;
      }
      
      // Create preview URL
      const reader = new FileReader();
      reader.onload = () => {
        this.imagePreviewUrl = reader.result as string;
      };
      reader.readAsDataURL(this.selectedFile);
    }
  }
  
  /**
   * Tải lên ảnh đại diện mới
   * Upload new profile image
   */
  uploadProfileImage(): void {
    if (!this.selectedFile) return;
    
    this.isUploading = true;
    
    this.userService.uploadProfileImage(this.selectedFile)
      .pipe(
        takeUntil(this._onDestroySub),
        finalize(() => {
          this.isUploading = false;
          this.selectedFile = null;
        }),
        catchError(err => {
          console.error('Lỗi khi tải lên ảnh đại diện:', err);
          this.notificationService.error('Không thể tải lên ảnh đại diện. Vui lòng thử lại sau.');
          return of(null);
        })
      )
      .subscribe(response => {
        if (response && response.imageUrl && this.user) {
          this.user.profileImage = response.imageUrl;
          this.notificationService.success('Ảnh đại diện đã được cập nhật thành công.');
        }
      });
  }
  
  /**
   * Xóa ảnh đại diện hiện tại
   * Remove current profile image
   */
  removeProfileImage(): void {
    if (!this.user?.profileImage) return;
    
    if (!confirm('Bạn có chắc chắn muốn xóa ảnh đại diện không?')) {
      return;
    }
    
    this.isUploading = true;
    
    this.userService.removeProfileImage()
      .pipe(
        takeUntil(this._onDestroySub),
        finalize(() => {
          this.isUploading = false;
        }),
        catchError(err => {
          console.error('Lỗi khi xóa ảnh đại diện:', err);
          this.notificationService.error('Không thể xóa ảnh đại diện. Vui lòng thử lại sau.');
          return of(null);
        })
      )
      .subscribe(() => {
        if (this.user) {
          this.user.profileImage = undefined;
          this.notificationService.success('Ảnh đại diện đã được xóa thành công.');
        }
      });
  }
  
  /**
   * Làm mới dữ liệu hồ sơ
   * Refresh profile data
   */
  refreshProfile(): void {
    this.loadUserProfile();
  }
  
  /**
   * Lấy họ tên đầy đủ của người dùng
   * Get full name of user
   */
  getFullName(): string {
    if (!this.user) return '';
    return `${this.user.firstName} ${this.user.lastName}`.trim();
  }
  
  /**
   * Kiểm tra một trường form có lỗi và đã được chạm vào không
   * Check if a form field has errors and has been touched
   * @param controlName Tên của control cần kiểm tra
   * @returns True nếu control có lỗi và đã được chạm vào
   */
  hasError(controlName: string): boolean {
    const control = this.userForm.get(controlName);
    return !!control && control.invalid && (control.dirty || control.touched);
  }
  
  /**
   * Lấy thông báo lỗi cho một trường form
   * Get error message for a form field
   * @param controlName Tên của control cần lấy thông báo lỗi
   * @returns Thông báo lỗi
   */
  getErrorMessage(controlName: string): string {
    const control = this.userForm.get(controlName);
    
    if (!control) return '';
    
    if (control.hasError('required')) {
      return 'Trường này là bắt buộc.';
    }
    
    if (control.hasError('maxlength')) {
      const maxLength = control.getError('maxlength').requiredLength;
      return `Không được vượt quá ${maxLength} ký tự.`;
    }
    
    if (control.hasError('pattern')) {
      if (controlName === 'website') {
        return 'Website không hợp lệ. Ví dụ: https://example.com';
      }
      if (controlName === 'phone') {
        return 'Số điện thoại không hợp lệ.';
      }
    }
    
    return 'Trường này không hợp lệ.';
  }
}
