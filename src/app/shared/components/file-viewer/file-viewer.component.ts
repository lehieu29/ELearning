// src/app/shared/components/file-viewer/file-viewer.component.ts
import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { BaseComponent } from '../base/base-component';

export type FileType = 'image' | 'pdf' | 'video' | 'audio' | 'text' | 'code' | 'office' | 'other';

@Component({
  selector: 'app-file-viewer',
  templateUrl: './file-viewer.component.html'
})
export class FileViewerComponent extends BaseComponent implements OnChanges {
  @Input() fileUrl: string = '';
  @Input() fileName: string = '';
  @Input() fileType: FileType | null = null;
  @Input() width: string = '100%';
  @Input() height: string = '500px';

  safeUrl: SafeResourceUrl | null = null;
  detectedType: FileType = 'other';

  constructor(private sanitizer: DomSanitizer) {
    super();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['fileUrl'] && this.fileUrl) {
      this.safeUrl = this.sanitizer.bypassSecurityTrustResourceUrl(this.fileUrl);
      this.detectedType = this.fileType || this.detectFileType(this.fileUrl, this.fileName);
    }
  }

  private detectFileType(url: string, name: string): FileType {
    // Try to detect by extension first
    const extension = this.getFileExtension(name || url).toLowerCase();

    // Image files
    if (['jpg', 'jpeg', 'png', 'gif', 'bmp', 'svg', 'webp'].includes(extension)) {
      return 'image';
    }

    // PDF files
    if (extension === 'pdf') {
      return 'pdf';
    }

    // Video files
    if (['mp4', 'webm', 'ogg', 'mov', 'avi'].includes(extension)) {
      return 'video';
    }

    // Audio files
    if (['mp3', 'wav', 'ogg', 'aac'].includes(extension)) {
      return 'audio';
    }

    // Text files
    if (['txt', 'csv', 'log', 'md'].includes(extension)) {
      return 'text';
    }

    // Code files
    if (['js', 'ts', 'html', 'css', 'scss', 'json', 'xml', 'py', 'java', 'c', 'cpp', 'cs', 'php', 'rb'].includes(extension)) {
      return 'code';
    }

    // Office documents
    if (['doc', 'docx', 'xls', 'xlsx', 'ppt', 'pptx'].includes(extension)) {
      return 'office';
    }

    return 'other';
  }

  private getFileExtension(filename: string): string {
    return filename.split('.').pop() || '';
  }

  getFileIcon(): string {
    switch (this.detectedType) {
      case 'image':
        return 'fa-file-image';
      case 'pdf':
        return 'fa-file-pdf';
      case 'video':
        return 'fa-file-video';
      case 'audio':
        return 'fa-file-audio';
      case 'text':
        return 'fa-file-alt';
      case 'code':
        return 'fa-file-code';
      case 'office':
        return 'fa-file-word';
      default:
        return 'fa-file';
    }
  }
}