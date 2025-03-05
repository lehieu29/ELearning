import { Component, Input } from '@angular/core';
import { BaseComponent } from '../base/base-component';

@Component({
  selector: 'app-badge',
  templateUrl: './badge.component.html'
})
export class BadgeComponent extends BaseComponent {
  @Input() text: string = '';
  @Input() variant: 'primary' | 'success' | 'warning' | 'danger' | 'info' | 'light' = 'primary';
  @Input() size: 'sm' | 'md' | 'lg' = 'md';
  @Input() rounded: boolean = true;
}