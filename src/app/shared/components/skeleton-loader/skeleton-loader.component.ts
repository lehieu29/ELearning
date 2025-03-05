// src/app/shared/components/skeleton-loader/skeleton-loader.component.ts
import { Component, Input } from '@angular/core';
import { BaseComponent } from '../base/base-component';

@Component({
  selector: 'app-skeleton-loader',
  templateUrl: './skeleton-loader.component.html'
})
export class SkeletonLoaderComponent extends BaseComponent {
  @Input() type: 'text' | 'circle' | 'rectangle' | 'card' | 'list' | 'table' = 'text';
  @Input() width: string = '100%';
  @Input() height: string = '';
  @Input() rounded: boolean = true;
  @Input() animation: 'pulse' | 'wave' | 'none' = 'pulse';
  @Input() count: number = 1;

  get heightClass(): string {
    if (this.height) return '';

    switch (this.type) {
      case 'text':
        return 'h-4';
      case 'circle':
        return 'h-12';
      case 'rectangle':
        return 'h-32';
      case 'card':
        return 'h-48';
      default:
        return 'h-4';
    }
  }

  get roundedClass(): string {
    if (!this.rounded) return '';

    switch (this.type) {
      case 'text':
        return 'rounded';
      case 'circle':
        return 'rounded-full';
      case 'rectangle':
      case 'card':
        return 'rounded-md';
      default:
        return 'rounded';
    }
  }
}