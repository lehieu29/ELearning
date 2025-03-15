import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { takeUntil } from 'rxjs/operators';
import { BaseComponent } from '@shared/components/base/base-component';
import { CodeEditorService } from '../services/code-editor.service';
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
  searchQuery: string = '';
  isLoading: boolean = false;
  showSnippets: boolean = false;
  newSnippetName: string = '';
  newSnippetCode: string = '';
  snippetFormVisible: boolean = false;
  
  constructor(private codeEditorService: CodeEditorService) {
    super();
  }
  
  ngOnInit(): void {
    this.loadSnippets();
  }
  
  // Tải danh sách code snippet từ server
  loadSnippets(): void {
    this.isLoading = true;
    
    this.codeEditorService.getCodeSnippets(this.language)
      .pipe(takeUntil(this._onDestroySub))
      .subscribe({
        next: (snippets) => {
          this.snippets = snippets;
          this.filteredSnippets = [...snippets];
          this.isLoading = false;
        },
        error: (err) => {
          console.error('Failed to load code snippets:', err);
          this.isLoading = false;
        }
      });
  }
  
  // Lọc snippet dựa trên từ khóa tìm kiếm
  filterSnippets(): void {
    if (!this.searchQuery.trim()) {
      this.filteredSnippets = [...this.snippets];
      return;
    }
    
    const query = this.searchQuery.toLowerCase().trim();
    this.filteredSnippets = this.snippets.filter(snippet => 
      snippet.name.toLowerCase().includes(query) || 
      snippet.description?.toLowerCase().includes(query) ||
      snippet.tags?.some(tag => tag.toLowerCase().includes(query))
    );
  }
  
  // Chọn một snippet để chèn vào editor
  selectSnippet(snippet: CodeSnippet): void {
    this.snippetSelected.emit(snippet.code);
    this.showSnippets = false;
  }
  
  // Lưu snippet mới
  saveSnippet(): void {
    if (!this.newSnippetName || !this.newSnippetCode) {
      return;
    }
    
    const newSnippet: Partial<CodeSnippet> = {
      name: this.newSnippetName,
      code: this.newSnippetCode,
      language: this.language
    };
    
    this.isLoading = true;
    
    this.codeEditorService.saveCodeSnippet(newSnippet)
      .pipe(takeUntil(this._onDestroySub))
      .subscribe({
        next: (savedSnippet) => {
          this.snippets = [savedSnippet, ...this.snippets];
          this.filterSnippets();
          this.resetSnippetForm();
          this.isLoading = false;
        },
        error: (err) => {
          console.error('Failed to save code snippet:', err);
          this.isLoading = false;
        }
      });
  }
  
  // Xóa snippet
  deleteSnippet(snippet: CodeSnippet, event: Event): void {
    event.stopPropagation();
    
    this.isLoading = true;
    
    this.codeEditorService.deleteCodeSnippet(snippet.id)
      .pipe(takeUntil(this._onDestroySub))
      .subscribe({
        next: () => {
          this.snippets = this.snippets.filter(s => s.id !== snippet.id);
          this.filterSnippets();
          this.isLoading = false;
        },
        error: (err) => {
          console.error('Failed to delete code snippet:', err);
          this.isLoading = false;
        }
      });
  }
  
  // Đặt lại form snippet
  resetSnippetForm(): void {
    this.newSnippetName = '';
    this.newSnippetCode = '';
    this.snippetFormVisible = false;
  }
}
