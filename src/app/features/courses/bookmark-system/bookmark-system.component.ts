import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { BaseComponent } from '@app/shared/components/base/base-component';
import { CourseService } from '@app/shared/services/course.service';
import { Bookmark } from '@app/shared/models/bookmark.model';
import { takeUntil, finalize, catchError } from 'rxjs/operators';
import { NotificationService } from '@app/shared/services/notification.service';
import { of } from 'rxjs';

interface BookmarkCategory {
  name: string;
  count: number;
  isActive: boolean;
}

@Component({
  selector: 'app-bookmark-system',
  templateUrl: './bookmark-system.component.html'
})
export class BookmarkSystemComponent extends BaseComponent implements OnInit {
  courseId: string;
  bookmarks: Bookmark[] = [];
  filteredBookmarks: Bookmark[] = [];
  isLoading = true;
  isRemoving = false;
  error: string = '';
  
  // Filter options
  filterCategories: BookmarkCategory[] = [];
  activeFilter: string = 'all';
  searchQuery: string = '';
  
  /**
   * Khởi tạo component với các service cần thiết
   * Initialize component with required services
   * @param route Service để truy cập thông tin từ URL
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
            this.loadBookmarks();
          } else {
            this.error = 'Không tìm thấy ID khóa học';
            this.isLoading = false;
          }
        },
        error: err => {
          console.error('Lỗi khi đọc tham số route:', err);
          this.error = 'Đã xảy ra lỗi khi tải thông tin khóa học';
          this.isLoading = false;
        }
      });
  }
  
  /**
   * Tải danh sách đánh dấu trang của khóa học từ server
   * Load course bookmarks from the server
   */
  loadBookmarks(): void {
    this.isLoading = true;
    this.error = '';
    
    this.courseService.getCourseBookmarks(this.courseId)
      .pipe(
        takeUntil(this._onDestroySub),
        finalize(() => {
          this.isLoading = false;
        }),
        catchError(err => {
          console.error('Lỗi khi tải đánh dấu trang:', err);
          this.error = 'Không thể tải danh sách đánh dấu trang. Vui lòng thử lại sau.';
          return of([]);
        })
      )
      .subscribe(bookmarks => {
        this.bookmarks = bookmarks;
        this.generateFilterCategories();
        this.applyFilters();
      });
  }
  
  /**
   * Tạo danh sách các danh mục để lọc đánh dấu trang
   * Generate list of categories for filtering bookmarks
   */
  generateFilterCategories(): void {
    const categories = new Map<string, number>();
    
    // Đếm số lượng đánh dấu trang cho mỗi loại nội dung
    // Count bookmarks for each content type
    this.bookmarks.forEach(bookmark => {
      const type = bookmark.contentType || 'other';
      categories.set(type, (categories.get(type) || 0) + 1);
    });
    
    // Tạo danh mục "tất cả" và thêm vào đầu danh sách
    // Create "all" category and add to beginning of list
    this.filterCategories = [{ name: 'all', count: this.bookmarks.length, isActive: true }];
    
    // Thêm các danh mục khác vào danh sách
    // Add other categories to the list
    categories.forEach((count, name) => {
      this.filterCategories.push({ name, count, isActive: false });
    });
  }
  
  /**
   * Áp dụng các bộ lọc vào danh sách đánh dấu trang
   * Apply filters to the bookmarks list
   */
  applyFilters(): void {
    // Áp dụng bộ lọc danh mục
    // Apply category filter
    if (this.activeFilter === 'all') {
      this.filteredBookmarks = [...this.bookmarks];
    } else {
      this.filteredBookmarks = this.bookmarks.filter(
        bookmark => bookmark.contentType === this.activeFilter
      );
    }
    
    // Áp dụng bộ lọc tìm kiếm
    // Apply search filter
    if (this.searchQuery) {
      const query = this.searchQuery.toLowerCase();
      this.filteredBookmarks = this.filteredBookmarks.filter(bookmark => 
        bookmark.title.toLowerCase().includes(query) || 
        (bookmark.note && bookmark.note.toLowerCase().includes(query))
      );
    }
    
    // Sắp xếp đánh dấu trang theo thời gian tạo mới nhất đầu tiên
    // Sort bookmarks by creation time, newest first
    this.filteredBookmarks.sort((a, b) => {
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });
  }
  
  /**
   * Đặt bộ lọc danh mục hiện tại
   * Set the current category filter
   * @param category Tên danh mục để lọc
   */
  setFilter(category: string): void {
    this.activeFilter = category;
    
    // Cập nhật trạng thái active trong danh sách danh mục
    // Update active state in filter categories
    this.filterCategories.forEach(cat => {
      cat.isActive = cat.name === category;
    });
    
    this.applyFilters();
  }
  
  /**
   * Xử lý khi từ khóa tìm kiếm thay đổi
   * Handle search query change
   * @param query Từ khóa tìm kiếm mới
   */
  onSearchChange(query: string): void {
    this.searchQuery = query;
    this.applyFilters();
  }
  
  /**
   * Xóa một đánh dấu trang
   * Remove a bookmark
   * @param bookmarkId ID của đánh dấu trang cần xóa
   */
  removeBookmark(bookmarkId: string): void {
    if (!confirm('Bạn có chắc chắn muốn xóa đánh dấu trang này không?')) {
      return;
    }
    
    this.isRemoving = true;
    
    this.courseService.removeBookmark(this.courseId, bookmarkId)
      .pipe(
        takeUntil(this._onDestroySub),
        finalize(() => {
          this.isRemoving = false;
        }),
        catchError(err => {
          console.error('Lỗi khi xóa đánh dấu trang:', err);
          this.error = 'Không thể xóa đánh dấu trang. Vui lòng thử lại sau.';
          this.notificationService.error('Không thể xóa đánh dấu trang');
          return of(null);
        })
      )
      .subscribe(result => {
        if (result !== null) {
          // Xóa đánh dấu trang khỏi danh sách
          // Remove bookmark from the lists
          this.bookmarks = this.bookmarks.filter(bookmark => bookmark.id !== bookmarkId);
          this.generateFilterCategories();
          this.applyFilters();
          this.notificationService.success('Đã xóa đánh dấu trang thành công');
        }
      });
  }
  
  /**
   * Định dạng thời gian của video sang dạng phút:giây
   * Format video timestamp to minutes:seconds
   * @param timeInSeconds Thời gian tính bằng giây
   * @returns Chuỗi thời gian định dạng MM:SS
   */
  formatTimestamp(timeInSeconds: number): string {
    if (timeInSeconds === undefined hoặc timeInSeconds === null) return '';
    
    const minutes = Math.floor(timeInSeconds / 60);
    const seconds = Math.floor(timeInSeconds % 60);
    
    return `${minutes}:${seconds < 10 ? '0' + seconds : seconds}`;
  }
  
  /**
   * Tạo đánh dấu trang mới
   * Create a new bookmark
   */
  addBookmark(): void {
    // Navigate to current content view with bookmark dialog open
    // This is typically handled by a service that knows the current content being viewed
    this.notificationService.info('Vui lòng mở nội dung khóa học và sử dụng nút đánh dấu trang ở đó.');
  }
  
  /**
   * Xóa thông báo lỗi
   * Clear error message
   */
  clearError(): void {
    this.error = '';
  }
  
  /**
   * Lấy tên hiển thị cho loại nội dung
   * Get display name for content type
   * @param contentType Loại nội dung
   * @returns Tên hiển thị bằng tiếng Việt
   */
  getContentTypeDisplayName(contentType: string): string {
    switch (contentType) {
      case 'lesson': return 'Bài học';
      case 'quiz': return 'Bài kiểm tra';
      case 'assignment': return 'Bài tập';
      case 'resource': return 'Tài nguyên';
      default: return 'Khác';
    }
  }
}
