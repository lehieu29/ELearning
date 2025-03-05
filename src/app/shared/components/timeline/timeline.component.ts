// src/app/shared/components/timeline/timeline.component.ts
import { Component, Input } from '@angular/core';
import { BaseComponent } from '../base/base-component';

export interface TimelineItem {
  id: string;
  title: string;
  description?: string;
  date?: string | Date;
  icon?: string;
  iconBackground?: string;
  status?: 'completed' | 'current' | 'upcoming';
  content?: string;
}

@Component({
  selector: 'app-timeline',
  templateUrl: './timeline.component.html'
})
export class TimelineComponent extends BaseComponent {
  @Input() items: TimelineItem[] = [];
  @Input() alternating: boolean = false;
  @Input() centerLine: boolean = false;
  @Input() showIcons: boolean = true;
  @Input() iconSize: 'sm' | 'md' | 'lg' = 'md';

  getDate(date: string | Date | undefined): string {
    if (!date) return '';

    if (date instanceof Date) {
      return date.toLocaleDateString();
    }

    return date;
  }

  getStatusColor(status: string | undefined): string {
    switch (status) {
      case 'completed':
        return 'bg-green-500';
      case 'current':
        return 'bg-blue-500';
      case 'upcoming':
        return 'bg-gray-300';
      default:
        return 'bg-blue-500';
    }
  }
}