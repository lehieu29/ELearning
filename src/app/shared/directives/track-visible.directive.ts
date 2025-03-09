// src/app/shared/directives/track-visible/track-visible.directive.ts
import { Directive, ElementRef, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core';

@Directive({
  selector: '[appTrackVisible]'
})
export class TrackVisibleDirective implements OnInit, OnDestroy {
  @Input() threshold: number = 0.5; // How much of the element needs to be visible
  @Input() onlyOnce: boolean = true; // Emit only the first time element becomes visible

  @Output() visibleChange = new EventEmitter<boolean>();

  private observer: IntersectionObserver | null = null;
  private hasEmitted: boolean = false;

  constructor(private el: ElementRef) { }

  ngOnInit(): void {
    if ('IntersectionObserver' in window) {
      this.observer = new IntersectionObserver(
        this.handleIntersection.bind(this),
        { threshold: this.threshold }
      );

      this.observer.observe(this.el.nativeElement);
    } else {
      // Fallback for browsers that don't support IntersectionObserver
      this.visibleChange.emit(true);
    }
  }

  private handleIntersection(entries: IntersectionObserverEntry[]): void {
    const entry = entries[0];
    const isVisible = entry.isIntersecting;

    if (isVisible && (this.onlyOnce && !this.hasEmitted || !this.onlyOnce)) {
      this.visibleChange.emit(true);
      this.hasEmitted = true;

      if (this.onlyOnce && this.observer) {
        this.observer.disconnect();
      }
    } else if (!isVisible && !this.onlyOnce) {
      this.visibleChange.emit(false);
    }
  }

  ngOnDestroy(): void {
    if (this.observer) {
      this.observer.disconnect();
    }
  }
}