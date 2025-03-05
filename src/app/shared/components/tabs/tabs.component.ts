import { Component, Input, Output, EventEmitter } from '@angular/core';
import { BaseComponent } from '../base/base-component';

interface Tab {
  id: string;
  label: string;
  icon?: string;
}

@Component({
  selector: 'app-tabs',
  templateUrl: './tabs.component.html'
})
export class TabsComponent extends BaseComponent {
  @Input() tabs: Tab[] = [];
  @Input() activeTabId: string = '';
  @Input() variant: 'primary' | 'secondary' | 'underline' = 'primary';
  
  @Output() tabChange = new EventEmitter<string>();
  
  setActiveTab(tabId: string): void {
    if (this.activeTabId !== tabId) {
      this.activeTabId = tabId;
      this.tabChange.emit(tabId);
    }
  }
}