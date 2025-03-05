import { Component, Input, ElementRef, OnDestroy, HostListener } from '@angular/core';
import { BaseComponent } from '../base/base-component';

@Component({
  selector: 'app-tooltip',
  templateUrl: './tooltip.component.html'
})
export class TooltipComponent extends BaseComponent implements OnDestroy {
  @Input() text: string = '';
  @Input() position: 'top' | 'right' | 'bottom' | 'left' = 'top';
  @Input() color: 'dark' | 'light' = 'dark';
  @Input() showDelay: number = 300;
  @Input() hideDelay: number = 100;

  isVisible: boolean = false;
  private showTimeoutId: any;
  private hideTimeoutId: any;

  constructor(private elementRef: ElementRef) {
    super();
  }

  @HostListener('mouseenter')
  onMouseEnter(): void {
    clearTimeout(this.hideTimeoutId);
    this.showTimeoutId = setTimeout(() => {
      this.isVisible = true;
    }, this.showDelay);
  }

  @HostListener('mouseleave')
  onMouseLeave(): void {
    clearTimeout(this.showTimeoutId);
    this.hideTimeoutId = setTimeout(() => {
      this.isVisible = false;
    }, this.hideDelay);
  }

  ngOnDestroy(): void {
    super.ngOnDestroy();
    clearTimeout(this.showTimeoutId);
    clearTimeout(this.hideTimeoutId);
  }
}