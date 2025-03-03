import { Component, forwardRef, Input, OnInit } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';

let nextId = 0;
@Component({
  selector: 'elearning-textbox',
  standalone: false,
  templateUrl: './elearning-text-box.component.html',
  styleUrl: './elearning-text-box.component.scss',
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => ElearningTextBoxComponent),
      multi: true
    }
  ]
})
export class ElearningTextBoxComponent implements ControlValueAccessor, OnInit {
  @Input() label: string = 'Label';
  @Input() type: 'text' | 'password' | 'email' | 'number' = 'text';
  @Input() id: string = `elearning-textbox-${nextId++}`;
  @Input() placeholder: string = '';
  @Input() disabled: boolean = false;
  @Input() error: string = '';

  value: string = '';
  isFocused: boolean = false;
  showPassword: boolean = false;

  // Function to call when the value changes
  onChange: any = () => {};
  
  // Function to call when the input is touched
  onTouched: any = () => {};

  ngOnInit() {
    // If type is password, we might want to initialize with the masked state
    if (this.type === 'password') {
      this.showPassword = false;
    }
  }

  // Writes a new value to the element
  writeValue(value: any): void {
    this.value = value || '';
  }

  // Registers a callback function that is called when the control value changes
  registerOnChange(fn: any): void {
    this.onChange = fn;
  }

  // Registers a callback function that is called by the forms API on initialization
  registerOnTouched(fn: any): void {
    this.onTouched = fn;
  }

  // Method that is called when the control status changes to or from "DISABLED"
  setDisabledState?(isDisabled: boolean): void {
    this.disabled = isDisabled;
  }

  // Event handler for input value changes
  onInputChange(event: Event): void {
    const target = event.target as HTMLInputElement;
    this.value = target.value;
    this.onChange(this.value);
  }

  // Event handler for focus event
  onFocus(): void {
    this.isFocused = true;
  }

  // Event handler for blur event
  onBlur(): void {
    this.isFocused = false;
    this.onTouched();
  }

  // Toggle password visibility for password inputs
  togglePasswordVisibility(): void {
    if (this.type === 'password') {
      this.showPassword = !this.showPassword;
      this.type = this.showPassword ? 'text' : 'password';
    }
  }
}
