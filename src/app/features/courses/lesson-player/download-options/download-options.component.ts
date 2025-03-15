// File path: src/app/features/course/lesson-player/download-options/download-options.component.ts
import { Component, Input } from '@angular/core';
import { BaseComponent } from '@app/shared/components/base/base-component';
import { Attachment } from '@app/shared/models/course.model';
import { saveAs } from 'file-saver';
import { HttpClient } from '@angular/common/http';
import { takeUntil } from 'rxjs/operators';

@Component({
  selector: 'app-download-options',
  templateUrl: './download-options.component.html'
})
export class DownloadOptionsComponent extends BaseComponent {
  @Input() resources: Attachment[] = [];
  isDropdownOpen = false;
  isDownloading: { [id: string]: boolean } = {};
  
  constructor(private http: HttpClient) {
    super();
  }
  
  toggleDropdown(): void {
    this.isDropdownOpen = !this.isDropdownOpen;
  }
  
  downloadResource(resource: Attachment): void {
    if (this.isDownloading[resource.id]) return;
    
    this.isDownloading[resource.id] = true;
    
    if (resource.type === 'link') {
      window.open(resource.url, '_blank');
      this.isDownloading[resource.id] = false;
      return;
    }
    
    this.http.get(resource.url, { responseType: 'blob' })
      .pipe(takeUntil(this._onDestroySub))
      .subscribe({
        next: (blob) => {
          saveAs(blob, resource.title || 'download');
          this.isDownloading[resource.id] = false;
        },
        error: (error) => {
          console.error('Download error:', error);
          this.isDownloading[resource.id] = false;
        }
      });
  }
  
  getFileTypeIcon(type: string): string {
    switch (type) {
      case 'pdf':
        return 'document-text';
      case 'image':
        return 'photograph';
      case 'link':
        return 'link';
      default:
        return 'document';
    }
  }
  
  getFileSize(size: number): string {
    if (!size) return '';
    
    const units = ['B', 'KB', 'MB', 'GB'];
    let fileSize = size;
    let unitIndex = 0;
    
    while (fileSize >= 1024 && unitIndex < units.length - 1) {
      fileSize /= 1024;
      unitIndex++;
    }
    
    return `${fileSize.toFixed(1)} ${units[unitIndex]}`;
  }
}
