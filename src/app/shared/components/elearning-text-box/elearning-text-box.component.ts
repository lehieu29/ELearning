import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-elearning-text-box',
  standalone: false,
  templateUrl: './elearning-text-box.component.html',
  styleUrl: './elearning-text-box.component.scss'
})
export class ElearningTextBoxComponent {
  @Input() label?: string;
  @Input() error?: string;
  @Input() iconStart?: string;
  @Input() iconEnd?: string;
  @Input() placeholder = '';
  @Input() type = 'text';

  classTextBox: string = "";

  value: string = '';
  onChange: any = () => {};
  onTouched: any = () => {};

  ngOnInit() {
    this.classTextBox = this.getInputClasses();
  }

  getInputClasses() {
    const base = 'w-full px-4 py-2 border rounded-md focus:ring-2';
    const errorClass = this.error 
      ? 'border-red-500 focus:ring-red-200' 
      : 'border-gray-300 focus:border-blue-500 focus:ring-blue-200';
    
    return `${base} ${errorClass} ${this.iconStart ? 'pl-10' : ''} ${this.iconEnd ? 'pr-10' : ''}`;
  }

  // ControlValueAccessor methods
  writeValue(value: string): void {
    this.value = value;
  }

  registerOnChange(fn: any): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: any): void {
    this.onTouched = fn;
  }
}
