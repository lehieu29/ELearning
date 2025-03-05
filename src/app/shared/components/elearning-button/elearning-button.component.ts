import { Component, EventEmitter, Input, Output } from '@angular/core';
import { BaseComponent } from '../base/base-component';

@Component({
  selector: 'elearning-button',
  templateUrl: './elearning-button.component.html'
})
export class ElearningButtonComponent extends BaseComponent {
  @Input() label: string = 'Button';
  @Input() type: 'button' | 'submit' | 'reset' = 'button';
  @Input() disabled: boolean = false;
  @Input() loading: boolean = false;
  @Input() variant: 'primary' | 'secondary' | 'outline' | 'link' = 'primary';
  @Input() size: 'sm' | 'md' | 'lg' = 'md';
  @Input() block: boolean = true;
  @Input() icon: string = '';
  @Input() iconPosition: 'left' | 'right' = 'left';
  
  @Output() btnClick = new EventEmitter<MouseEvent>();
  
  onClick(event: MouseEvent): void {
    if (!this.disabled && !this.loading) {
      this.btnClick.emit(event);
    }
  }
}