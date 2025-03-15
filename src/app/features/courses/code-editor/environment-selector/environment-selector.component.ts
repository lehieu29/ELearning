import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { takeUntil } from 'rxjs/operators';
import { BaseComponent } from '@shared/components/base/base-component';
import { CodeEditorService } from '../services/code-editor.service';
import { CodeEnvironment } from '../models/code-environment.model';

@Component({
  selector: 'app-environment-selector',
  templateUrl: './environment-selector.component.html'
})
export class EnvironmentSelectorComponent extends BaseComponent implements OnInit {
  @Input() courseId: string = '';
  @Input() exerciseId: string = '';
  @Input() currentLanguage: string = 'javascript';
  @Output() environmentChanged = new EventEmitter<CodeEnvironment>();
  
  environments: CodeEnvironment[] = [];
  selectedEnvironment?: CodeEnvironment;
  isLoading: boolean = false;
  showEnvironments: boolean = false;
  
  constructor(private codeEditorService: CodeEditorService) {
    super();
  }
  
  ngOnInit(): void {
    this.loadEnvironments();
  }
  
  // Tải danh sách môi trường từ server
  loadEnvironments(): void {
    this.isLoading = true;
    
    this.codeEditorService.getAvailableEnvironments(this.currentLanguage)
      .pipe(takeUntil(this._onDestroySub))
      .subscribe({
        next: (environments) => {
          this.environments = environments;
          
          // Select default environment based on language
          const defaultEnv = this.environments.find(env => 
            env.language === this.currentLanguage && env.isDefault);
          
          if (defaultEnv) {
            this.selectEnvironment(defaultEnv);
          } else if (this.environments.length > 0) {
            this.selectEnvironment(this.environments[0]);
          }
          
          this.isLoading = false;
        },
        error: (err) => {
          console.error('Failed to load environments:', err);
          this.isLoading = false;
        }
      });
  }
  
  // Chọn môi trường
  selectEnvironment(environment: CodeEnvironment): void {
    if (this.selectedEnvironment?.id === environment.id) {
      return;
    }
    
    this.selectedEnvironment = environment;
    this.environmentChanged.emit(environment);
    this.showEnvironments = false;
    
    // Save preference if course and exercise are provided
    if (this.courseId && this.exerciseId) {
      this.saveEnvironmentPreference(environment.id);
    }
  }
  
  // Lưu tùy chọn môi trường
  saveEnvironmentPreference(environmentId: string): void {
    if (!this.courseId || !this.exerciseId) {
      return;
    }
    
    this.codeEditorService.saveEnvironmentPreference(
      this.courseId, 
      this.exerciseId, 
      environmentId
    )
      .pipe(takeUntil(this._onDestroySub))
      .subscribe({
        error: (err) => {
          console.error('Failed to save environment preference:', err);
        }
      });
  }
  
  // Hiển thị dropdown môi trường
  toggleEnvironmentsDropdown(): void {
    this.showEnvironments = !this.showEnvironments;
  }
}
