import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { BaseComponent } from '@app/shared/components/base/base-component';
import { CourseService } from '@app/shared/services/course.service';
import { Bookmark } from '@app/shared/models/bookmark.model';
import { takeUntil } from 'rxjs/operators';

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
  error: string = '';
  
  // Filter options
  filterCategories: BookmarkCategory[] = [];
  activeFilter: string = 'all';
  searchQuery: string = '';
  
  constructor(
    private route: ActivatedRoute,
    private courseService: CourseService
  ) {
    super();
  }
  
  ngOnInit(): void {
    this.route.parent.paramMap
      .pipe(takeUntil(this._onDestroySub))
      .subscribe(params => {
        this.courseId = params.get('courseId');
        if (this.courseId) {
          this.loadBookmarks();
        }
      });
  }
  
  loadBookmarks(): void {
    this.isLoading = true;
    
    this.courseService.getCourseBookmarks(this.courseId)
      .pipe(takeUntil(this._onDestroySub))
      .subscribe({
        next: (bookmarks) => {
          this.bookmarks = bookmarks;
          this.generateFilterCategories();
          this.applyFilters();
          this.isLoading = false;
        },
        error: (err) => {
          console.error('Error loading bookmarks:', err);
          this.error = 'Failed to load bookmarks. Please try again.';
          this.isLoading = false;
        }
      });
  }
  
  generateFilterCategories(): void {
    const categories = new Map<string, number>();
    
    this.bookmarks.forEach(bookmark => {
      const type = bookmark.contentType || 'other';
      categories.set(type, (categories.get(type) || 0) + 1);
    });
    
    this.filterCategories = [{ name: 'all', count: this.bookmarks.length, isActive: true }];
    categories.forEach((count, name) => {
      this.filterCategories.push({ name, count, isActive: false });
    });
  }
  
  applyFilters(): void {
    // Apply category filter
    if (this.activeFilter === 'all') {
      this.filteredBookmarks = [...this.bookmarks];
    } else {
      this.filteredBookmarks = this.bookmarks.filter(
        bookmark => bookmark.contentType === this.activeFilter
      );
    }
    
    // Apply search query
    if (this.searchQuery) {
      const query = this.searchQuery.toLowerCase();
      this.filteredBookmarks = this.filteredBookmarks.filter(bookmark => 
        bookmark.title.toLowerCase().includes(query) || 
        (bookmark.note && bookmark.note.toLowerCase().includes(query))
      );
    }
  }
  
  setFilter(category: string): void {
    this.activeFilter = category;
    
    // Update active state in filter categories
    this.filterCategories.forEach(cat => {
      cat.isActive = cat.name === category;
    });
    
    this.applyFilters();
  }
  
  onSearchChange(query: string): void {
    this.searchQuery = query;
    this.applyFilters();
  }
  
  removeBookmark(bookmarkId: string): void {
    if (!confirm('Are you sure you want to remove this bookmark?')) {
      return;
    }
    
    this.courseService.removeBookmark(this.courseId, bookmarkId)
      .pipe(takeUntil(this._onDestroySub))
      .subscribe({
        next: () => {
          this.bookmarks = this.bookmarks.filter(bookmark => bookmark.id !== bookmarkId);
          this.generateFilterCategories();
          this.applyFilters();
        },
        error: (err) => {
          console.error('Error removing bookmark:', err);
          this.error = 'Failed to remove bookmark. Please try again.';
        }
      });
  }
  
  formatTimestamp(timeInSeconds: number): string {
    const minutes = Math.floor(timeInSeconds / 60);
    const seconds = Math.floor(timeInSeconds % 60);
    
    return `${minutes}:${seconds < 10 ? '0' + seconds : seconds}`;
  }
}
