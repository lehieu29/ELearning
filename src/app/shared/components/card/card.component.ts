import { Component, Input } from '@angular/core';
import { BaseComponent } from '../base/base-component';

@Component({
  selector: 'app-card',
  templateUrl: './card.component.html'
})
export class CardComponent extends BaseComponent {
  @Input() title: string = '';
  @Input() subtitle: string = '';
  @Input() headerImg: string = '';
  @Input() bordered: boolean = true;
  @Input() shadow: 'none' | 'sm' | 'md' | 'lg' = 'md';
  @Input() hover: boolean = false;
  @Input() clickable: boolean = false;
}