import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { BaseComponent } from '@app/shared/components/base/base-component';
import { CourseService } from '@app/shared/services/course.service';
import { NotificationService } from '@app/shared/services/notification.service';
import { Resource } from '@app/shared/models/resource.model';
import { takeUntil, finalize, catchError } from 'rxjs/operators';
import { of } from 'rxjs';

@Component({
  selector: 'app-resources',
  templateUrl: './resources.component.html'
})
export class ResourcesComponent extends BaseComponent implements OnInit {
  courseId: string;
  resources: Resource[] = [];
  filteredResources: Resource[] = [];
  isLoading = true;
  error: string = '';
  
  // Filters
  selectedCategory: string = 'all';
  searchQuery: string = '';
  categories: string[] = [];
  categoryResourceCount: { [key: string]: number } = {};
  
  // Download tracking
  downloading: { [key: string]: boolean } = {};
  
  /**
   * Khởi tạo component với các service cần thiết
   * Initialize component with required services
   * @param route Service để truy cập thông tin route
   * @param courseService Service để truy cập dữ liệu khóa học
   * @param notificationService Service để hiển thị thông báo
   */
  constructor(
    private route: ActivatedRoute,
    private courseService: CourseService,
    private notificationService: NotificationService
  ) {
    super();
  }
  
  /**
   * Khởi tạo component và đăng ký theo dõi các tham số route
   * Initialize component and subscribe to route parameters
   */
  ngOnInit(): void {
    this.route.parent.paramMap
      .pipe(takeUntil(this._onDestroySub))
      .subscribe({
        next: params => {
          this.courseId = params.get('courseId');
          if (this.courseId) {
            this.loadResources();
          } else {
            this.error = 'Không tìm thấy ID khóa học';
            this.isLoading = false;
          }
        },
        error: err => {
          console.error('Lỗi khi đọc tham số route:', err);
          this.error = 'Đã xảy ra lỗi khi tải thông tin';
          this.isLoading = false;
        }
      });
  }
  
  /**
   * Tải tài nguyên của khóa học từ server
   * Load course resources from server
   */
  loadResources(): void {
    this.isLoading = true;
    this.error = '';
    
    this.courseService.getCourseResources(this.courseId)
      .pipe(
        takeUntil(this._onDestroySub),
        finalize(() => {
          this.isLoading = false;
        }),
        catchError(err => {
          console.error('Lỗi khi tải tài nguyên:', err);
          this.error = 'Không thể tải tài nguyên khóa học. Vui lòng thử lại sau.';
          return of([]);
        })
      )
      .subscribe(resources => {
        this.resources = resources;
        this.generateCategories();
        this.applyFilters();
      });
  }
  
  /**
   * Tạo danh sách các danh mục từ tài nguyên và đếm số lượng mỗi danh mục
   * Generate categories list from resources and count items in each category
   */
  generateCategories(): void {
    const categorySet = new Set<string>();
    this.categoryResourceCount = { 'all': this.resources.length };
    
    this.resources.forEach(resource => {
      if (resource.category) {
        categorySet.add(resource.category);
        
        // Đếm số lượng tài nguyên cho mỗi danh mục
        // Count resources for each category
        this.categoryResourceCount[resource.category] = 
          (this.categoryResourceCount[resource.category] || 0) + 1;
      }
    });
    
    this.categories = Array.from(categorySet).sort();
  }
  
  /**
   * Áp dụng bộ lọc vào danh sách tài nguyên
   * Apply filters to resources list
   */
  applyFilters(): void {
    let filtered = this.resources;
    
    // Áp dụng bộ lọc danh mục
    // Apply category filter
    if (this.selectedCategory !== 'all') {
      filtered = filtered.filter(resource => 
        resource.category === this.selectedCategory
      );
    }
    
    // Áp dụng tìm kiếm
    // Apply search query
    if (this.searchQuery) {
      const query = this.searchQuery.toLowerCase().trim();
      filtered = filtered.filter(resource => 
        resource.title.toLowerCase().includes(query) || 
        resource.description.toLowerCase().includes(query) ||
        (resource.tags && resource.tags.some(tag => tag.toLowerCase().includes(query)))
      );
    }
    
    // Sắp xếp tài nguyên
    // Sort resources
    filtered.sort((a, b) => {
      // Ưu tiên sắp xếp theo danh mục, sau đó theo tiêu đề
      // Sort by category first, then by title
      if (a.category === b.category) {
        return a.title.localeCompare(b.title);
      }
      return a.category.localeCompare(b.category);
    });
    
    this.filteredResources = filtered;
  }
  
  /**
   * Xử lý khi người dùng thay đổi danh mục
   * Handle when user changes category
   * @param category Danh mục đã chọn
   */
  onCategoryChange(category: string): void {
    this.selectedCategory = category;
    this.applyFilters();
  }
  
  /**
   * Xử lý khi người dùng thay đổi từ khóa tìm kiếm
   * Handle when user changes search query
   * @param query Từ khóa tìm kiếm
   */
  onSearchChange(query: string): void {
    this.searchQuery = query;
    this.applyFilters();
  }
  
  /**
   * Lấy tên lớp CSS cho màu nền dựa trên loại tài nguyên
   * Get CSS class for background color based on resource type
   * @param type Loại tài nguyên
   * @returns Tên lớp CSS
   */
  getResourceBgClass(type: string): string {
    switch (type) {
      case 'pdf':
        return 'bg-red-100 text-red-700';
      case 'video':
        return 'bg-blue-100 text-blue-700';
      case 'link':
        return 'bg-purple-100 text-purple-700';
      case 'code':
        return 'bg-green-100 text-green-700';
      case 'image':
        return 'bg-yellow-100 text-yellow-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  }
  
  /**
   * Lấy tên icon dựa trên loại tài nguyên
   * Get icon name based on resource type
   * @param type Loại tài nguyên
   * @returns Tên icon
   */
  getResourceIcon(type: string): string {
    switch (type) {
      case 'pdf':
        return 'file-pdf';
      case 'video':
        return 'video';
      case 'link':
        return 'link';
      case 'code':
        return 'code';
      case 'image':
        return 'image';
      case 'audio':
        return 'music';
      case 'spreadsheet':
        return 'table';
      case 'presentation':
        return 'presentation-chart';
      case 'zip':
        return 'archive';
      default:
        return 'document';
    }
  }
  
  /**
   * Tải xuống hoặc mở tài nguyên
   * Download or open resource
   * @param resource Tài nguyên cần tải xuống hoặc mở
   */
  downloadResource(resource: Resource): void {
    if (this.downloading[resource.id]) {
      return; // Tránh tải xuống nhiều lần
    }
    
    // Nếu là liên kết web, mở trong tab mới
    // If it's a web link, open in new tab
    if (resource.type === 'link') {
      window.open(resource.url, '_blank');
      return;
    }
    
    this.downloading[resource.id] = true;
    
    // Tải xuống tài nguyên từ server
    // Download resource from server
    this.courseService.downloadResource(this.courseId, resource.id)
      .pipe(
        takeUntil(this._onDestroySub),
        finalize(() => {
          this.downloading[resource.id] = false;
        }),
        catchError(err => {
          console.error(`Lỗi khi tải xuống tài nguyên ${resource.id}:`, err);
          this.notificationService.error(`Không thể tải xuống '${resource.title}'. Vui lòng thử lại sau.`);
          return of(null);
        })
      )
      .subscribe(response => {
        if (response) {
          // Tạo liên kết tạm thời để tải xuống
          // Create temporary link for download
          const a = document.createElement('a');
          const url = window.URL.createObjectURL(response);
          a.href = url;
          a.download = resource.fileName || resource.title || 'download';
          document.body.appendChild(a);
          a.click();
          setTimeout(() => {
            document.body.removeChild(a);
            window.URL.revokeObjectURL(url);
          }, 100);
          
          this.notificationService.success(`Đang tải xuống '${resource.title}'...`);
        }
      });
  }
  
  /**
   * Làm mới danh sách tài nguyên
   * Refresh resources list
   */
  refreshResources(): void {
    this.loadResources();
  }
  
  /**
   * Xóa thông báo lỗi
   * Clear error message
   */
  clearError(): void {
    this.error = '';
  }
  
  /**
   * Lấy tên hiển thị thân thiện cho danh mục
   * Get friendly display name for category
   * @param category Tên danh mục
   * @returns Tên hiển thị
   */
  getCategoryDisplayName(category: string): string {
    if (category === 'all') return 'Tất cả';
    
    // Chuyển đổi tên danh mục sang dạng thân thiện hơn
    // Convert category name to more friendly format
    return category.charAt(0).toUpperCase() + category.slice(1).replace(/-/g, ' ');
  }
}
