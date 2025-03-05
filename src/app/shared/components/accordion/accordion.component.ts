// src/app/shared/components/accordion/accordion.component.ts
import { Component, Input, Output, EventEmitter } from '@angular/core';
import { BaseComponent } from '../base/base-component';

export interface AccordionItem {
  id: string;
  title: string;
  content?: string; // Optional when using template projection
  isOpen?: boolean;
  disabled?: boolean;
}

@Component({
  selector: 'app-accordion',
  templateUrl: './accordion.component.html'
})
export class AccordionComponent extends BaseComponent {
  @Input() items: AccordionItem[] = [];
  @Input() multiple: boolean = false;
  @Input() bordered: boolean = true;
  @Input() rounded: boolean = true;

  @Output() itemToggled = new EventEmitter<{ id: string, isOpen: boolean }>();

  toggleItem(item: AccordionItem): void {
    if (item.disabled) {
      return;
    }

    if (!this.multiple) {
      // Close all other items in single mode
      this.items.forEach(i => {
        if (i.id !== item.id) {
          i.isOpen = false;
        }
      });
    }

    item.isOpen = !item.isOpen;
    this.itemToggled.emit({ id: item.id, isOpen: item.isOpen });
  }
}