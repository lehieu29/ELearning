import { Component, OnInit, Input, OnChanges, SimpleChanges } from '@angular/core';
import { CodeEditorService } from '../services/code-editor.service';
import { LintingResult } from '../models/linting-result.model';

@Component({
  selector: 'app-linting-tools',
  templateUrl: './linting-tools.component.html'
})
export class LintingToolsComponent implements OnInit, OnChanges {
  @Input() code: string = '';
  @Input() language: string = 'javascript';
  
  lintingResults: LintingResult[] = [];
  showLintingPanel: boolean = false;
  isLinting: boolean = false;
  hasErrors: boolean = false;
  hasWarnings: boolean = false;
  
  constructor(private codeEditorService: CodeEditorService) {}
  
  ngOnInit(): void {}
  
  ngOnChanges(changes: SimpleChanges): void {
    if ((changes.code && !changes.code.firstChange) || 
        (changes.language && !changes.language.firstChange)) {
      this.lintCode();
    }
  }
  
  lintCode(): void {
    if (!this.code) return;
    
    this.isLinting = true;
    this.codeEditorService.lintCode(this.code, this.language)
      .subscribe(results => {
        this.lintingResults = results;
        this.isLinting = false;
        this.updateStatusIndicators();
      });
  }
  
  updateStatusIndicators(): void {
    this.hasErrors = this.lintingResults.some(result => result.severity === 'error');
    this.hasWarnings = this.lintingResults.some(result => result.severity === 'warning');
  }
  
  toggleLintingPanel(): void {
    this.showLintingPanel = !this.showLintingPanel;
    
    if (this.showLintingPanel && this.lintingResults.length === 0) {
      this.lintCode();
    }
  }
  
  getLintingStatusIcon(): string {
    if (this.isLinting) {
      return 'loading'; 
    }
    if (this.hasErrors) {
      return 'error';
    }
    if (this.hasWarnings) {
      return 'warning';
    }
    return 'check';
  }
  
  getLintingStatusClass(): string {
    if (this.hasErrors) {
      return 'error';
    }
    if (this.hasWarnings) {
      return 'warning';
    }
    return 'check';
  }
}
