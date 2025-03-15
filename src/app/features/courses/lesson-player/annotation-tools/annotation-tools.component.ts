import { Component, Input, OnInit } from '@angular/core';
import { BaseComponent } from '@app/shared/components/base/base-component';
import { takeUntil } from 'rxjs/operators';

interface Annotation {
  id: string;
  text: string;
  timestamp: number; // in seconds
  createdAt: Date;
  color: string;
}

@Component({
  selector: 'app-annotation-tools',
  templateUrl: './annotation-tools.component.html'
})
export class AnnotationToolsComponent extends BaseComponent implements OnInit {
  @Input() lessonId: string;

  annotations: Annotation[] = [];
  newAnnotation: string = '';
  currentTimestamp: number = 0;
  isLoading: boolean = false;
  selectedColor: string = '#FFFF00'; // Default: yellow
  
  colorOptions: string[] = [
    '#FFFF00', // Yellow
    '#FF9D00', // Orange
    '#FF5252', // Red
    '#36B37E', // Green
    '#00B8D9', // Blue
    '#6554C0'  // Purple
  ];

  constructor() {
    super();
  }

  ngOnInit(): void {
    this.loadAnnotations();
  }

  loadAnnotations(): void {
    this.isLoading = true;
    
    // In a real app, this would be a service call
    setTimeout(() => {
      this.annotations = [
        {
          id: '1',
          text: 'Important concept about component lifecycle',
          timestamp: 125,
          createdAt: new Date(),
          color: '#FFFF00'
        },
        {
          id: '2',
          text: 'Example of dependency injection',
          timestamp: 287,
          createdAt: new Date(),
          color: '#36B37E'
        }
      ];
      this.isLoading = false;
    }, 500);
  }

  addAnnotation(): void {
    if (!this.newAnnotation.trim()) return;
    
    const newItem: Annotation = {
      id: Date.now().toString(),
      text: this.newAnnotation,
      timestamp: this.currentTimestamp,
      createdAt: new Date(),
      color: this.selectedColor
    };
    
    this.annotations = [newItem, ...this.annotations];
    this.newAnnotation = '';
    
    // In a real app, we would save this to the server
    // this.annotationService.saveAnnotation(this.lessonId, newItem)
    //   .pipe(takeUntil(this._onDestroySub))
    //   .subscribe();
  }
  
  deleteAnnotation(id: string): void {
    this.annotations = this.annotations.filter(a => a.id !== id);
    
    // In a real app, we would delete this from the server
    // this.annotationService.deleteAnnotation(this.lessonId, id)
    //   .pipe(takeUntil(this._onDestroySub))
    //   .subscribe();
  }
  
  formatTimestamp(seconds: number): string {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  }
}
