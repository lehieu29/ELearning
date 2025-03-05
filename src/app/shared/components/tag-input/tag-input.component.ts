// src/app/shared/components/tag-input/tag-input.component.ts
import { Component, forwardRef, Input, Output, EventEmitter, ElementRef, ViewChild } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { BaseComponent } from '../base/base-component';

@Component({
  selector: 'app-tag-input',
  templateUrl: './tag-input.component.html',
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => TagInputComponent),
      multi: true
    }
  ]
})
export class TagInputComponent extends BaseComponent implements ControlValueAccessor {
  @Input() placeholder: string = 'Add tags...';
  @Input() maxTags: number = 0; // 0 means unlimited
  @Input() minChars: number = 1;
  @Input() maxChars: number = 0; // 0 means unlimited
  @Input() allowDuplicates: boolean = false;
  @Input() separators: string[] = [',', 'Enter', ' '];
  @Input() disabled: boolean = false;
  @Input() tagColor: string = 'bg-blue-100 text-blue-800';

  @Output() tagAdded = new EventEmitter<string>();
  @Output() tagRemoved = new EventEmitter<string>();

  @ViewChild('tagInput') tagInput!: ElementRef<HTMLInputElement>;

  tags: string[] = [];
  inputValue: string = '';

  // Control Value Accessor methods
  onChange: any = () => { };
  onTouched: any = () => { };

  writeValue(tags: string[]): void {
    this.tags = tags || [];
  }

  registerOnChange(fn: any): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: any): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.disabled = isDisabled;
  }

  // Add tag on input
  onInputKeydown(event: KeyboardEvent): void {
    if (this.disabled) return;

    const target = event.target as HTMLInputElement;

    if (this.separators.includes(event.key)) {
      if (event.key === 'Enter') {
        event.preventDefault();
      }

      if (this.inputValue.trim()) {
        this.addTag(this.inputValue.trim());
      }
    } else if (event.key === 'Backspace' && !this.inputValue && this.tags.length > 0) {
      this.removeTag(this.tags.length - 1);
    }
  }

  onInputBlur(): void {
    if (this.inputValue.trim()) {
      this.addTag(this.inputValue.trim());
    }
    this.onTouched();
  }

  addTag(tag: string): void {
    if (this.disabled) return;

    // Check if tag meets requirements
    if (tag.length < this.minChars) return;
    if (this.maxChars > 0 && tag.length > this.maxChars) return;
    if (!this.allowDuplicates && this.tags.includes(tag)) return;
    if (this.maxTags > 0 && this.tags.length >= this.maxTags) return;

    this.tags.push(tag);
    this.inputValue = '';
    this.onChange(this.tags);
    this.tagAdded.emit(tag);
  }

  removeTag(index: number): void {
    if (this.disabled) return;

    const removedTag = this.tags[index];
    this.tags.splice(index, 1);
    this.onChange(this.tags);
    this.tagRemoved.emit(removedTag);
  }

  focusInput(): void {
    if (!this.disabled) {
      this.tagInput.nativeElement.focus();
    }
  }
}