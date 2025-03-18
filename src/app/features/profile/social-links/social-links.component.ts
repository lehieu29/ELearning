import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { BaseComponent } from '@app/shared/components/base/base-component';
import { SocialLinksService } from '@app/shared/services/social-links.service';
import { NotificationService } from '@app/shared/services/notification.service';
import { SocialLink, SocialPlatform, SocialLinkStats } from '@app/shared/models/social-link.model';
import { takeUntil, finalize, catchError } from 'rxjs/operators';
import { of } from 'rxjs';

@Component({
  selector: 'app-social-links',
  templateUrl: './social-links.component.html'
})
export class SocialLinksComponent extends BaseComponent implements OnInit {
  // Danh sách liên kết mạng xã hội
  socialLinks: SocialLink[] = [];
  socialLinkStats: SocialLinkStats | null = null;
  
  // Trạng thái UI
  isLoading = true;
  isSaving = false;
  isConnecting = false;
  error = '';
  
  // Form xử lý
  socialLinkForm: FormGroup;
  editingLink: SocialLink | null = null;
  showAddLinkModal = false;
  
  // Danh sách nền tảng mạng xã hội được hỗ trợ
  supportedPlatforms: { value: SocialPlatform, label: string, icon: string, color: string }[] = [
    { value: 'linkedin', label: 'LinkedIn', icon: 'linkedin', color: 'bg-blue-700' },
    { value: 'github', label: 'GitHub', icon: 'github', color: 'bg-gray-800' },
    { value: 'twitter', label: 'Twitter', icon: 'twitter', color: 'bg-blue-400' },
    { value: 'facebook', label: 'Facebook', icon: 'facebook', color: 'bg-blue-600' },
    { value: 'instagram', label: 'Instagram', icon: 'instagram', color: 'bg-pink-600' },
    { value: 'youtube', label: 'YouTube', icon: 'youtube', color: 'bg-red-600' },
    { value: 'medium', label: 'Medium', icon: 'medium', color: 'bg-gray-800' },
    { value: 'stackoverflow', label: 'Stack Overflow', icon: 'stack-overflow', color: 'bg-orange-500' },
    { value: 'dribbble', label: 'Dribbble', icon: 'dribbble', color: 'bg-pink-500' },
    { value: 'behance', label: 'Behance', icon: 'behance', color: 'bg-blue-900' },
    { value: 'website', label: 'Personal Website', icon: 'globe', color: 'bg-purple-600' }
  ];
  
  /**
   * Khởi tạo component với các dịch vụ cần thiết
   * Initialize component with required services
   * @param fb FormBuilder để tạo form
   * @param socialLinksService Service để quản lý liên kết mạng xã hội
   * @param notificationService Service để hiển thị thông báo
   */
  constructor(
    private fb: FormBuilder,
    private socialLinksService: SocialLinksService,
    private notificationService: NotificationService
  ) {
    super();
    
    this.socialLinkForm = this.fb.group({
      platform: ['', Validators.required],
      profileUrl: ['', [Validators.required, Validators.pattern(/^(https?:\/\/)?([\w\d-]+\.)+[\w-]+(\/[\w\d-./?%&=]*)?$/)]],
      username: [''],
      visibility: ['public', Validators.required]
    });
  }
  
  /**
   * Khởi tạo component và tải dữ liệu
   * Initialize component and load data
   */
  ngOnInit(): void {
    this.loadSocialLinks();
    this.loadSocialLinkStats();
  }
  
  /**
   * Tải danh sách liên kết mạng xã hội của người dùng
   * Load user's social links
   */
  loadSocialLinks(): void {
    this.isLoading = true;
    this.error = '';
    
    this.socialLinksService.getUserSocialLinks()
      .pipe(
        takeUntil(this._onDestroySub),
        finalize(() => {
          this.isLoading = false;
        }),
        catchError(err => {
          this.error = 'Không thể tải liên kết mạng xã hội. Vui lòng thử lại sau.';
          this.notificationService.error(this.error);
          return of([]);
        })
      )
      .subscribe(links => {
        this.socialLinks = links;
      });
  }
  
  /**
   * Tải thống kê về liên kết mạng xã hội
   * Load social link statistics
   */
  loadSocialLinkStats(): void {
    this.socialLinksService.getSocialLinkStats()
      .pipe(
        takeUntil(this._onDestroySub),
        catchError(() => of(null))
      )
      .subscribe(stats => {
        this.socialLinkStats = stats;
      });
  }
  
  /**
   * Mở modal thêm liên kết mạng xã hội mới
   * Open modal to add new social link
   */
  openAddLinkModal(): void {
    this.editingLink = null;
    this.socialLinkForm.reset({ 
      platform: '',
      profileUrl: '',
      username: '',
      visibility: 'public'
    });
    this.showAddLinkModal = true;
  }
  
  /**
   * Mở modal chỉnh sửa liên kết mạng xã hội
   * Open modal to edit existing social link
   * @param link Liên kết cần chỉnh sửa
   */
  openEditLinkModal(link: SocialLink): void {
    this.editingLink = { ...link };
    this.socialLinkForm.patchValue({
      platform: link.platform,
      profileUrl: link.profileUrl,
      username: link.username || '',
      visibility: link.visibility
    });
    this.showAddLinkModal = true;
  }
  
  /**
   * Đóng modal thêm/chỉnh sửa liên kết
   * Close add/edit link modal
   */
  closeModal(): void {
    this.showAddLinkModal = false;
    this.editingLink = null;
  }
  
  /**
   * Lưu liên kết mạng xã hội (thêm mới hoặc cập nhật)
   * Save social link (add new or update)
   */
  saveSocialLink(): void {
    if (this.socialLinkForm.invalid) {
      this.socialLinkForm.markAllAsTouched();
      return;
    }
    
    this.isSaving = true;
    const formValue = this.socialLinkForm.value;
    
    // Xác định xem đang thêm mới hay cập nhật
    // Determine if adding or updating
    const observable = this.editingLink 
      ? this.socialLinksService.updateSocialLink({ 
          ...formValue, 
          id: this.editingLink.id, 
          isConnected: this.editingLink.isConnected 
        })
      : this.socialLinksService.addSocialLink({ 
          ...formValue, 
          isConnected: true
        });
    
    observable
      .pipe(
        takeUntil(this._onDestroySub),
        finalize(() => {
          this.isSaving = false;
        }),
        catchError(err => {
          this.notificationService.error('Không thể lưu liên kết mạng xã hội. Vui lòng thử lại sau.');
          return of(null);
        })
      )
      .subscribe(result => {
        if (result) {
          // Cập nhật UI sau khi lưu thành công
          // Update UI after successful save
          this.notificationService.success(
            this.editingLink 
              ? 'Cập nhật liên kết thành công' 
              : 'Thêm liên kết thành công'
          );
          this.loadSocialLinks();
          this.loadSocialLinkStats();
          this.closeModal();
        }
      });
  }
  
  /**
   * Kết nối với nền tảng mạng xã hội qua OAuth
   * Connect to social platform via OAuth
   * @param platform Nền tảng mạng xã hội cần kết nối
   */
  connectSocialPlatform(platform: SocialPlatform): void {
    this.isConnecting = true;
    
    this.socialLinksService.connectSocialPlatform(platform)
      .pipe(
        takeUntil(this._onDestroySub),
        finalize(() => {
          this.isConnecting = false;
        }),
        catchError(err => {
          this.notificationService.error(`Không thể kết nối với ${platform}. Vui lòng thử lại sau.`);
          return of(null);
        })
      )
      .subscribe(response => {
        if (response?.success) {
          this.notificationService.success(`Kết nối với ${platform} thành công`);
          this.loadSocialLinks();
          this.loadSocialLinkStats();
        }
      });
  }
  
  /**
   * Ngắt kết nối với nền tảng mạng xã hội
   * Disconnect from social platform
   * @param link Liên kết mạng xã hội cần ngắt kết nối
   */
  disconnectSocialPlatform(link: SocialLink): void {
    if (confirm(`Bạn có chắc chắn muốn ngắt kết nối với ${this.getPlatformLabel(link.platform)}?`)) {
      this.socialLinksService.disconnectSocialPlatform(link.platform)
        .pipe(
          takeUntil(this._onDestroySub),
          catchError(err => {
            this.notificationService.error(`Không thể ngắt kết nối với ${link.platform}. Vui lòng thử lại sau.`);
            return of(false);
          })
        )
        .subscribe(success => {
          if (success) {
            this.notificationService.success(`Đã ngắt kết nối với ${this.getPlatformLabel(link.platform)}`);
            this.loadSocialLinks();
            this.loadSocialLinkStats();
          }
        });
    }
  }
  
  /**
   * Xóa liên kết mạng xã hội
   * Delete social link
   * @param link Liên kết mạng xã hội cần xóa
   */
  deleteSocialLink(link: SocialLink): void {
    if (confirm(`Bạn có chắc chắn muốn xóa liên kết ${this.getPlatformLabel(link.platform)}?`)) {
      this.socialLinksService.deleteSocialLink(link.id)
        .pipe(
          takeUntil(this._onDestroySub),
          catchError(err => {
            this.notificationService.error(`Không thể xóa liên kết ${link.platform}. Vui lòng thử lại sau.`);
            return of(null);
          })
        )
        .subscribe(() => {
          this.notificationService.success(`Đã xóa liên kết ${this.getPlatformLabel(link.platform)}`);
          this.loadSocialLinks();
          this.loadSocialLinkStats();
        });
    }
  }
  
  /**
   * Cập nhật quyền riêng tư của liên kết mạng xã hội
   * Update privacy settings for a social link
   * @param link Liên kết mạng xã hội cần cập nhật
   * @param visibility Chế độ hiển thị mới
   */
  updateLinkVisibility(link: SocialLink, visibility: 'public' | 'private' | 'connections'): void {
    this.socialLinksService.updateLinkVisibility(link.id, visibility)
      .pipe(
        takeUntil(this._onDestroySub),
        catchError(err => {
          this.notificationService.error('Không thể cập nhật quyền riêng tư liên kết. Vui lòng thử lại sau.');
          return of(null);
        })
      )
      .subscribe(updatedLink => {
        if (updatedLink) {
          this.notificationService.success('Đã cập nhật quyền riêng tư liên kết');
          
          // Cập nhật liên kết trong danh sách
          // Update link in the list
          const index = this.socialLinks.findIndex(l => l.id === link.id);
          if (index !== -1) {
            this.socialLinks[index] = updatedLink;
          }
        }
      });
  }
  
  /**
   * Đồng bộ thông tin liên kết mạng xã hội từ nền tảng
   * Sync social link information from platform
   * @param link Liên kết mạng xã hội cần đồng bộ
   */
  syncSocialLinkInfo(link: SocialLink): void {
    this.socialLinksService.syncSocialLinkInfo(link.id)
      .pipe(
        takeUntil(this._onDestroySub),
        catchError(err => {
          this.notificationService.error(`Không thể đồng bộ thông tin từ ${link.platform}. Vui lòng thử lại sau.`);
          return of(null);
        })
      )
      .subscribe(updatedLink => {
        if (updatedLink) {
          this.notificationService.success(`Đã đồng bộ thông tin từ ${this.getPlatformLabel(link.platform)}`);
          
          // Cập nhật liên kết trong danh sách
          // Update link in the list
          const index = this.socialLinks.findIndex(l => l.id === link.id);
          if (index !== -1) {
            this.socialLinks[index] = updatedLink;
          }
        }
      });
  }
  
  /**
   * Lấy label hiển thị cho nền tảng mạng xã hội
   * Get display label for social platform
   * @param platform Mã nền tảng mạng xã hội
   * @returns Tên hiển thị của nền tảng
   */
  getPlatformLabel(platform: SocialPlatform): string {
    const found = this.supportedPlatforms.find(p => p.value === platform);
    return found ? found.label : platform;
  }
  
  /**
   * Lấy màu nền cho nền tảng mạng xã hội
   * Get background color for social platform
   * @param platform Mã nền tảng mạng xã hội
   * @returns Lớp CSS chứa màu nền
   */
  getPlatformColor(platform: SocialPlatform): string {
    const found = this.supportedPlatforms.find(p => p.value === platform);
    return found ? found.color : 'bg-gray-600';
  }
  
  /**
   * Lấy tên biểu tượng FontAwesome cho nền tảng mạng xã hội
   * Get FontAwesome icon name for social platform
   * @param platform Mã nền tảng mạng xã hội
   * @returns Tên biểu tượng
   */
  getPlatformIcon(platform: SocialPlatform): string {
    const found = this.supportedPlatforms.find(p => p.value === platform);
    return found ? found.icon : 'link';
  }
  
  /**
   * Kiểm tra xem nền tảng đã được kết nối hay chưa
   * Check if platform is already connected
   * @param platform Mã nền tảng mạng xã hội
   * @returns True nếu đã kết nối, ngược lại là False
   */
  isPlatformConnected(platform: SocialPlatform): boolean {
    return this.socialLinks.some(link => link.platform === platform && link.isConnected);
  }
  
  /**
   * Lấy danh sách nền tảng chưa được kết nối
   * Get list of platforms that are not connected yet
   * @returns Danh sách nền tảng chưa kết nối
   */
  getUnconnectedPlatforms(): { value: SocialPlatform, label: string, icon: string, color: string }[] {
    return this.supportedPlatforms.filter(platform => 
      !this.socialLinks.some(link => link.platform === platform.value)
    );
  }

  /**
   * Định dạng ngày tháng theo dạng dễ đọc
   * Format date to readable format
   * @param date Ngày tháng cần định dạng
   * @returns Chuỗi ngày tháng đã định dạng
   */
  formatDate(date: Date | string): string {
    if (!date) return '';
    const d = typeof date === 'string' ? new Date(date) : date;
    return d.toLocaleDateString('vi-VN');
  }
}
