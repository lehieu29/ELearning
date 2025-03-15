import { Component, OnInit, OnDestroy, ViewChild, ElementRef, Input } from '@angular/core';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { CodeEditorService } from './services/code-editor.service';
import { CodeSnippet } from './models/code-snippet.model';
import { CodeVersion } from './models/code-version.model';

@Component({
  selector: 'app-code-editor',
  templateUrl: './code-editor.component.html'
})
export class CodeEditorComponent implements OnInit, OnDestroy {
  @Input() courseId: string = '';
  @Input() lessonId: string = '';
  @Input() exerciseId: string = '';
  @ViewChild('codeEditor') codeEditorEl?: ElementRef;

  code: string = '';
  language: string = 'javascript';
  theme: string = 'vs-dark';
  availableLanguages: string[] = ['javascript', 'typescript', 'python', 'java', 'html', 'css'];
  
  editorOptions = {
    theme: 'vs-dark',
    language: 'javascript',
    automaticLayout: true,
    minimap: { enabled: true },
    lineNumbers: 'on',
    scrollBeyondLastLine: false,
    fontSize: 14
  };

  isAutoSaveEnabled: boolean = true;
  lastSavedAt?: Date;
  
  private _onDestroySub = new Subject<void>();
  
  constructor(private codeEditorService: CodeEditorService) {}
  
  ngOnInit(): void {
    this.loadExerciseCode();
    this.setupAutosave();
  }
  
  ngOnDestroy(): void {
    this._onDestroySub.next();
    this._onDestroySub.complete();
  }
  
  loadExerciseCode(): void {
    if (!this.courseId || !this.lessonId || !this.exerciseId) return;
    
    this.codeEditorService.getExerciseCode(this.courseId, this.lessonId, this.exerciseId)
      .pipe(takeUntil(this._onDestroySub))
      .subscribe({
        next: (data) => {
          this.code = data.code;
          this.language = data.language;
          this.editorOptions = {
            ...this.editorOptions,
            language: this.language
          };
        },
        error: (err) => console.error('Failed to load exercise code:', err)
      });
  }
  
  setupAutosave(): void {
    // Auto-save is handled by the auto-save component
  }
  
  onCodeChange(code: string): void {
    this.code = code;
  }
  
  changeLanguage(language: string): void {
    this.language = language;
    this.editorOptions = {
      ...this.editorOptions,
      language
    };
  }
  
  changeTheme(theme: string): void {
    this.theme = theme;
    this.editorOptions = {
      ...this.editorOptions,
      theme
    };
  }
  
  runCode(): void {
    this.codeEditorService.runCode(this.code, this.language)
      .pipe(takeUntil(this._onDestroySub))
      .subscribe({
        next: (result) => {
          console.log('Code execution result:', result);
          // Handle code execution results
        },
        error: (err) => console.error('Failed to execute code:', err)
      });
  }
}
