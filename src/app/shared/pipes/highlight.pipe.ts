// src/app/shared/pipes/highlight.pipe.ts
import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'highlight'
})
export class HighlightPipe implements PipeTransform {
  transform(text: string, search: string): string {
    if (!search || !text) {
      return text;
    }

    // Escape special regex characters in search string
    const searchValue = search.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const regex = new RegExp(searchValue, 'gi');

    return text.replace(regex, match => `<span class="bg-yellow-200">${match}</span>`);
  }
}