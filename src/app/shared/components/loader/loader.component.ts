import { Component, Input } from '@angular/core';
import { BaseComponent } from '../base/base-component';

@Component({
  selector: 'app-loader',
  templateUrl: './loader.component.html'
})
export class LoaderComponent extends BaseComponent {
  @Input() size: 'sm' | 'md' | 'lg' = 'md';
  @Input() color: 'primary' | 'secondary' | 'white' = 'primary';
  @Input() overlay: boolean = false;
  @Input() text: string = '';
}