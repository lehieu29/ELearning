import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { BaseComponent } from '@app/shared/components/base/base-component';
import { PrivacySettingsService } from '@app/shared/services/privacy-settings.service';
import { NotificationService } from '@app/shared/services/notification.service';
import { 
  PrivacySettings,
  ProfileVisibilityLevel,
  LearningActivitySharingLevel,
  DataExportRequest,
  DataDeletionRequest 
} from '@app/shared/models/privacy-settings';
import { takeUntil, finalize, catchError } from 'rxjs/operators';
import { of } from 'rxjs';
import { DateUtils } from '@shared/fn/date-utils';

@Component({
  selector: 'app-privacy-settings',
  templateUrl: './privacy-settings.component.html'
})
export class PrivacySettingsComponent extends BaseComponent implements OnInit {
  privacyForm: FormGroup;
  privacySettings: PrivacySettings | null = null;
  isLoading = true;
  isSaving = false;
  error = '';
  
  // Modal states
  showDataExportModal = false;
  showDataDeletionModal = false;
  showConfirmDeletionModal = false;
  
  // Request statuses
  dataExportRequest: DataExportRequest | null = null;
  dataDeletionRequest: DataDeletionRequest | null = null;
  isRequestingExport = false;
  isRequestingDeletion = false;
  
  // Enums for template usage
  profileVisibilityLevels = ProfileVisibilityLevel;
  learningActivitySharingLevels = LearningActivitySharingLevel;
  
  /**
   * Khởi tạo component với các dịch vụ cần thiết
   * Initialize the component with required services
   */
  constructor(
    private fb: FormBuilder,
    private privacySettingsService: PrivacySettingsService,
    private notificationService: NotificationService
  ) {
    super();
    this.createForm();
  }

  /**
   * Khởi tạo component và tải dữ liệu
   * Initialize the component and load data
   */
  ngOnInit(): void {
    this.loadPrivacySettings();
  }

  /**
   * Khởi tạo form với các trường dữ liệu mặc định
   * Create form with default fields
   */
  private createForm(): void {
    this.privacyForm = this.fb.group({
      profileVisibility: [ProfileVisibilityLevel.PUBLIC],
      dataSharing: this.fb.group({
        shareWithPartners: [false],
        shareWithEmployers: [false],
        shareForResearch: [false],
        shareForPersonalization: [true]
      }),
      cookiePreferences: this.fb.group({
        allowEssential: [{value: true, disabled: true}], // Always required
        allowAnalytics: [true],
        allowFunctional: [true],
        allowAdvertising: [false]
      }),
      marketingConsent: [false],
      learningActivitySharing: [LearningActivitySharingLevel.ACHIEVEMENTS_ONLY]
    });
  }

  /**
   * Tải cài đặt quyền riêng tư của người dùng
   * Load user privacy settings
   */
  loadPrivacySettings(): void {
    this.isLoading = true;
    this.error = '';

    this.privacySettingsService.getPrivacySettings()
      .pipe(
        takeUntil(this._onDestroySub),
        finalize(() => {
          this.isLoading = false;
        }),
        catchError(error => {
          this.error = 'Không thể tải cài đặt quyền riêng tư. Vui lòng thử lại sau.';
          return of(null);
        })
      )
      .subscribe(settings => {
        if (settings) {
          this.privacySettings = settings;
          this.updateFormWithSettings(settings);
        }
      });
  }

  /**
   * Cập nhật form với dữ liệu từ API
   * Update form with data from API
   * @param settings Cài đặt quyền riêng tư của người dùng
   */
  private updateFormWithSettings(settings: PrivacySettings): void {
    this.privacyForm.patchValue({
      profileVisibility: settings.profileVisibility,
      dataSharing: {
        shareWithPartners: settings.dataSharing.shareWithPartners,
        shareWithEmployers: settings.dataSharing.shareWithEmployers,
        shareForResearch: settings.dataSharing.shareForResearch,
        shareForPersonalization: settings.dataSharing.shareForPersonalization
      },
      cookiePreferences: {
        allowAnalytics: settings.cookiePreferences.allowAnalytics,
        allowFunctional: settings.cookiePreferences.allowFunctional,
        allowAdvertising: settings.cookiePreferences.allowAdvertising
      },
      marketingConsent: settings.marketingConsent,
      learningActivitySharing: settings.learningActivitySharing
    });
  }

  /**
   * Lưu cài đặt quyền riêng tư
   * Save privacy settings
   */
  savePrivacySettings(): void {
    if (this.privacyForm.invalid) {
      return;
    }

    this.isSaving = true;
    const formValues = this.privacyForm.value;

    this.privacySettingsService.updatePrivacySettings(formValues)
      .pipe(
        takeUntil(this._onDestroySub),
        finalize(() => {
          this.isSaving = false;
        }),
        catchError(error => {
          this.notificationService.error('Không thể cập nhật cài đặt quyền riêng tư. Vui lòng thử lại sau.');
          return of(null);
        })
      )
      .subscribe(updatedSettings => {
        if (updatedSettings) {
          this.privacySettings = updatedSettings;
          this.notificationService.success('Đã cập nhật cài đặt quyền riêng tư thành công.');
        }
      });
  }

  /**
   * Thay đổi mức độ hiển thị hồ sơ
   * Change profile visibility level
   * @param visibility Mức độ hiển thị mới
   */
  changeProfileVisibility(visibility: string): void {
    this.privacySettingsService.updateProfileVisibility(visibility)
      .pipe(
        takeUntil(this._onDestroySub),
        catchError(error => {
          this.notificationService.error('Không thể cập nhật mức độ hiển thị hồ sơ. Vui lòng thử lại sau.');
          return of(null);
        })
      )
      .subscribe(updatedSettings => {
        if (updatedSettings) {
          this.privacySettings = updatedSettings;
          this.notificationService.success('Đã cập nhật mức độ hiển thị hồ sơ thành công.');
        }
      });
  }

  /**
   * Thay đổi mức độ chia sẻ hoạt động học tập
   * Change learning activity sharing level
   * @param sharingLevel Mức độ chia sẻ mới
   */
  changeLearningActivitySharing(sharingLevel: string): void {
    this.privacySettingsService.updateLearningActivitySharing(sharingLevel)
      .pipe(
        takeUntil(this._onDestroySub),
        catchError(error => {
          this.notificationService.error('Không thể cập nhật mức độ chia sẻ hoạt động học tập. Vui lòng thử lại sau.');
          return of(null);
        })
      )
      .subscribe(updatedSettings => {
        if (updatedSettings) {
          this.privacySettings = updatedSettings;
          this.notificationService.success('Đã cập nhật mức độ chia sẻ hoạt động học tập thành công.');
        }
      });
  }

  /**
   * Cập nhật tùy chọn tiếp thị
   * Update marketing preferences
   * @param consent Giá trị mới cho đồng ý tiếp thị
   */
  updateMarketingConsent(consent: boolean): void {
    this.privacySettingsService.updateMarketingConsent(consent)
      .pipe(
        takeUntil(this._onDestroySub),
        catchError(error => {
          this.notificationService.error('Không thể cập nhật tùy chọn tiếp thị. Vui lòng thử lại sau.');
          return of(null);
        })
      )
      .subscribe(updatedSettings => {
        if (updatedSettings) {
          this.privacySettings = updatedSettings;
          this.notificationService.success('Đã cập nhật tùy chọn tiếp thị thành công.');
        }
      });
  }

  /**
   * Cập nhật tùy chọn cookie
   * Update cookie preferences
   */
  updateCookiePreferences(): void {
    const cookieValues = this.privacyForm.get('cookiePreferences').value;
    
    this.privacySettingsService.updateCookiePreferences(cookieValues)
      .pipe(
        takeUntil(this._onDestroySub),
        catchError(error => {
          this.notificationService.error('Không thể cập nhật tùy chọn cookie. Vui lòng thử lại sau.');
          return of(null);
        })
      )
      .subscribe(updatedSettings => {
        if (updatedSettings) {
          this.privacySettings = updatedSettings;
          this.notificationService.success('Đã cập nhật tùy chọn cookie thành công.');
        }
      });
  }

  /**
   * Mở modal xuất dữ liệu
   * Open data export modal
   */
  openDataExportModal(): void {
    this.showDataExportModal = true;
    this.dataExportRequest = null;
  }

  /**
   * Đóng modal xuất dữ liệu
   * Close data export modal
   */
  closeDataExportModal(): void {
    this.showDataExportModal = false;
  }

  /**
   * Mở modal xóa dữ liệu
   * Open data deletion modal
   */
  openDataDeletionModal(): void {
    this.showDataDeletionModal = true;
    this.dataDeletionRequest = null;
  }

  /**
   * Đóng modal xóa dữ liệu
   * Close data deletion modal
   */
  closeDataDeletionModal(): void {
    this.showDataDeletionModal = false;
  }

  /**
   * Mở modal xác nhận xóa dữ liệu
   * Open confirm deletion modal
   */
  openConfirmDeletionModal(): void {
    this.showConfirmDeletionModal = true;
  }

  /**
   * Đóng modal xác nhận xóa dữ liệu
   * Close confirm deletion modal
   */
  closeConfirmDeletionModal(): void {
    this.showConfirmDeletionModal = false;
  }

  /**
   * Yêu cầu xuất dữ liệu người dùng
   * Request user data export
   */
  requestDataExport(): void {
    this.isRequestingExport = true;
    
    this.privacySettingsService.requestDataExport()
      .pipe(
        takeUntil(this._onDestroySub),
        finalize(() => {
          this.isRequestingExport = false;
        }),
        catchError(error => {
          this.notificationService.error('Không thể yêu cầu xuất dữ liệu. Vui lòng thử lại sau.');
          return of(null);
        })
      )
      .subscribe(request => {
        if (request) {
          this.dataExportRequest = request;
          this.notificationService.success('Yêu cầu xuất dữ liệu đã được gửi thành công.');
        }
      });
  }

  /**
   * Yêu cầu xóa dữ liệu người dùng
   * Request user data deletion
   */
  requestDataDeletion(): void {
    this.isRequestingDeletion = true;
    
    this.privacySettingsService.requestDataDeletion()
      .pipe(
        takeUntil(this._onDestroySub),
        finalize(() => {
          this.isRequestingDeletion = false;
          this.closeConfirmDeletionModal();
        }),
        catchError(error => {
          this.notificationService.error('Không thể yêu cầu xóa dữ liệu. Vui lòng thử lại sau.');
          return of(null);
        })
      )
      .subscribe(request => {
        if (request) {
          this.dataDeletionRequest = request;
          this.notificationService.success('Yêu cầu xóa dữ liệu đã được gửi thành công.');
        }
      });
  }

  /**
   * Định dạng ngày giờ sang chuỗi dễ đọc
   * Format date time to readable string
   * @param date Ngày cần định dạng
   * @returns Chuỗi ngày đã định dạng
   */
  formatDate(date: Date): string {
    return DateUtils.dayjs(date).format('DD/MM/YYYY HH:mm');
  }
  
  /**
   * Lấy văn bản mô tả cho mức độ hiển thị hồ sơ
   * Get descriptive text for profile visibility level
   * @param level Mức độ hiển thị
   * @returns Văn bản mô tả
   */
  getVisibilityDescription(level: string): string {
    switch (level) {
      case ProfileVisibilityLevel.PUBLIC:
        return 'Bất kỳ ai cũng có thể xem hồ sơ của bạn';
      case ProfileVisibilityLevel.CONNECTIONS:
        return 'Chỉ những người kết nối có thể xem hồ sơ của bạn';
      case ProfileVisibilityLevel.PRIVATE:
        return 'Chỉ bạn có thể xem hồ sơ của bạn';
      default:
        return '';
    }
  }

  /**
   * Lấy văn bản mô tả cho mức độ chia sẻ hoạt động học tập
   * Get descriptive text for learning activity sharing level
   * @param level Mức độ chia sẻ
   * @returns Văn bản mô tả
   */
  getSharingDescription(level: string): string {
    switch (level) {
      case LearningActivitySharingLevel.ALL:
        return 'Chia sẻ tất cả hoạt động học tập của bạn';
      case LearningActivitySharingLevel.ACHIEVEMENTS_ONLY:
        return 'Chỉ chia sẻ thành tích (chứng chỉ, hoàn thành khóa học)';
      case LearningActivitySharingLevel.NONE:
        return 'Không chia sẻ bất kỳ hoạt động học tập nào';
      default:
        return '';
    }
  }
}
