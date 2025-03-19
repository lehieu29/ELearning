import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, AbstractControl } from '@angular/forms';
import { BaseComponent } from '@app/shared/components/base/base-component';
import { NotificationService } from '@app/shared/services/notification.service';
import { ModalComponent } from '@app/shared/components/modal/modal.component';
import { ViewChild } from '@angular/core';
import { takeUntil, finalize } from 'rxjs/operators';
import { forkJoin } from 'rxjs';
import { AccountSettingsService } from '@shared/services/account-settings.service';
import { AccountSettings, LANGUAGES, SecuritySettingsResponse, SessionInfo, TIMEZONES } from '@shared/models/account-settings';

@Component({
  selector: 'app-account-settings',
  templateUrl: './account-settings.component.html'
})
export class AccountSettingsComponent extends BaseComponent implements OnInit {
  // ViewChild để tham chiếu đến modal components
  @ViewChild('passwordModal') passwordModal: ModalComponent;
  @ViewChild('twoFactorModal') twoFactorModal: ModalComponent;
  @ViewChild('deleteAccountModal') deleteAccountModal: ModalComponent;

  // Forms
  profileForm: FormGroup;
  passwordForm: FormGroup;
  notificationsForm: FormGroup;

  // Data
  accountSettings: AccountSettings;
  securitySettings: SecuritySettingsResponse;
  
  // Constants
  timezones = TIMEZONES;
  languages = LANGUAGES;
  
  // UI states
  isLoading = true;
  isLoadingSecurity = false;
  isSaving = false;
  isSavingPassword = false;
  isSavingNotifications = false;
  isVerifyingEmail = false;
  isToggling2FA = false;
  isTerminatingSession = false;
  isRequestingDeletion = false;
  
  // Confirmation flags
  deleteConfirmText = '';
  
  /**
   * Khởi tạo component với các dịch vụ cần thiết
   * Initialize the component with required services
   * @param fb FormBuilder để tạo reactive forms
   * @param accountSettingsService Service quản lý cài đặt tài khoản
   * @param notificationService Service hiển thị thông báo
   */
  constructor(
    private fb: FormBuilder,
    private accountSettingsService: AccountSettingsService,
    private notificationService: NotificationService
  ) {
    super();
    
    // Khởi tạo form thông tin cá nhân
    // Initialize profile form
    this.profileForm = this.fb.group({
      firstName: ['', [Validators.required]],
      lastName: ['', [Validators.required]],
      username: ['', [Validators.required, Validators.minLength(3)]],
      email: ['', [Validators.required, Validators.email]],
      phone: ['', [Validators.pattern(/^\+?[0-9\s\-\(\)]+$/)]],
      language: ['', [Validators.required]],
      timezone: ['', [Validators.required]]
    });
    
    // Khởi tạo form mật khẩu
    // Initialize password form
    this.passwordForm = this.fb.group({
      currentPassword: ['', [Validators.required]],
      newPassword: ['', [Validators.required, Validators.minLength(8), this.passwordStrengthValidator]],
      confirmPassword: ['', [Validators.required]]
    }, {
      validators: this.passwordsMatchValidator
    });
    
    // Khởi tạo form thông báo
    // Initialize notifications form
    this.notificationsForm = this.fb.group({
      courseUpdates: [true],
      promotions: [true],
      accountAlerts: [true],
      feedback: [true],
      newsletters: [true]
    });
  }
  
  /**
   * Tải dữ liệu khi component được khởi tạo
   * Load data when component initializes
   */
  ngOnInit(): void {
    this.loadUserSettings();
  }
  
  /**
   * Tải cài đặt người dùng và thông tin bảo mật
   * Load user settings and security information
   */
  loadUserSettings(): void {
    this.isLoading = true;
    
    forkJoin({
      settings: this.accountSettingsService.getAccountSettings(),
      security: this.accountSettingsService.getSecuritySettings()
    }).pipe(
      takeUntil(this._onDestroySub),
      finalize(() => {
        this.isLoading = false;
      })
    ).subscribe({
      next: ({settings, security}) => {
        this.accountSettings = settings;
        this.securitySettings = security;
        this.updateForms();
      },
      error: (error) => {
        console.error('Failed to load account settings:', error);
        this.notificationService.error('Không thể tải cài đặt tài khoản. Vui lòng thử lại sau.');
      }
    });
  }
  
  /**
   * Cập nhật giá trị form từ dữ liệu đã tải
   * Update form values from loaded data
   */
  updateForms(): void {
    // Update profile form
    this.profileForm.patchValue({
      firstName: this.accountSettings.firstName,
      lastName: this.accountSettings.lastName,
      username: this.accountSettings.username,
      email: this.accountSettings.email,
      phone: this.accountSettings.phone || '',
      language: this.accountSettings.language,
      timezone: this.accountSettings.timezone
    });
    
    // Update notifications form
    this.notificationsForm.patchValue({
      courseUpdates: this.accountSettings.emailNotifications.courseUpdates,
      promotions: this.accountSettings.emailNotifications.promotions,
      accountAlerts: this.accountSettings.emailNotifications.accountAlerts,
      feedback: this.accountSettings.emailNotifications.feedback,
      newsletters: this.accountSettings.emailNotifications.newsletters
    });
  }
  
  /**
   * Lưu thông tin hồ sơ
   * Save profile information
   */
  saveProfile(): void {
    if (this.profileForm.invalid) {
      this.markFormGroupTouched(this.profileForm);
      return;
    }
    
    const formValue = this.profileForm.value;
    
    // Chuẩn bị dữ liệu cập nhật
    // Prepare update data
    const updateData: Partial<AccountSettings> = {
      firstName: formValue.firstName,
      lastName: formValue.lastName,
      username: formValue.username,
      phone: formValue.phone,
      language: formValue.language,
      timezone: formValue.timezone
    };
    
    this.isSaving = true;
    
    this.accountSettingsService.updateAccountSettings(updateData)
      .pipe(
        takeUntil(this._onDestroySub),
        finalize(() => {
          this.isSaving = false;
        })
      )
      .subscribe({
        next: (result) => {
          this.accountSettings = { ...this.accountSettings, ...result };
          this.notificationService.success('Cập nhật thông tin hồ sơ thành công');
        },
        error: (error) => {
          console.error('Failed to update profile:', error);
          this.notificationService.error('Không thể cập nhật thông tin hồ sơ');
        }
      });
  }
  
  /**
   * Mở modal đổi mật khẩu
   * Open change password modal
   */
  openChangePasswordModal(): void {
    this.passwordForm.reset();
    this.passwordModal.openModal();
  }
  
  /**
   * Lưu mật khẩu mới
   * Save new password
   */
  savePassword(): void {
    if (this.passwordForm.invalid) {
      this.markFormGroupTouched(this.passwordForm);
      return;
    }
    
    this.isSavingPassword = true;
    
    const passwordData = {
      currentPassword: this.passwordForm.value.currentPassword,
      newPassword: this.passwordForm.value.newPassword,
      confirmPassword: this.passwordForm.value.confirmPassword
    };
    
    this.accountSettingsService.updatePassword(passwordData)
      .pipe(
        takeUntil(this._onDestroySub),
        finalize(() => {
          this.isSavingPassword = false;
        })
      )
      .subscribe({
        next: (result) => {
          if (result.success) {
            this.notificationService.success('Cập nhật mật khẩu thành công');
            this.passwordModal.closeModal();
            this.loadUserSettings(); // Reload security settings to get new password change date
          } else {
            this.notificationService.error(result.message);
          }
        },
        error: (error) => {
          console.error('Failed to update password:', error);
        }
      });
  }
  
  /**
   * Lưu cài đặt thông báo
   * Save notification settings
   */
  saveNotifications(): void {
    const notificationsData = {
      courseUpdates: this.notificationsForm.value.courseUpdates,
      promotions: this.notificationsForm.value.promotions,
      accountAlerts: this.notificationsForm.value.accountAlerts,
      feedback: this.notificationsForm.value.feedback,
      newsletters: this.notificationsForm.value.newsletters
    };
    
    this.isSavingNotifications = true;
    
    this.accountSettingsService.updateEmailNotifications(notificationsData)
      .pipe(
        takeUntil(this._onDestroySub),
        finalize(() => {
          this.isSavingNotifications = false;
        })
      )
      .subscribe({
        next: (result) => {
          this.accountSettings.emailNotifications = result;
          this.notificationService.success('Cập nhật thông báo thành công');
        },
        error: (error) => {
          console.error('Failed to update notifications:', error);
          this.notificationService.error('Không thể cập nhật cài đặt thông báo');
        }
      });
  }
  
  /**
   * Gửi email xác thực
   * Send verification email
   */
  sendVerificationEmail(): void {
    this.isVerifyingEmail = true;
    
    this.accountSettingsService.sendVerificationEmail(this.accountSettings.email)
      .pipe(
        takeUntil(this._onDestroySub),
        finalize(() => {
          this.isVerifyingEmail = false;
        })
      )
      .subscribe({
        next: (result) => {
          if (result.success) {
            this.notificationService.success('Email xác thực đã được gửi. Vui lòng kiểm tra hộp thư của bạn.');
          } else {
            this.notificationService.warning(result.message);
          }
        },
        error: (error) => {
          console.error('Failed to send verification email:', error);
        }
      });
  }
  
  /**
   * Mở modal xác thực hai yếu tố
   * Open two-factor authentication modal
   */
  openTwoFactorModal(): void {
    this.twoFactorModal.openModal();
  }
  
  /**
   * Bật/tắt xác thực hai yếu tố
   * Toggle two-factor authentication
   * @param enable True để bật, false để tắt
   */
  toggleTwoFactor(enable: boolean): void {
    this.isToggling2FA = true;
    
    this.accountSettingsService.toggleTwoFactorAuth(enable)
      .pipe(
        takeUntil(this._onDestroySub),
        finalize(() => {
          this.isToggling2FA = false;
        })
      )
      .subscribe({
        next: (result) => {
          if (result.success) {
            this.securitySettings.twoFactorEnabled = enable;
            this.accountSettings.twoFactorEnabled = enable;
            this.notificationService.success(enable ? 
              'Đã bật xác thực hai yếu tố' : 
              'Đã tắt xác thực hai yếu tố'
            );
            this.twoFactorModal.closeModal();
          } else {
            this.notificationService.error(result.message);
          }
        },
        error: (error) => {
          console.error('Failed to toggle two-factor authentication:', error);
        }
      });
  }
  
  /**
   * Tải lại thông tin bảo mật
   * Reload security information
   */
  reloadSecuritySettings(): void {
    this.isLoadingSecurity = true;
    
    this.accountSettingsService.getSecuritySettings()
      .pipe(
        takeUntil(this._onDestroySub),
        finalize(() => {
          this.isLoadingSecurity = false;
        })
      )
      .subscribe({
        next: (result) => {
          this.securitySettings = result;
        },
        error: (error) => {
          console.error('Failed to load security settings:', error);
          this.notificationService.error('Không thể tải thông tin bảo mật');
        }
      });
  }
  
  /**
   * Đóng phiên đăng nhập
   * Terminate session
   * @param session Thông tin phiên đăng nhập cần đóng
   */
  terminateSession(session: SessionInfo): void {
    // Không thể đóng phiên hiện tại
    // Cannot terminate current session
    if (session.current) {
      this.notificationService.warning('Không thể đóng phiên hiện tại');
      return;
    }
    
    this.isTerminatingSession = true;
    
    this.accountSettingsService.terminateSession(session.id)
      .pipe(
        takeUntil(this._onDestroySub),
        finalize(() => {
          this.isTerminatingSession = false;
        })
      )
      .subscribe({
        next: (result) => {
          if (result.success) {
            // Xóa phiên đăng nhập khỏi danh sách
            // Remove terminated session from list
            this.securitySettings.activeSessions = this.securitySettings.activeSessions.filter(s => s.id !== session.id);
            this.notificationService.success('Đã đóng phiên đăng nhập');
          }
        },
        error: (error) => {
          console.error('Failed to terminate session:', error);
        }
      });
  }
  
  /**
   * Đóng tất cả phiên đăng nhập khác
   * Terminate all other sessions
   */
  terminateAllOtherSessions(): void {
    this.isTerminatingSession = true;
    
    this.accountSettingsService.terminateAllOtherSessions()
      .pipe(
        takeUntil(this._onDestroySub),
        finalize(() => {
          this.isTerminatingSession = false;
        })
      )
      .subscribe({
        next: (result) => {
          if (result.success) {
            // Chỉ giữ lại phiên hiện tại
            // Keep only the current session
            this.securitySettings.activeSessions = this.securitySettings.activeSessions.filter(s => s.current);
            this.notificationService.success('Đã đóng tất cả phiên đăng nhập khác');
          }
        },
        error: (error) => {
          console.error('Failed to terminate all other sessions:', error);
        }
      });
  }
  
  /**
   * Mở modal xóa tài khoản
   * Open delete account modal
   */
  openDeleteAccountModal(): void {
    this.deleteConfirmText = '';
    this.deleteAccountModal.openModal();
  }
  
  /**
   * Yêu cầu xóa tài khoản
   * Request account deletion
   */
  requestAccountDeletion(): void {
    if (this.deleteConfirmText !== 'DELETE') {
      this.notificationService.warning('Vui lòng nhập DELETE để xác nhận');
      return;
    }
    
    this.isRequestingDeletion = true;
    
    this.accountSettingsService.requestAccountDeletion()
      .pipe(
        takeUntil(this._onDestroySub),
        finalize(() => {
          this.isRequestingDeletion = false;
        })
      )
      .subscribe({
        next: (result) => {
          if (result.success) {
            this.notificationService.success('Yêu cầu xóa tài khoản đã được gửi');
            this.deleteAccountModal.closeModal();
          } else {
            this.notificationService.error(result.message);
          }
        },
        error: (error) => {
          console.error('Failed to request account deletion:', error);
        }
      });
  }
  
  /**
   * Đánh dấu tất cả các điều khiển trong form là đã chạm
   * Mark all controls in the form as touched
   * @param formGroup FormGroup cần đánh dấu
   */
  markFormGroupTouched(formGroup: FormGroup): void {
    Object.keys(formGroup.controls).forEach(key => {
      const control = formGroup.get(key);
      if (control instanceof FormGroup) {
        this.markFormGroupTouched(control);
      } else {
        control.markAsTouched();
      }
    });
  }
  
  /**
   * Validator kiểm tra độ mạnh của mật khẩu
   * Password strength validator
   * @param control AbstractControl cần kiểm tra
   * @returns null nếu hợp lệ, object nếu không hợp lệ
   */
  passwordStrengthValidator(control: AbstractControl): { [key: string]: boolean } | null {
    const value = control.value;
    if (!value) {
      return null;
    }
    
    // Kiểm tra độ mạnh của mật khẩu
    // Check password strength
    const hasUpperCase = /[A-Z]/.test(value);
    const hasLowerCase = /[a-z]/.test(value);
    const hasNumber = /[0-9]/.test(value);
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(value);
    
    const isValid = hasUpperCase && hasLowerCase && hasNumber && hasSpecialChar;
    
    return isValid ? null : { weakPassword: true };
  }
  
  /**
   * Validator kiểm tra mật khẩu và xác nhận mật khẩu có khớp nhau không
   * Passwords match validator
   * @param formGroup FormGroup chứa các điều khiển mật khẩu
   * @returns null nếu hợp lệ, object nếu không hợp lệ
   */
  passwordsMatchValidator(formGroup: FormGroup): { [key: string]: boolean } | null {
    const newPassword = formGroup.get('newPassword').value;
    const confirmPassword = formGroup.get('confirmPassword').value;
    
    return newPassword === confirmPassword ? null : { passwordsMismatch: true };
  }
}
