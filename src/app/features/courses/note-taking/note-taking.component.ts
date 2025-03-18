import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { BaseComponent } from '@app/shared/components/base/base-component';
import { CourseService } from '@app/shared/services/course.service';
import { Note } from '@app/shared/models/note.model';
import { takeUntil, finalize } from 'rxjs/operators';
import { NotificationService } from '@app/shared/services/notification.service';

@Component({
  selector: 'app-note-taking',
  templateUrl: './note-taking.component.html'
})
export class NoteTakingComponent extends BaseComponent implements OnInit {
  courseId: string;
  notes: Note[] = [];
  filteredNotes: Note[] = [];
  isLoading = true;
  isSubmitting = false;
  error: string = '';
  
  // Biến cho ghi chú mới
  // Variables for new note
  isAddingNote = false;
  newNote = {
    title: '',
    content: '',
    tags: ''
  };
  
  // Biến cho chỉnh sửa ghi chú
  // Variables for editing note
  editingNoteId: string | null = null;
  editNote = {
    title: '',
    content: '',
    tags: ''
  };
  
  // Biến lọc và sắp xếp
  // Filter and sort variables
  searchQuery = '';
  sortBy: 'dateCreated' | 'dateUpdated' | 'title' = 'dateUpdated';
  sortDirection: 'asc' | 'desc' = 'desc';
  
  /**
   * Khởi tạo component với các dịch vụ cần thiết
   * Initialize component with required services
   * @param route Dịch vụ route để lấy tham số từ URL
   * @param courseService Dịch vụ để tương tác với API khóa học
   * @param notificationService Dịch vụ để hiển thị thông báo
   */
  constructor(
    private route: ActivatedRoute,
    private courseService: CourseService,
    private notificationService: NotificationService
  ) {
    super();
  }
  
  /**
   * Khởi tạo component và đăng ký theo dõi thay đổi route
   * Initialize component and subscribe to route changes
   */
  ngOnInit(): void {
    this.route.parent.paramMap
      .pipe(takeUntil(this._onDestroySub))
      .subscribe({
        next: params => {
          this.courseId = params.get('courseId');
          if (this.courseId) {
            this.loadNotes();
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
   * Tải danh sách ghi chú từ server
   * Load notes list from server
   */
  loadNotes(): void {
    this.isLoading = true;
    this.error = '';
    
    this.courseService.getCourseNotes(this.courseId)
      .pipe(
        takeUntil(this._onDestroySub),
        finalize(() => {
          this.isLoading = false;
        })
      )
      .subscribe({
        next: (notes) => {
          this.notes = notes;
          this.applyFilters();
        },
        error: (err) => {
          console.error('Lỗi khi tải ghi chú:', err);
          this.error = 'Không thể tải danh sách ghi chú. Vui lòng thử lại sau.';
        }
      });
  }
  
  /**
   * Áp dụng bộ lọc và sắp xếp cho danh sách ghi chú
   * Apply filters and sorting to the note list
   */
  applyFilters(): void {
    // Lọc theo từ khóa tìm kiếm
    // Filter by search keyword
    if (this.searchQuery) {
      const query = this.searchQuery.toLowerCase().trim();
      this.filteredNotes = this.notes.filter(note => 
        note.title.toLowerCase().includes(query) || 
        note.content.toLowerCase().includes(query) ||
        (note.tags && note.tags.some(tag => tag.toLowerCase().includes(query)))
      );
    } else {
      this.filteredNotes = [...this.notes];
    }
    
    // Sắp xếp kết quả
    // Sort results
    this.filteredNotes.sort((a, b) => {
      let valueA, valueB;
      
      switch (this.sortBy) {
        case 'title':
          valueA = a.title.toLowerCase();
          valueB = b.title.toLowerCase();
          break;
        case 'dateCreated':
          valueA = new Date(a.createdAt).getTime();
          valueB = new Date(b.createdAt).getTime();
          break;
        case 'dateUpdated':
        default:
          valueA = new Date(a.updatedAt || a.createdAt).getTime();
          valueB = new Date(b.updatedAt || b.createdAt).getTime();
          break;
      }
      
      return this.sortDirection === 'asc' 
        ? (valueA < valueB ? -1 : valueA > valueB ? 1 : 0)
        : (valueA > valueB ? -1 : valueA < valueB ? 1 : 0);
    });
  }
  
  /**
   * Xử lý khi tìm kiếm thay đổi
   * Handle search query changes
   * @param query Chuỗi tìm kiếm mới
   */
  onSearchChange(query: string): void {
    this.searchQuery = query;
    this.applyFilters();
  }
  
  /**
   * Thay đổi tiêu chí sắp xếp
   * Change sorting criteria
   * @param sortBy Tiêu chí sắp xếp mới
   */
  changeSorting(sortBy: 'dateCreated' | 'dateUpdated' | 'title'): void {
    if (this.sortBy === sortBy) {
      // Nếu tiêu chí đã được chọn, đảo ngược hướng sắp xếp
      // If criteria is already selected, reverse sort direction
      this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
    } else {
      this.sortBy = sortBy;
      // Mặc định là sắp xếp giảm dần
      // Default to descending sort
      this.sortDirection = 'desc';
    }
    
    this.applyFilters();
  }
  
  /**
   * Bật/tắt form thêm ghi chú mới
   * Toggle add note form visibility
   */
  toggleAddNote(): void {
    this.isAddingNote = !this.isAddingNote;
    if (!this.isAddingNote) {
      this.resetNewNoteForm();
    }
  }
  
  /**
   * Đặt lại form thêm ghi chú mới
   * Reset new note form
   */
  resetNewNoteForm(): void {
    this.newNote = {
      title: '',
      content: '',
      tags: ''
    };
  }
  
  /**
   * Tạo ghi chú mới
   * Create a new note
   */
  addNote(): void {
    if (!this.newNote.title.trim() || !this.newNote.content.trim()) {
      this.notificationService.warning('Vui lòng nhập tiêu đề và nội dung ghi chú');
      return;
    }
    
    this.isSubmitting = true;
    
    // Chuyển đổi tags từ chuỗi sang mảng
    // Convert tags from string to array
    const tags = this.newNote.tags
      ? this.newNote.tags.split(',').map(tag => tag.trim()).filter(tag => tag !== '')
      : [];
    
    const noteData = {
      title: this.newNote.title,
      content: this.newNote.content,
      tags: tags
    };
    
    this.courseService.createNote(this.courseId, noteData)
      .pipe(
        takeUntil(this._onDestroySub),
        finalize(() => {
          this.isSubmitting = false;
        })
      )
      .subscribe({
        next: (note) => {
          this.notes.unshift(note);
          this.applyFilters();
          this.toggleAddNote();
          this.notificationService.success('Đã tạo ghi chú mới thành công');
        },
        error: (err) => {
          console.error('Lỗi khi tạo ghi chú:', err);
          this.error = 'Không thể tạo ghi chú mới. Vui lòng thử lại sau.';
          this.notificationService.error('Lỗi khi tạo ghi chú mới');
        }
      });
  }
  
  /**
   * Bắt đầu chỉnh sửa ghi chú
   * Start editing a note
   * @param note Ghi chú cần chỉnh sửa
   */
  editNoteStart(note: Note): void {
    this.editingNoteId = note.id;
    this.editNote = {
      title: note.title,
      content: note.content,
      tags: note.tags ? note.tags.join(', ') : ''
    };
  }
  
  /**
   * Hủy chỉnh sửa ghi chú
   * Cancel editing a note
   */
  cancelEditing(): void {
    this.editingNoteId = null;
    this.editNote = {
      title: '',
      content: '',
      tags: ''
    };
  }
  
  /**
   * Cập nhật ghi chú sau khi chỉnh sửa
   * Update note after editing
   */
  saveEditedNote(): void {
    if (!this.editingNoteId) return;
    
    if (!this.editNote.title.trim() || !this.editNote.content.trim()) {
      this.notificationService.warning('Vui lòng nhập tiêu đề và nội dung ghi chú');
      return;
    }
    
    this.isSubmitting = true;
    
    // Chuyển đổi tags từ chuỗi sang mảng
    // Convert tags from string to array
    const tags = this.editNote.tags
      ? this.editNote.tags.split(',').map(tag => tag.trim()).filter(tag => tag !== '')
      : [];
    
    const updatedNote = {
      title: this.editNote.title,
      content: this.editNote.content,
      tags: tags
    };
    
    this.courseService.updateNote(this.courseId, this.editingNoteId, updatedNote)
      .pipe(
        takeUntil(this._onDestroySub),
        finalize(() => {
          this.isSubmitting = false;
        })
      )
      .subscribe({
        next: (note) => {
          const index = this.notes.findIndex(n => n.id === this.editingNoteId);
          if (index !== -1) {
            this.notes[index] = note;
            this.applyFilters();
          }
          this.cancelEditing();
          this.notificationService.success('Đã cập nhật ghi chú thành công');
        },
        error: (err) => {
          console.error('Lỗi khi cập nhật ghi chú:', err);
          this.error = 'Không thể cập nhật ghi chú. Vui lòng thử lại sau.';
          this.notificationService.error('Lỗi khi cập nhật ghi chú');
        }
      });
  }
  
  /**
   * Xóa ghi chú
   * Delete a note
   * @param noteId ID của ghi chú cần xóa
   */
  deleteNote(noteId: string): void {
    if (!confirm('Bạn có chắc chắn muốn xóa ghi chú này không?')) {
      return;
    }
    
    this.courseService.deleteNote(this.courseId, noteId)
      .pipe(takeUntil(this._onDestroySub))
      .subscribe({
        next: () => {
          this.notes = this.notes.filter(note => note.id !== noteId);
          this.applyFilters();
          this.notificationService.success('Đã xóa ghi chú thành công');
        },
        error: (err) => {
          console.error('Lỗi khi xóa ghi chú:', err);
          this.error = 'Không thể xóa ghi chú. Vui lòng thử lại sau.';
          this.notificationService.error('Lỗi khi xóa ghi chú');
        }
      });
  }
  
  /**
   * Định dạng ngày giờ để hiển thị
   * Format date for display
   * @param date Chuỗi ngày giờ cần định dạng
   * @returns Chuỗi ngày giờ đã định dạng
   */
  formatDate(date: string): string {
    return new Date(date).toLocaleDateString('vi-VN', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }
  
  /**
   * Xóa thông báo lỗi
   * Clear error message
   */
  clearError(): void {
    this.error = '';
  }
  
  /**
   * Lấy lớp CSS cho nút sắp xếp
   * Get CSS class for sort button
   * @param column Tên cột cần kiểm tra
   * @returns Tên lớp CSS
   */
  getSortClass(column: string): string {
    if (this.sortBy !== column) return 'text-gray-400';
    return this.sortDirection === 'asc' ? 'text-blue-600' : 'text-blue-600 transform rotate-180';
  }
}
