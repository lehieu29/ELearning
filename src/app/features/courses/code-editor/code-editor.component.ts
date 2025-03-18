import { Component, OnInit, OnDestroy, ViewChild, ElementRef, Input, AfterViewInit, ChangeDetectorRef } from '@angular/core';
import { Subject } from 'rxjs';
import { takeUntil, finalize } from 'rxjs/operators';
import { BaseComponent } from '@app/shared/components/base/base-component';
import { CodeEditorService } from './services/code-editor.service';
import { NotificationService } from '@app/shared/services/notification.service';
import { CodeSnippet } from './models/code-snippet.model';
import { CodeVersion } from './models/code-version.model';
import { HttpErrorResponse } from '@angular/common/http';

declare const monaco: any;

@Component({
  selector: 'app-code-editor',
  templateUrl: './code-editor.component.html'
})
export class CodeEditorComponent extends BaseComponent implements OnInit, AfterViewInit, OnDestroy {
  @Input() courseId: string = '';
  @Input() lessonId: string = '';
  @Input() exerciseId: string = '';
  @ViewChild('editorContainer') editorContainer: ElementRef;
  
  editor: any;
  currentCode: string = '';
  originalCode: string = '';
  language: string = 'javascript';
  theme: string = 'vs-dark';
  
  availableLanguages: string[] = ['javascript', 'typescript', 'python', 'java', 'html', 'css'];
  isLoadingCode: boolean = false;
  isExecuting: boolean = false;
  hasUnsavedChanges: boolean = false;
  error: string = '';
  consoleOutput: string = '';
  
  editorOptions = {
    theme: 'vs-dark',
    language: 'javascript',
    automaticLayout: true,
    minimap: { enabled: true },
    lineNumbers: 'on',
    scrollBeyondLastLine: false,
    fontSize: 14,
    formatOnType: true,
    formatOnPaste: true
  };

  /**
   * Khởi tạo CodeEditorComponent với các dịch vụ cần thiết
   * Initialize CodeEditorComponent with necessary services
   * @param codeEditorService Dịch vụ xử lý code editor
   * @param notificationService Dịch vụ hiển thị thông báo
   * @param cdr ChangeDetectorRef để cập nhật UI
   */
  constructor(
    private codeEditorService: CodeEditorService,
    private notificationService: NotificationService,
    private cdr: ChangeDetectorRef
  ) {
    super();
  }

  /**
   * Khởi tạo component và tải mã nguồn
   * Initialize component and load code
   */
  ngOnInit(): void {
    // Đăng ký các event listener cho code editor
    // Register event listeners for code editor
    this.registerEventListeners();
  }

  /**
   * Khởi tạo Monaco Editor sau khi view được khởi tạo
   * Initialize Monaco Editor after view initialization
   */
  ngAfterViewInit(): void {
    this.initMonacoEditor();
    this.loadExerciseCode();
  }

  /**
   * Đăng ký các event listener để xử lý sự kiện từ các component khác
   * Register event listeners to handle events from other components
   */
  registerEventListeners(): void {
    window.addEventListener('code-version-restored', ((event: CustomEvent) => {
      const { code, language } = event.detail;
      this.currentCode = code;
      
      if (language && language !== this.language) {
        this.language = language;
        this.editorOptions = {
          ...this.editorOptions,
          language
        };
        
        if (this.editor) {
          monaco.editor.setModelLanguage(this.editor.getModel(), language);
        }
      }
      
      if (this.editor) {
        this.editor.setValue(code);
      }
      
      this.notificationService.success('Mã nguồn đã được khôi phục thành công.');
    }) as EventListener);
  }

  /**
   * Khởi tạo Monaco Editor
   * Initialize Monaco Editor
   */
  initMonacoEditor(): void {
    if (!this.editorContainer) {
      return;
    }
    
    const container = this.editorContainer.nativeElement;
    
    if (this.editor) {
      this.editor.dispose();
    }
    
    this.editor = monaco.editor.create(container, {
      value: this.currentCode,
      ...this.editorOptions
    });
    
    // Bắt sự kiện thay đổi mã nguồn
    // Capture code change events
    this.editor.onDidChangeModelContent(() => {
      this.currentCode = this.editor.getValue();
      this.hasUnsavedChanges = this.currentCode !== this.originalCode;
    });
    
    this.cdr.detectChanges();
  }

  /**
   * Tải mã nguồn bài tập từ server
   * Load exercise code from server
   */
  loadExerciseCode(): void {
    if (!this.courseId || !this.lessonId || !this.exerciseId) {
      this.error = 'Không thể tải mã nguồn: Thiếu thông tin khóa học, bài học hoặc bài tập.';
      return;
    }
    
    this.isLoadingCode = true;
    this.error = '';
    
    this.codeEditorService.getExerciseCode(this.courseId, this.lessonId, this.exerciseId)
      .pipe(
        takeUntil(this._onDestroySub),
        finalize(() => {
          this.isLoadingCode = false;
          this.cdr.detectChanges();
        })
      )
      .subscribe({
        next: (data) => {
          this.originalCode = data.code || '';
          this.currentCode = data.code || '';
          this.language = data.language || 'javascript';
          
          this.editorOptions = {
            ...this.editorOptions,
            language: this.language
          };
          
          if (this.editor) {
            this.editor.setValue(this.currentCode);
            monaco.editor.setModelLanguage(this.editor.getModel(), this.language);
          }
        },
        error: (err: HttpErrorResponse) => {
          console.error('Lỗi khi tải mã nguồn:', err);
          this.error = 'Không thể tải mã nguồn bài tập. Vui lòng thử lại sau.';
          
          if (this.editor && !this.currentCode) {
            this.currentCode = '// Mã nguồn chưa được tải.\n// Bạn có thể bắt đầu viết mã ở đây hoặc tải lại trang.';
            this.editor.setValue(this.currentCode);
          }
        }
      });
  }

  /**
   * Thực thi mã nguồn hiện tại
   * Execute current code
   */
  executeCode(): void {
    if (!this.currentCode.trim()) {
      this.notificationService.warning('Vui lòng nhập mã nguồn trước khi thực thi.');
      return;
    }
    
    this.isExecuting = true;
    this.consoleOutput = 'Đang thực thi...\n';
    this.error = '';
    
    this.codeEditorService.runCode(this.currentCode, this.language)
      .pipe(
        takeUntil(this._onDestroySub),
        finalize(() => {
          this.isExecuting = false;
          this.cdr.detectChanges();
        })
      )
      .subscribe({
        next: (result) => {
          this.consoleOutput = result.output || 'Không có kết quả đầu ra.';
          
          if (result.success) {
            this.notificationService.success('Thực thi mã nguồn thành công.');
          } else {
            this.consoleOutput += '\n' + (result.error || 'Có lỗi xảy ra khi thực thi mã nguồn.');
            this.notificationService.error('Có lỗi khi thực thi mã nguồn.');
          }
        },
        error: (err: HttpErrorResponse) => {
          console.error('Lỗi khi thực thi mã nguồn:', err);
          this.consoleOutput += '\nLỗi: Không thể thực thi mã nguồn. Vui lòng thử lại sau.';
          this.error = 'Không thể thực thi mã nguồn. Vui lòng thử lại sau.';
          this.notificationService.error('Không thể thực thi mã nguồn.');
        }
      });
  }

  /**
   * Lưu mã nguồn hiện tại
   * Save current code
   */
  saveCode(): void {
    if (!this.courseId || !this.lessonId || !this.exerciseId) {
      this.notificationService.error('Không thể lưu: Thiếu thông tin khóa học, bài học hoặc bài tập.');
      return;
    }
    
    const saveData = {
      code: this.currentCode,
      language: this.language
    };
    
    this.codeEditorService.saveExerciseCode(this.courseId, this.lessonId, this.exerciseId, saveData)
      .pipe(takeUntil(this._onDestroySub))
      .subscribe({
        next: () => {
          this.originalCode = this.currentCode;
          this.hasUnsavedChanges = false;
          this.notificationService.success('Mã nguồn đã được lưu thành công.');
        },
        error: (err: HttpErrorResponse) => {
          console.error('Lỗi khi lưu mã nguồn:', err);
          this.notificationService.error('Không thể lưu mã nguồn. Vui lòng thử lại sau.');
        }
      });
  }

  /**
   * Khôi phục mã nguồn về trạng thái ban đầu
   * Reset code to original state
   */
  resetCode(): void {
    if (this.currentCode !== this.originalCode) {
      if (confirm('Bạn có chắc chắn muốn khôi phục mã nguồn về trạng thái ban đầu? Các thay đổi chưa lưu sẽ bị mất.')) {
        this.currentCode = this.originalCode;
        if (this.editor) {
          this.editor.setValue(this.originalCode);
        }
        this.hasUnsavedChanges = false;
        this.notificationService.info('Mã nguồn đã được khôi phục về trạng thái ban đầu.');
      }
    } else {
      this.notificationService.info('Mã nguồn hiện tại đã là phiên bản gốc.');
    }
  }

  /**
   * Chuyển đổi giữa các chủ đề (theme) của editor
   * Toggle between editor themes
   */
  toggleTheme(): void {
    this.theme = this.theme === 'vs-dark' ? 'vs-light' : 'vs-dark';
    if (this.editor) {
      monaco.editor.setTheme(this.theme);
    }
  }

  /**
   * Xử lý khi component bị hủy
   * Handle component destruction
   */
  override ngOnDestroy(): void {
    // Hủy editor và giải phóng bộ nhớ
    // Dispose editor and free memory
    if (this.editor) {
      this.editor.dispose();
    }
    
    super.ngOnDestroy();
  }
}
