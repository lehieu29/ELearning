import { Component, OnInit, Input, Output, EventEmitter, HostListener } from '@angular/core';
import { takeUntil, finalize } from 'rxjs/operators';
import { BaseComponent } from '@app/shared/components/base/base-component';
import { CodeEditorService } from '../services/code-editor.service';
import { NotificationService } from '@app/shared/services/notification.service';
import { CodeSnippet } from '../models/code-snippet.model';

@Component({
  selector: 'app-code-snippets',
  templateUrl: './code-snippets.component.html'
})
export class CodeSnippetsComponent extends BaseComponent implements OnInit {
  @Input() language: string = 'javascript';
  @Output() snippetSelected = new EventEmitter<string>();
  
  snippets: CodeSnippet[] = [];
  filteredSnippets: CodeSnippet[] = [];
  searchTerm: string = '';
  isLoading: boolean = false;
  isSaving: boolean = false;
  isDeleting: boolean = false;
  showSnippetsPanel: boolean = false;
  error: string = '';
  
  newSnippetName: string = '';
  newSnippetDescription: string = '';
  newSnippetCode: string = '';
  newSnippetTags: string = '';
  snippetFormVisible: boolean = false;
  
  /**
   * Khởi tạo component với các dịch vụ cần thiết
   * Initialize component with required services
   * @param codeEditorService Dịch vụ quản lý code snippets
   * @param notificationService Dịch vụ hiển thị thông báo
   */
  constructor(
    private codeEditorService: CodeEditorService,
    private notificationService: NotificationService
  ) {
    super();
  }
  
  /**
   * Khởi tạo component và tải danh sách snippets
   * Initialize component and load snippets list
   */
  ngOnInit(): void {
    this.loadSnippets();
  }
  
  /**
   * Tải danh sách code snippet từ server
   * Load code snippets list from server
   */
  loadSnippets(): void {
    this.isLoading = true;
    this.error = '';
    
    this.codeEditorService.getCodeSnippets(this.language)
      .pipe(
        takeUntil(this._onDestroySub),
        finalize(() => {
          this.isLoading = false;
        })
      )
      .subscribe({
        next: (snippets) => {
          this.snippets = snippets;
          this.filteredSnippets = [...snippets];
        },
        error: (err) => {
          console.error('Lỗi khi tải code snippets:', err);
          this.error = 'Không thể tải danh sách code snippets. Vui lòng thử lại sau.';
        }
      });
  }
  
  /**
   * Lọc snippet dựa trên từ khóa tìm kiếm
   * Filter snippets based on search keyword
   */
  filterSnippets(): void {
    if (!this.searchTerm.trim()) {
      this.filteredSnippets = [...this.snippets];
      return;
    }
    
    const query = this.searchTerm.toLowerCase().trim();
    this.filteredSnippets = this.snippets.filter(snippet => 
      snippet.name.toLowerCase().includes(query) || 
      (snippet.description && snippet.description.toLowerCase().includes(query)) ||
      (snippet.tags && snippet.tags.some(tag => tag.toLowerCase().includes(query)))
    );
  }
  
  /**
   * Xử lý khi thay đổi từ khóa tìm kiếm
   * Handle search term changes
   */
  onSearchChange(): void {
    this.filterSnippets();
  }
  
  /**
   * Chọn một snippet để chèn vào editor
   * Select a snippet to insert into editor
   * @param snippet Snippet được chọn
   */
  selectSnippet(snippet: CodeSnippet): void {
    this.snippetSelected.emit(snippet.code);
    this.showSnippetsPanel = false;
  }
  
  /**
   * Bật/tắt bảng điều khiển snippets
   * Toggle snippets panel visibility
   */
  toggleSnippetsPanel(): void {
    this.showSnippetsPanel = !this.showSnippetsPanel;
    
    // Nếu mở bảng và danh sách trống, tải lại snippets
    // If opening the panel and list is empty, reload snippets
    if (this.showSnippetsPanel && this.snippets.length === 0) {
      this.loadSnippets();
    }
  }
  
  /**
   * Hiển thị form để tạo snippet mới
   * Show form to create new snippet
   */
  showNewSnippetForm(): void {
    this.snippetFormVisible = true;
  }
  
  /**
   * Lưu snippet mới
   * Save new snippet
   */
  saveSnippet(): void {
    if (!this.newSnippetName || !this.newSnippetCode) {
      this.notificationService.warning('Vui lòng nhập tên và mã nguồn cho snippet.');
      return;
    }
    
    // Chuyển đổi tags từ chuỗi sang mảng
    // Convert tags from string to array
    const tags = this.newSnippetTags
      ? this.newSnippetTags.split(',').map(tag => tag.trim()).filter(tag => tag !== '')
      : [];
    
    const newSnippet: Partial<CodeSnippet> = {
      name: this.newSnippetName,
      description: this.newSnippetDescription,
      code: this.newSnippetCode,
      language: this.language,
      tags: tags
    };
    
    this.isSaving = true;
    this.error = '';
    
    this.codeEditorService.saveCodeSnippet(newSnippet)
      .pipe(
        takeUntil(this._onDestroySub),
        finalize(() => {
          this.isSaving = false;
        })
      )
      .subscribe({
        next: (savedSnippet) => {
          this.snippets = [savedSnippet, ...this.snippets];
          this.filterSnippets();
          this.resetSnippetForm();
          this.notificationService.success('Đã lưu snippet thành công.');
        },
        error: (err) => {
          console.error('Lỗi khi lưu code snippet:', err);
          this.error = 'Không thể lưu snippet. Vui lòng thử lại sau.';
          this.notificationService.error('Không thể lưu snippet. Đã xảy ra lỗi.');
        }
      });
  }
  
  /**
   * Xóa một snippet
   * Delete a snippet
   * @param snippet Snippet cần xóa
   * @param event Sự kiện click
   */
  deleteSnippet(snippet: CodeSnippet, event: Event): void {
    event.stopPropagation();
    
    if (!confirm(`Bạn có chắc chắn muốn xóa snippet "${snippet.name}"?`)) {
      return;
    }
    
    this.isDeleting = true;
    this.error = '';
    
    this.codeEditorService.deleteCodeSnippet(snippet.id)
      .pipe(
        takeUntil(this._onDestroySub),
        finalize(() => {
          this.isDeleting = false;
        })
      )
      .subscribe({
        next: () => {
          this.snippets = this.snippets.filter(s => s.id !== snippet.id);
          this.filterSnippets();
          this.notificationService.success('Đã xóa snippet thành công.');
        },
        error: (err) => {
          console.error('Lỗi khi xóa code snippet:', err);
          this.error = 'Không thể xóa snippet. Vui lòng thử lại sau.';
          this.notificationService.error('Không thể xóa snippet. Đã xảy ra lỗi.');
        }
      });
  }
  
  /**
   * Đặt lại form snippet
   * Reset snippet form
   */
  resetSnippetForm(): void {
    this.newSnippetName = '';
    this.newSnippetDescription = '';
    this.newSnippetCode = '';
    this.newSnippetTags = '';
    this.snippetFormVisible = false;
  }
  
  /**
   * Đóng panel khi click ra ngoài
   * Close panel when clicking outside
   */
  @HostListener('document:click', ['$event'])
  onClickOutside(event: Event): void {
    const target = event.target as HTMLElement;
    if (!target.closest('app-code-snippets') && this.showSnippetsPanel) {
      this.showSnippetsPanel = false;
    }
  }
}
