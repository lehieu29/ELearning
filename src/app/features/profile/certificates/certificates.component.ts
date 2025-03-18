import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { BaseComponent } from '@app/shared/components/base/base-component';
import { CertificateService } from '@app/shared/services/certificate.service';
import { NotificationService } from '@app/shared/services/notification.service';
import { Certificate } from '@app/shared/models/certificate.model';
import { takeUntil, finalize, debounceTime } from 'rxjs/operators';
import { saveAs } from 'file-saver';
import * as dayjs from 'dayjs';

@Component({
  selector: 'app-certificates',
  templateUrl: './certificates.component.html'
})
export class CertificatesComponent extends BaseComponent implements OnInit {
  certificates: Certificate[] = [];
  filteredCertificates: Certificate[] = [];
  isLoading = true;
  error = '';
  showShareModal = false;
  selectedCertificate: Certificate | null = null;
  shareForm: FormGroup;
  isSharing = false;
  filterForm: FormGroup;
  isDownloading = false;
  
  // Các lựa chọn bộ lọc
  // Filter options
  typeOptions = [
    { value: '', label: 'Tất cả loại' },
    { value: 'course', label: 'Khóa học' },
    { value: 'nanodegree', label: 'Nanodegree' },
    { value: 'specialization', label: 'Chuyên ngành' },
    { value: 'professional', label: 'Chứng chỉ chuyên môn' }
  ];
  
  statusOptions = [
    { value: '', label: 'Tất cả trạng thái' },
    { value: 'issued', label: 'Đã cấp' },
    { value: 'pending', label: 'Đang xử lý' },
    { value: 'expired', label: 'Hết hạn' },
    { value: 'revoked', label: 'Đã thu hồi' }
  ];
  
  /**
   * Khởi tạo component với các dịch vụ cần thiết
   * Initialize component with required services
   * @param fb FormBuilder để tạo các form
   * @param certificateService Service để quản lý chứng chỉ
   * @param notificationService Service hiển thị thông báo
   */
  constructor(
    private fb: FormBuilder,
    private certificateService: CertificateService,
    private notificationService: NotificationService
  ) {
    super();
    
    this.filterForm = this.fb.group({
      query: [''],
      type: [''],
      status: [''],
      dateRange: this.fb.group({
        start: [null],
        end: [null]
      })
    });
    
    this.shareForm = this.fb.group({
      emails: [''],
      message: ['']
    });
  }
  
  /**
   * Khởi tạo component và đăng ký lắng nghe các thay đổi
   * Initialize component and subscribe to changes
   */
  ngOnInit(): void {
    this.loadCertificates();
    
    // Lắng nghe các thay đổi trong bộ lọc và cập nhật kết quả
    // Listen for filter changes and update results
    this.filterForm.valueChanges
      .pipe(
        takeUntil(this._onDestroySub),
        debounceTime(300)
      )
      .subscribe(() => {
        this.applyFilters();
      });
  }
  
  /**
   * Tải danh sách chứng chỉ của người dùng
   * Load user's certificates
   */
  loadCertificates(): void {
    this.isLoading = true;
    this.error = '';
    
    this.certificateService.getUserCertificates()
      .pipe(
        takeUntil(this._onDestroySub),
        finalize(() => {
          this.isLoading = false;
        })
      )
      .subscribe({
        next: (certificates) => {
          this.certificates = certificates;
          this.applyFilters();
        },
        error: (err) => {
          console.error('Lỗi khi tải chứng chỉ:', err);
          this.error = 'Không thể tải danh sách chứng chỉ. Vui lòng thử lại sau.';
        }
      });
  }
  
  /**
   * Áp dụng bộ lọc vào danh sách chứng chỉ
   * Apply filters to certificate list
   */
  applyFilters(): void {
    const filters = this.filterForm.value;
    
    this.filteredCertificates = this.certificates.filter(cert => {
      // Lọc theo từ khóa tìm kiếm
      // Filter by search query
      if (filters.query && !this.matchesQuery(cert, filters.query)) {
        return false;
      }
      
      // Lọc theo loại chứng chỉ
      // Filter by certificate type
      if (filters.type && cert.type !== filters.type) {
        return false;
      }
      
      // Lọc theo trạng thái
      // Filter by status
      if (filters.status && cert.status !== filters.status) {
        return false;
      }
      
      // Lọc theo khoảng thời gian
      // Filter by date range
      if (filters.dateRange?.start && new Date(cert.issueDate) < filters.dateRange.start) {
        return false;
      }
      
      if (filters.dateRange?.end) {
        const endDate = new Date(filters.dateRange.end);
        endDate.setHours(23, 59, 59, 999); // Set to end of day
        if (new Date(cert.issueDate) > endDate) {
          return false;
        }
      }
      
      return true;
    });
    
    // Sắp xếp chứng chỉ theo thời gian (mới nhất đầu tiên)
    // Sort certificates by date (newest first)
    this.filteredCertificates.sort((a, b) => 
      new Date(b.issueDate).getTime() - new Date(a.issueDate).getTime()
    );
  }
  
  /**
   * Kiểm tra xem chứng chỉ có khớp với từ khóa tìm kiếm không
   * Check if certificate matches search query
   * @param cert Chứng chỉ cần kiểm tra
   * @param query Từ khóa tìm kiếm
   */
  private matchesQuery(cert: Certificate, query: string): boolean {
    const lowerQuery = query.toLowerCase();
    return cert.title.toLowerCase().includes(lowerQuery) || 
           cert.courseName.toLowerCase().includes(lowerQuery) ||
           cert.credentialId.toLowerCase().includes(lowerQuery) ||
           (cert.skills && cert.skills.some(skill => skill.toLowerCase().includes(lowerQuery)));
  }
  
  /**
   * Tải xuống chứng chỉ
   * Download certificate
   * @param certificate Chứng chỉ cần tải xuống
   */
  downloadCertificate(certificate: Certificate): void {
    this.isDownloading = true;
    
    this.certificateService.downloadCertificate(certificate.id)
      .pipe(
        takeUntil(this._onDestroySub),
        finalize(() => {
          this.isDownloading = false;
        })
      )
      .subscribe({
        next: (blob) => {
          // Sử dụng file-saver để tải xuống tệp
          // Use file-saver to download the file
          saveAs(blob, `${certificate.courseName} - Certificate.pdf`);
          this.notificationService.success('Đã tải xuống chứng chỉ thành công.');
        },
        error: (err) => {
          console.error('Lỗi khi tải xuống chứng chỉ:', err);
          this.notificationService.error('Không thể tải xuống chứng chỉ. Vui lòng thử lại sau.');
        }
      });
  }
  
  /**
   * Mở modal chia sẻ chứng chỉ
   * Open share certificate modal
   * @param certificate Chứng chỉ cần chia sẻ
   */
  openShareModal(certificate: Certificate): void {
    this.selectedCertificate = certificate;
    this.shareForm.reset({ emails: '', message: '' });
    this.showShareModal = true;
  }
  
  /**
   * Đóng modal chia sẻ
   * Close share modal
   */
  closeShareModal(): void {
    this.showShareModal = false;
    this.selectedCertificate = null;
  }
  
  /**
   * Chia sẻ chứng chỉ qua email
   * Share certificate via email
   */
  shareCertificate(): void {
    if (!this.selectedCertificate || !this.shareForm.valid) {
      return;
    }
    
    const formValue = this.shareForm.value;
    const emails = formValue.emails.split(',').map(email => email.trim());
    
    if (emails.length === 0) {
      this.notificationService.warning('Vui lòng nhập ít nhất một địa chỉ email.');
      return;
    }
    
    this.isSharing = true;
    
    this.certificateService.shareCertificate(
      this.selectedCertificate.id,
      emails,
      formValue.message
    )
      .pipe(
        takeUntil(this._onDestroySub),
        finalize(() => {
          this.isSharing = false;
        })
      )
      .subscribe({
        next: () => {
          this.notificationService.success('Đã chia sẻ chứng chỉ thành công.');
          this.closeShareModal();
        },
        error: (err) => {
          console.error('Lỗi khi chia sẻ chứng chỉ:', err);
          this.notificationService.error('Không thể chia sẻ chứng chỉ. Vui lòng thử lại sau.');
        }
      });
  }
  
  /**
   * Thêm chứng chỉ vào LinkedIn
   * Add certificate to LinkedIn
   * @param certificate Chứng chỉ cần thêm vào LinkedIn
   */
  addToLinkedIn(certificate: Certificate): void {
    this.certificateService.addToLinkedIn(certificate.id)
      .pipe(takeUntil(this._onDestroySub))
      .subscribe({
        next: (response) => {
          // Mở cửa sổ mới đến URL LinkedIn
          // Open new window to LinkedIn URL
          window.open(response.linkedInUrl, '_blank');
        },
        error: (err) => {
          console.error('Lỗi khi thêm vào LinkedIn:', err);
          this.notificationService.error('Không thể thêm chứng chỉ vào LinkedIn. Vui lòng thử lại sau.');
        }
      });
  }
  
  /**
   * Định dạng ngày tháng theo định dạng mong muốn
   * Format date to desired format
   * @param date Ngày cần định dạng
   */
  formatDate(date: string): string {
    return dayjs(date).format('DD/MM/YYYY');
  }
  
  /**
   * Làm mới danh sách chứng chỉ
   * Refresh certificates list
   */
  refreshCertificates(): void {
    this.filterForm.reset({
      query: '',
      type: '',
      status: '',
      dateRange: {
        start: null,
        end: null
      }
    });
    this.loadCertificates();
  }
  
  /**
   * Xác định lớp CSS cho trạng thái chứng chỉ
   * Determine CSS class for certificate status
   * @param status Trạng thái chứng chỉ
   */
  getStatusClass(status: string): string {
    switch (status) {
      case 'issued': return 'bg-green-100 text-green-800';
      case 'expired': return 'bg-gray-100 text-gray-800';
      case 'revoked': return 'bg-red-100 text-red-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-blue-100 text-blue-800';
    }
  }
  
  /**
   * Xác định văn bản hiển thị cho trạng thái
   * Determine display text for status
   * @param status Trạng thái chứng chỉ
   */
  getStatusText(status: string): string {
    switch (status) {
      case 'issued': return 'Đã cấp';
      case 'expired': return 'Hết hạn';
      case 'revoked': return 'Đã thu hồi';
      case 'pending': return 'Đang xử lý';
      default: return 'Không xác định';
    }
  }
}
