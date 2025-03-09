// src/app/shared/directives/content-editable/content-editable.directive.ts
import { Directive, ElementRef, forwardRef, HostListener, Input, OnDestroy, OnInit, Renderer2 } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';

@Directive({
  selector: '[appContentEditable]',
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => ContentEditableDirective),
      multi: true
    }
  ]
})
export class ContentEditableDirective implements ControlValueAccessor, OnInit, OnDestroy {
  @Input() appContentEditable: boolean = true;
  @Input() placeholder: string = '';

  private onChange!: (value: string) => void;
  private onTouched!: () => void;
  private initialPlaceholder: string = '';

  constructor(
    private elementRef: ElementRef,
    private renderer: Renderer2
  ) { }

  ngOnInit(): void {
    // Make element content-editable
    this.renderer.setAttribute(this.elementRef.nativeElement, 'contenteditable', this.appContentEditable.toString());

    // Set placeholder
    if (this.placeholder) {
      this.initialPlaceholder = this.placeholder;
      this.setPlaceholder();
    }
  }

  @HostListener('input')
  onInput(): void {
    this.onChange(this.elementRef.nativeElement.innerText.trim());
  }

  @HostListener('blur')
  onBlur(): void {
    this.onTouched();

    // Reapply placeholder if empty
    if (!this.elementRef.nativeElement.innerText.trim() && this.placeholder) {
      this.setPlaceholder();
    }
  }

  @HostListener('focus')
  onFocus(): void {
    // Remove placeholder if it's present
    if (this.elementRef.nativeElement.innerText.trim() === this.initialPlaceholder) {
      this.elementRef.nativeElement.innerText = '';
      this.renderer.removeClass(this.elementRef.nativeElement, 'placeholder');
    }
  }

  writeValue(value: string): void {
    if (value !== null && value !== undefined) {
      this.elementRef.nativeElement.innerText = value;
    } else {
      this.elementRef.nativeElement.innerText = '';

      if (this.placeholder) {
        this.setPlaceholder();
      }
    }
  }

  registerOnChange(fn: (value: string) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.renderer.setAttribute(
      this.elementRef.nativeElement,
      'contenteditable',
      !isDisabled ? 'true' : 'false'
    );
  }

  private setPlaceholder(): void {
    this.elementRef.nativeElement.innerText = this.initialPlaceholder;
    this.renderer.addClass(this.elementRef.nativeElement, 'placeholder');
  }

  ngOnDestroy(): void {
    this.renderer.removeAttribute(this.elementRef.nativeElement, 'contenteditable');
  }
}