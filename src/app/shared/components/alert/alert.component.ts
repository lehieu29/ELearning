import { Component, Input, Output, EventEmitter } from '@angular/core';
import { BaseComponent } from '../base/base-component';

@Component({
  selector: 'app-alert',
  templateUrl: './alert.component.html'
})
export class AlertComponent extends BaseComponent {
  @Input() title: string = '';
  @Input() message: string = '';
  @Input() type: 'info' | 'success' | 'warning' | 'error' = 'info';
  @Input() dismissible: boolean = true;
  @Input() icon: boolean = true;
  @Input() outlined: boolean = false;

  @Output() dismiss = new EventEmitter<void>();

  onDismiss(): void {
    this.dismiss.emit();
  }
}