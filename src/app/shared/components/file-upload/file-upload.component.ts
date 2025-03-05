import { Component, Input, Output, EventEmitter, HostListener, ElementRef } from '@angular/core';
import { BaseComponent } from '../base/base-component';

export interface FileUploadConfig {
  accept?: string;
  multiple?: boolean;
  maxSizeInMB?: number;
  maxFiles?: number;
}

@Component({
  selector: 'app-file-upload',
  templateUrl: './file-upload.component.html'
})
export class FileUploadComponent extends BaseComponent {
  @Input() config: FileUploadConfig = {
    accept: '*/*',
    multiple: false,
    maxSizeInMB: 10,
    maxFiles: 5
  };
  
  @Input() label: string = 'Choose files or drag and drop';
  @Input() helperText: string = 'Max file size: 10MB';
  @Input() disabled: boolean = false;
  
  @Output() filesSelected = new EventEmitter<File[]>();
  @Output() error = new EventEmitter<string>();
  
  files: File[] = [];
  isDragging: boolean = false;
  
  constructor(private el: ElementRef) {
    super();
  }
  
  @HostListener('dragover', ['$event'])
  onDragOver(event: DragEvent): void {
    if (this.disabled) return;
    
    this.preventDefaults(event);
    this.isDragging = true;
  }
  
  @HostListener('dragleave', ['$event'])
  onDragLeave(event: DragEvent): void {
    this.preventDefaults(event);
    this.isDragging = false;
  }
  
  @HostListener('drop', ['$event'])
  onDrop(event: DragEvent): void {
    if (this.disabled) return;
    
    this.preventDefaults(event);
    this.isDragging = false;
    
    if (event.dataTransfer?.files) {
      this.handleFiles(event.dataTransfer.files);
    }
  }
  
  onFileInputChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files) {
      this.handleFiles(input.files);
    }
  }
  
  removeFile(index: number): void {
    this.files.splice(index, 1);
    this.filesSelected.emit(this.files);
  }
  
  browseFiles(): void {
    if (this.disabled) return;
    
    const fileInput = this.el.nativeElement.querySelector('input[type="file"]');
    fileInput.click();
  }
  
  private handleFiles(fileList: FileList): void {
    if (this.disabled) return;
    
    // Convert FileList to Array
    const filesArray = Array.from(fileList);
    
    // Check max files
    if (!this.config.multiple && filesArray.length > 1) {
      this.error.emit('Only one file can be uploaded');
      return;
    }
    
    if (this.config.multiple && this.files.length + filesArray.length > this.config.maxFiles) {
      this.error.emit(`Maximum ${this.config.maxFiles} files allowed`);
      return;
    }
    
    // Check file size
    const maxSizeInBytes = (this.config.maxSizeInMB || 10) * 1024 * 1024;
    const oversizedFiles = filesArray.filter(file => file.size > maxSizeInBytes);
    
    if (oversizedFiles.length > 0) {
      this.error.emit(`File size exceeds maximum allowed size (${this.config.maxSizeInMB}MB)`);
      return;
    }
    
    // Update files array
    if (this.config.multiple) {
      this.files = [...this.files, ...filesArray];
    } else {
      this.files = filesArray;
    }
    
    this.filesSelected.emit(this.files);
  }
  
  private preventDefaults(event: Event): void {
    event.preventDefault();
    event.stopPropagation();
  }
  
  formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }
}