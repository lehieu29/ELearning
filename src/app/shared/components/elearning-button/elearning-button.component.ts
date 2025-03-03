import { Component, EventEmitter, Input, Output } from '@angular/core';
import { BaseComponent } from '../base/base-component';

@Component({
  selector: 'elearning-button',
  standalone: false,
  templateUrl: './elearning-button.component.html',
  styleUrl: './elearning-button.component.scss'
})
export class ElearningButtonComponent extends BaseComponent {
  @Input() label: string = 'Button';
  @Input() type: 'button' | 'submit' | 'reset' = 'button';
  @Input() disabled: boolean = false;
  @Input() loading: boolean = false;
  @Input() variant: 'primary' | 'secondary' | 'outline' = 'primary';
  
  @Output() btnClick = new EventEmitter<MouseEvent>();
  
  onClick(event: MouseEvent): void {
    if (!this.disabled && !this.loading) {
      this.btnClick.emit(event);
    }
  }
}
