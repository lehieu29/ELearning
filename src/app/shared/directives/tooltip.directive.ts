// src/app/shared/directives/tooltip/tooltip.directive.ts
import { Directive, Input, ElementRef, Renderer2, OnDestroy, HostListener } from '@angular/core';

@Directive({
  selector: '[appTooltip]'
})
export class TooltipDirective implements OnDestroy {
  @Input() appTooltip: string = '';
  @Input() tooltipPosition: 'top' | 'right' | 'bottom' | 'left' = 'top';
  @Input() tooltipDelay: number = 300;

  private tooltipElement: HTMLElement | null = null;
  private showTimeout: any;

  constructor(
    private el: ElementRef,
    private renderer: Renderer2
  ) { }

  @HostListener('mouseenter')
  onMouseEnter(): void {
    this.showTimeout = setTimeout(() => {
      this.createTooltip();
    }, this.tooltipDelay);
  }

  @HostListener('mouseleave')
  onMouseLeave(): void {
    if (this.showTimeout) {
      clearTimeout(this.showTimeout);
    }
    this.removeTooltip();
  }

  private createTooltip(): void {
    if (!this.appTooltip) return;

    // Create tooltip element
    this.tooltipElement = this.renderer.createElement('div');
    const text = this.renderer.createText(this.appTooltip);

    // Style the tooltip
    this.renderer.addClass(this.tooltipElement, 'bg-gray-800');
    this.renderer.addClass(this.tooltipElement, 'text-white');
    this.renderer.addClass(this.tooltipElement, 'py-1');
    this.renderer.addClass(this.tooltipElement, 'px-2');
    this.renderer.addClass(this.tooltipElement, 'rounded');
    this.renderer.addClass(this.tooltipElement, 'text-sm');
    this.renderer.addClass(this.tooltipElement, 'absolute');
    this.renderer.addClass(this.tooltipElement, 'z-50');
    this.renderer.addClass(this.tooltipElement, 'whitespace-nowrap');

    // Set pointer events to none to prevent tooltip from interfering with mouse events
    this.renderer.setStyle(this.tooltipElement, 'pointer-events', 'none');

    // Add text to tooltip
    this.renderer.appendChild(this.tooltipElement, text);

    // Add tooltip to body
    this.renderer.appendChild(document.body, this.tooltipElement);

    // Position the tooltip
    this.positionTooltip();

    // Add animation
    this.renderer.setStyle(this.tooltipElement, 'opacity', '0');
    this.renderer.setStyle(this.tooltipElement, 'transition', 'opacity 0.3s');

    setTimeout(() => {
      if (this.tooltipElement) {
        this.renderer.setStyle(this.tooltipElement, 'opacity', '1');
      }
    }, 20);
  }

  private positionTooltip(): void {
    if (!this.tooltipElement) return;

    const hostRect = this.el.nativeElement.getBoundingClientRect();
    const tooltipRect = this.tooltipElement.getBoundingClientRect();

    // Calculate position based on tooltip position
    let top: number;
    let left: number;

    switch (this.tooltipPosition) {
      case 'top':
        top = hostRect.top - tooltipRect.height - 8;
        left = hostRect.left + (hostRect.width - tooltipRect.width) / 2;
        break;
      case 'right':
        top = hostRect.top + (hostRect.height - tooltipRect.height) / 2;
        left = hostRect.right + 8;
        break;
      case 'bottom':
        top = hostRect.bottom + 8;
        left = hostRect.left + (hostRect.width - tooltipRect.width) / 2;
        break;
      case 'left':
        top = hostRect.top + (hostRect.height - tooltipRect.height) / 2;
        left = hostRect.left - tooltipRect.width - 8;
        break;
    }

    // Add window scroll position
    top += window.scrollY;
    left += window.scrollX;

    // Set position
    this.renderer.setStyle(this.tooltipElement, 'top', `${top}px`);
    this.renderer.setStyle(this.tooltipElement, 'left', `${left}px`);
  }

  private removeTooltip(): void {
    if (this.tooltipElement) {
      this.renderer.setStyle(this.tooltipElement, 'opacity', '0');

      // Remove after transition
      setTimeout(() => {
        if (this.tooltipElement && this.tooltipElement.parentNode) {
          this.renderer.removeChild(document.body, this.tooltipElement);
          this.tooltipElement = null;
        }
      }, 300);
    }
  }

  ngOnDestroy(): void {
    clearTimeout(this.showTimeout);
    this.removeTooltip();
  }
}