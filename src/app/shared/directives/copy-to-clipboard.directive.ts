// src/app/shared/directives/copy-to-clipboard/copy-to-clipboard.directive.ts
import { Directive, HostListener, Input, Output, EventEmitter } from '@angular/core';

@Directive({
  selector: '[appCopyToClipboard]'
})
export class CopyToClipboardDirective {
  @Input() appCopyToClipboard!: string;
  @Output() copied = new EventEmitter<string>();

  @HostListener('click', ['$event'])
  onClick(event: MouseEvent): void {
    event.preventDefault();

    if (!this.appCopyToClipboard) return;

    const textToCopy = this.appCopyToClipboard;

    // Use the clipboard API if available
    if (navigator.clipboard) {
      navigator.clipboard.writeText(textToCopy)
        .then(() => {
          this.copied.emit(textToCopy);
        })
        .catch(err => {
          console.error('Could not copy text: ', err);
        });
    } else {
      // Fallback for browsers without clipboard API
      this.fallbackCopyTextToClipboard(textToCopy);
    }
  }

  private fallbackCopyTextToClipboard(text: string): void {
    // Create textarea element
    const textArea = document.createElement('textarea');

    // Set styles to make it invisible
    textArea.style.position = 'fixed';
    textArea.style.top = '0';
    textArea.style.left = '0';
    textArea.style.width = '2em';
    textArea.style.height = '2em';
    textArea.style.padding = '0';
    textArea.style.border = 'none';
    textArea.style.outline = 'none';
    textArea.style.boxShadow = 'none';
    textArea.style.background = 'transparent';

    // Set value to text to be copied
    textArea.value = text;

    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();

    try {
      const successful = document.execCommand('copy');
      if (successful) {
        this.copied.emit(text);
      }
    } catch (err) {
      console.error('Fallback: Could not copy text: ', err);
    }

    document.body.removeChild(textArea);
  }
}