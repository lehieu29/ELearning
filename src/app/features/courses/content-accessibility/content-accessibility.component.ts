import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { BaseComponent } from '@app/shared/components/base/base-component';
import { CourseService } from '@app/shared/services/course.service';
import { UserPreferencesService } from '@app/shared/services/user-preferences.service';
import { takeUntil } from 'rxjs/operators';

@Component({
  selector: 'app-content-accessibility',
  templateUrl: './content-accessibility.component.html'
})
export class ContentAccessibilityComponent extends BaseComponent implements OnInit {
  courseId: string;
  isLoading = true;
  error = '';
  
  accessibilityForm: FormGroup;
  transcriptsEnabled = true;
  userPreferences: any = {};
  
  fontSizeOptions = [
    { value: 'small', label: 'Small' },
    { value: 'default', label: 'Default' },
    { value: 'large', label: 'Large' },
    { value: 'x-large', label: 'Extra Large' }
  ];
  
  contrastOptions = [
    { value: 'default', label: 'Default' },
    { value: 'high', label: 'High Contrast' },
    { value: 'inverted', label: 'Inverted Colors' }
  ];
  
  animationOptions = [
    { value: 'enabled', label: 'Enabled' },
    { value: 'reduced', label: 'Reduced' },
    { value: 'disabled', label: 'Disabled' }
  ];
  
  constructor(
    private route: ActivatedRoute,
    private fb: FormBuilder,
    private courseService: CourseService,
    private preferencesService: UserPreferencesService
  ) {
    super();
    
    this.accessibilityForm = this.fb.group({
      fontSize: ['default'],
      contrast: ['default'],
      animations: ['enabled'],
      screenReaderOptimized: [false],
      autoGenerateTranscripts: [true],
      showCaptions: [true],
      useKeyboardShortcuts: [true],
      textToSpeech: [false],
      readingSpeed: [1]
    });
  }
  
  ngOnInit(): void {
    this.route.parent.paramMap
      .pipe(takeUntil(this._onDestroySub))
      .subscribe(params => {
        this.courseId = params.get('courseId');
        this.loadUserPreferences();
      });
  }
  
  loadUserPreferences(): void {
    this.isLoading = true;
    
    this.preferencesService.getUserAccessibilityPreferences()
      .pipe(takeUntil(this._onDestroySub))
      .subscribe({
        next: (preferences) => {
          this.userPreferences = preferences;
          
          this.accessibilityForm.patchValue({
            fontSize: preferences.fontSize || 'default',
            contrast: preferences.contrast || 'default',
            animations: preferences.animations || 'enabled',
            screenReaderOptimized: preferences.screenReaderOptimized || false,
            autoGenerateTranscripts: preferences.autoGenerateTranscripts !== false,
            showCaptions: preferences.showCaptions !== false,
            useKeyboardShortcuts: preferences.useKeyboardShortcuts !== false,
            textToSpeech: preferences.textToSpeech || false,
            readingSpeed: preferences.readingSpeed || 1
          });
          
          this.isLoading = false;
        },
        error: (err) => {
          console.error('Error loading accessibility preferences:', err);
          this.error = 'Failed to load your accessibility preferences. Using default settings.';
          this.isLoading = false;
        }
      });
  }
  
  savePreferences(): void {
    const preferences = this.accessibilityForm.value;
    
    this.preferencesService.saveUserAccessibilityPreferences(preferences)
      .pipe(takeUntil(this._onDestroySub))
      .subscribe({
        next: () => {
          // Apply the changes to the current session
          this.applyAccessibilitySettings(preferences);
        },
        error: (err) => {
          console.error('Error saving accessibility preferences:', err);
          this.error = 'Failed to save your accessibility preferences.';
        }
      });
  }
  
  applyAccessibilitySettings(settings: any): void {
    // Font size
    document.documentElement.classList.remove('text-small', 'text-default', 'text-large', 'text-x-large');
    document.documentElement.classList.add(`text-${settings.fontSize}`);
    
    // Contrast
    document.documentElement.classList.remove('contrast-default', 'contrast-high', 'contrast-inverted');
    document.documentElement.classList.add(`contrast-${settings.contrast}`);
    
    // Animations
    document.documentElement.classList.remove('animations-enabled', 'animations-reduced', 'animations-disabled');
    document.documentElement.classList.add(`animations-${settings.animations}`);
    
    // Screen reader optimization
    if (settings.screenReaderOptimized) {
      document.documentElement.setAttribute('role', 'application');
    } else {
      document.documentElement.removeAttribute('role');
    }
  }
  
  resetToDefaults(): void {
    this.accessibilityForm.setValue({
      fontSize: 'default',
      contrast: 'default',
      animations: 'enabled',
      screenReaderOptimized: false,
      autoGenerateTranscripts: true,
      showCaptions: true,
      useKeyboardShortcuts: true,
      textToSpeech: false,
      readingSpeed: 1
    });
    
    this.savePreferences();
  }
  
  // Test the current accessibility settings
  testSettings(): void {
    this.applyAccessibilitySettings(this.accessibilityForm.value);
  }
}
