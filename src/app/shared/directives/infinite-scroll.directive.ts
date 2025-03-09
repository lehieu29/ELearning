// src/app/shared/directives/infinite-scroll/infinite-scroll.directive.ts
import { Directive, ElementRef, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { Subscription, fromEvent } from 'rxjs';
import { debounceTime, throttleTime } from 'rxjs/operators';

@Directive({
  selector: '[appInfiniteScroll]'
})
export class InfiniteScrollDirective implements OnInit, OnDestroy {
  @Input() scrollContainer: HTMLElement | Window = window;
  @Input() scrollThreshold: number = 200;
  @Input() scrollDebounce: number = 200;
  @Input() scrollThrottle: number = 50;
  @Input() immediateCheck: boolean = true;

  @Output() scrolled = new EventEmitter<void>();

  private subscription = new Subscription();
  private isLoading = false;

  constructor(private el: ElementRef) { }

  ngOnInit(): void {
    // Set the container to check for scroll
    const containerElement = this.scrollContainer instanceof Window ?
      this.scrollContainer : this.scrollContainer || window;

    this.subscription.add(
      fromEvent(containerElement, 'scroll')
        .pipe(
          throttleTime(this.scrollThrottle),
          debounceTime(this.scrollDebounce)
        )
        .subscribe(() => {
          this.checkForScroll();
        })
    );

    if (this.immediateCheck) {
      setTimeout(() => this.checkForScroll(), 0);
    }
  }

  private checkForScroll(): void {
    if (this.isLoading) return;

    const target = this.scrollContainer instanceof Window ?
      document.documentElement : this.scrollContainer as HTMLElement;
    const targetHeight = this.scrollContainer instanceof Window ?
      window.innerHeight : target.clientHeight;

    // Get distance between bottom of container and bottom of page
    const scrollPosition = target.scrollTop + targetHeight;
    const scrollHeight = target.scrollHeight;

    // Emit event if close enough to end
    if (scrollHeight - scrollPosition <= this.scrollThreshold) {
      this.isLoading = true;
      this.scrolled.emit();

      // Reset after a short delay to prevent multiple emissions
      setTimeout(() => {
        this.isLoading = false;
      }, 1000);
    }
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }
}