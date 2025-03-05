import { Component, Input } from '@angular/core';
import { BaseComponent } from '../base/base-component';

export interface Breadcrumb {
  label: string;
  url?: string;
  icon?: string;
}

@Component({
  selector: 'app-breadcrumbs',
  templateUrl: './breadcrumbs.component.html'
})
export class BreadcrumbsComponent extends BaseComponent {
  @Input() items: Breadcrumb[] = [];
  @Input() separator: string = '/';
  @Input() homeIcon: boolean = true;
}