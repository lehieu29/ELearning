// src/app/shared/directives/lazy-load-image/lazy-load-image.directive.ts
import { Directive, ElementRef, Input, OnInit } from '@angular/core';

@Directive({
  selector: 'img[appLazyLoad]'
})
export class LazyLoadImageDirective implements OnInit {
  @Input() appLazyLoad!: string;

  private observer!: IntersectionObserver;

  constructor(private el: ElementRef) { }

  ngOnInit(): void {
    // Check for IntersectionObserver support
    if ('IntersectionObserver' in window) {
      this.observer = new IntersectionObserver(entries => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            this.loadImage();
            this.observer.unobserve(this.el.nativeElement);
          }
        });
      }, {
        rootMargin: '200px' // Start loading images when they're 200px from viewport
      });

      this.observer.observe(this.el.nativeElement);
    } else {
      // Fallback for browsers that don't support IntersectionObserver
      this.loadImage();
    }
  }

  private loadImage(): void {
    const img = this.el.nativeElement;
    img.src = this.appLazyLoad;

    // Remove data-src to prevent future reloading
    img.removeAttribute('data-src');
  }

  ngOnDestroy(): void {
    if (this.observer) {
      this.observer.disconnect();
    }
  }
}