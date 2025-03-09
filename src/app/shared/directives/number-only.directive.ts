// src/app/shared/directives/number-only/number-only.directive.ts
import { Directive, ElementRef, HostListener, Input } from '@angular/core';

@Directive({
  selector: '[appNumberOnly]'
})
export class NumberOnlyDirective {
  @Input() allowDecimal: boolean = false;
  @Input() allowNegative: boolean = false;
  @Input() maxLength: number = 0; // 0 means unlimited

  private regex!: RegExp;
  private specialKeys: string[] = ['Backspace', 'Tab', 'End', 'Home', 'ArrowLeft', 'ArrowRight', 'Delete'];

  constructor(private el: ElementRef) {
    this.setRegex();
  }

  @HostListener('keydown', ['$event'])
  onKeyDown(event: KeyboardEvent): void {
    // Allow navigation keys
    if (this.specialKeys.includes(event.key)) {
      return;
    }

    // Allow Ctrl+A, Ctrl+C, Ctrl+V, Ctrl+X
    if ((event.ctrlKey || event.metaKey) && ['a', 'c', 'v', 'x'].includes(event.key)) {
      return;
    }

    // Allow decimal point if configured
    if (this.allowDecimal && event.key === '.' && !this.el.nativeElement.value.includes('.')) {
      return;
    }

    // Allow negative sign if configured
    if (this.allowNegative && event.key === '-' && this.el.nativeElement.selectionStart === 0 && !this.el.nativeElement.value.includes('-')) {
      return;
    }

    // Check max length
    if (this.maxLength > 0 && this.el.nativeElement.value.length >= this.maxLength &&
      this.el.nativeElement.selectionEnd - this.el.nativeElement.selectionStart === 0) {
      event.preventDefault();
      return;
    }

    // Only allow digits
    if (!this.regex.test(event.key)) {
      event.preventDefault();
    }
  }

  @HostListener('paste', ['$event'])
  onPaste(event: ClipboardEvent): void {
    event.preventDefault();

    const pastedInput = event.clipboardData?.getData('text/plain');
    if (!pastedInput) return;

    let regex = /^\d*$/;

    if (this.allowDecimal && this.allowNegative) {
      regex = /^-?\d*\.?\d*$/;
    } else if (this.allowDecimal) {
      regex = /^\d*\.?\d*$/;
    } else if (this.allowNegative) {
      regex = /^-?\d*$/;
    }

    if (regex.test(pastedInput)) {
      const currentValue = this.el.nativeElement.value;
      const selectionStart = this.el.nativeElement.selectionStart || 0;
      const selectionEnd = this.el.nativeElement.selectionEnd || 0;

      // Calculate new value after paste
      const newValue = currentValue.substring(0, selectionStart) + pastedInput + currentValue.substring(selectionEnd);

      // Check max length
      if (this.maxLength > 0 && newValue.length > this.maxLength) {
        return;
      }

      document.execCommand('insertText', false, pastedInput);
    }
  }

  private setRegex(): void {
    this.regex = /^\d$/; // Default: digits only
  }
}