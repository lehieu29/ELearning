// File path: src/app/features/course/lesson-player/download-options/download-options.component.ts
import { Component, Input, OnInit } from '@angular/core';
import { BaseComponent } from '@app/shared/components/base/base-component';
import { CourseService } from '@app/shared/services/course.service';
import { NotificationService } from '@app/shared/services/notification.service';
import { Attachment } from '@app/shared/models/course.model';
import { HttpClient } from '@angular/common/http';
import { takeUntil } from 'rxjs/operators';
import { saveAs } from 'file-saver';

interface DownloadableResource {
  id: string;
  title: string;
  type: string; // 'video' | 'pdf' | 'code' | 'slides' | 'image' | 'transcript' | 'link'
  url: string;
  size?: number;
  format?: string;
}

@Component({
  selector: 'app-download-options',
  templateUrl: './download-options.component.html'
})
export class DownloadOptionsComponent extends BaseComponent implements OnInit {
  @Input() courseId: string;
  @Input() lessonId: string;
  @Input() videoUrl: string;
  
  isDropdownOpen = false;
  isLoading = false;
  error: string = '';
  downloadableResources: DownloadableResource[] = [];
  isDownloading: { [id: string]: boolean } = {};
  
  constructor(
    private http: HttpClient,
    private courseService: CourseService,
    private notificationService: NotificationService
  ) {
    super();
  }
  
  /**
   * Khởi tạo component và tải danh sách tài nguyên khi có courseId và lessonId
   * Initialize the component and load resources when courseId and lessonId are available
   */
  ngOnInit(): void {
    if (this.courseId && this.lessonId) {
      this.loadDownloadableResources();
    }
  }
  
  /**
   * Tải danh sách tài nguyên có thể tải xuống từ API
   * Load list of downloadable resources from the API
   */
  loadDownloadableResources(): void {
    this.isLoading = true;
    this.error = '';
    
    this.courseService.getLessonDownloadableResources(this.courseId, this.lessonId)
      .pipe(takeUntil(this._onDestroySub))
      .subscribe({
        next: (resources) => {
          this.downloadableResources = resources;
          
          // If video URL is provided and there's no video in the resources, add it
          if (this.videoUrl && !resources.some(r => r.type === 'video')) {
            this.downloadableResources.unshift({
              id: 'video-main',
              title: 'Bài giảng video',
              type: 'video',
              url: this.videoUrl,
              format: 'MP4'
            });
          }
          
          this.isLoading = false;
        },
        error: (err) => {
          console.error('Lỗi khi tải danh sách tài nguyên:', err);
          this.error = 'Không thể tải danh sách tài nguyên. Vui lòng thử lại sau.';
          this.isLoading = false;
        }
      });
  }
  
  /**
   * Chuyển đổi hiển thị/ẩn dropdown
   * Toggle dropdown visibility
   */
  toggleDropdown(): void {
    this.isDropdownOpen = !this.isDropdownOpen;
  }
  
  /**
   * Đóng dropdown khi click bên ngoài
   * Close dropdown when clicking outside
   */
  closeDropdown(): void {
    this.isDropdownOpen = false;
  }
  
  /**
   * Tải xuống tài nguyên được chọn
   * Download the selected resource
   * @param resource Tài nguyên cần tải xuống / Resource to download
   */
  downloadResource(resource: DownloadableResource): void {
    // Prevent multiple simultaneous downloads of the same resource
    if (this.isDownloading[resource.id]) return;
    
    this.isDownloading[resource.id] = true;
    
    // For external links, open in new tab
    if (resource.type === 'link') {
      window.open(resource.url, '_blank');
      this.isDownloading[resource.id] = false;
      this.closeDropdown();
      return;
    }
    
    // For direct URLs that can be downloaded via browser
    if (resource.url && (resource.url.startsWith('http://') || resource.url.startsWith('https://'))) {
      this.http.get(resource.url, { responseType: 'blob' })
        .pipe(takeUntil(this._onDestroySub))
        .subscribe({
          next: (blob) => {
            saveAs(blob, resource.title || `download.${this.getDefaultExtension(resource.type)}`);
            this.notificationService.success(`Đang tải xuống ${resource.title}...`);
            this.isDownloading[resource.id] = false;
            this.closeDropdown();
          },
          error: (err) => {
            console.error('Lỗi khi tải xuống tài nguyên:', err);
            this.notificationService.error(`Không thể tải xuống ${resource.title}. Vui lòng thử lại sau.`);
            this.isDownloading[resource.id] = false;
          }
        });
      return;
    }
    
    // For resources that need to be requested from the API
    this.courseService.downloadResource(this.courseId, this.lessonId, resource.id)
      .pipe(takeUntil(this._onDestroySub))
      .subscribe({
        next: (response) => {
          // If response is a URL, open it
          if (typeof response === 'string' && (response.startsWith('http://') || response.startsWith('https://'))) {
            window.open(response, '_blank');
            this.notificationService.success(`Đang tải xuống ${resource.title}...`);
          } 
          // If response is a blob, save it
          else if (response instanceof Blob) {
            saveAs(response, resource.title || `download.${this.getDefaultExtension(resource.type)}`);
            this.notificationService.success(`Đang tải xuống ${resource.title}...`);
          }
          
          this.isDownloading[resource.id] = false;
          this.closeDropdown();
        },
        error: (err) => {
          console.error('Lỗi khi tải xuống tài nguyên:', err);
          this.notificationService.error(`Không thể tải xuống ${resource.title}. Vui lòng thử lại sau.`);
          this.isDownloading[resource.id] = false;
        }
      });
  }
  
  /**
   * Lấy biểu tượng phù hợp với loại tài nguyên
   * Get the appropriate icon for the resource type
   * @param type Loại tài nguyên / Resource type
   * @returns Tên biểu tượng / Icon name
   */
  getFileTypeIcon(type: string): string {
    switch (type) {
      case 'video': return 'film';
      case 'pdf': return 'document-text';
      case 'slides': return 'presentation';
      case 'code': return 'code';
      case 'image': return 'photograph';
      case 'transcript': return 'text';
      case 'link': return 'link';
      default: return 'document';
    }
  }
  
  /**
   * Định dạng hiển thị kích thước tập tin
   * Format file size for display
   * @param size Kích thước tính bằng byte / Size in bytes
   * @returns Chuỗi định dạng kích thước / Formatted size string
   */
  getFileSize(size: number): string {
    if (!size || size === 0) return '';
    
    const units = ['B', 'KB', 'MB', 'GB'];
    let fileSize = size;
    let unitIndex = 0;
    
    while (fileSize >= 1024 && unitIndex < units.length - 1) {
      fileSize /= 1024;
      unitIndex++;
    }
    
    return `${fileSize.toFixed(1)} ${units[unitIndex]}`;
  }
  
  /**
   * Lấy phần mở rộng mặc định cho loại tài nguyên
   * Get default file extension for resource type
   * @param type Loại tài nguyên / Resource type
   * @returns Phần mở rộng tập tin / File extension
   */
  private getDefaultExtension(type: string): string {
    switch (type) {
      case 'video': return 'mp4';
      case 'pdf': return 'pdf';
      case 'slides': return 'pptx';
      case 'code': return 'zip';
      case 'image': return 'jpg';
      case 'transcript': return 'txt';
      default: return 'txt';
    }
  }
}
