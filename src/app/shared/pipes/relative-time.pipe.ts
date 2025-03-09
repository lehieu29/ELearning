// src/app/shared/pipes/relative-time.pipe.ts
import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'relativeTime'
})
export class RelativeTimePipe implements PipeTransform {
  transform(value: string | Date): string {
    if (!value) {
      return '';
    }

    const date = value instanceof Date ? value : new Date(value);
    const now = new Date();

    const seconds = Math.round((now.getTime() - date.getTime()) / 1000);
    const minutes = Math.round(seconds / 60);
    const hours = Math.round(minutes / 60);
    const days = Math.round(hours / 24);
    const months = Math.round(days / 30.416);
    const years = Math.round(days / 365);

    if (seconds <= 45) {
      return 'just now';
    } else if (seconds <= 90) {
      return 'a minute ago';
    } else if (minutes <= 45) {
      return `${minutes} minutes ago`;
    } else if (minutes <= 90) {
      return 'an hour ago';
    } else if (hours <= 22) {
      return `${hours} hours ago`;
    } else if (hours <= 36) {
      return 'a day ago';
    } else if (days <= 25) {
      return `${days} days ago`;
    } else if (days <= 45) {
      return 'a month ago';
    } else if (days <= 345) {
      return `${months} months ago`;
    } else if (days <= 545) {
      return 'a year ago';
    } else {
      return `${years} years ago`;
    }
  }
}