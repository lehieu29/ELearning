import { Component, EventEmitter, Input, Output } from '@angular/core';
import { BaseComponent } from '../base/base-component';

@Component({
  selector: 'app-modal',
  templateUrl: './modal.component.html'
})
export class ModalComponent extends BaseComponent {
  @Input() title: string = '';
  @Input() showCloseButton: boolean = true;
  @Input() size: 'sm' | 'md' | 'lg' | 'full' = 'md';
  @Input() isOpen: boolean = false;
  
  @Output() close = new EventEmitter<void>();
  @Output() opened = new EventEmitter<void>();

  openModal(): void {
    this.isOpen = true;
    this.opened.emit();
  }
  
  closeModal(): void {
    this.isOpen = false;
    this.close.emit();
  }
  
  stopPropagation(event: MouseEvent): void {
    event.stopPropagation();
  }
}