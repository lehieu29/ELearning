// src/app/shared/pipes/duration.pipe.ts
import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'duration'
})
export class DurationPipe implements PipeTransform {
  transform(value: number, format: 'short' | 'long' = 'long'): string {
    if (value === null || value === undefined || isNaN(value)) {
      return '';
    }

    // Convert to minutes if value is in seconds
    const minutes = Math.round(value / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    const remainingHours = hours % 24;
    const remainingMinutes = minutes % 60;

    // For short format
    if (format === 'short') {
      if (days > 0) {
        return `${days}d ${remainingHours}h`;
      } else if (hours > 0) {
        return `${hours}h ${remainingMinutes}m`;
      } else {
        return `${minutes}m`;
      }
    }

    // For long format
    const parts: string[] = [];

    if (days > 0) {
      parts.push(`${days} ${days === 1 ? 'day' : 'days'}`);
    }

    if (remainingHours > 0 || days > 0) {
      parts.push(`${remainingHours} ${remainingHours === 1 ? 'hour' : 'hours'}`);
    }

    if (remainingMinutes > 0 || (hours === 0 && minutes === 0)) {
      parts.push(`${remainingMinutes} ${remainingMinutes === 1 ? 'minute' : 'minutes'}`);
    }

    return parts.join(', ');
  }
}