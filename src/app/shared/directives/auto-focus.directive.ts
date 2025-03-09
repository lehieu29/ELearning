// src/app/shared/directives/auto-focus/auto-focus.directive.ts
import { AfterViewInit, Directive, ElementRef, Input } from '@angular/core';

@Directive({
  selector: '[appAutoFocus]'
})
export class AutoFocusDirective implements AfterViewInit {
  @Input() appAutoFocus: boolean = true;
  @Input() focusDelay: number = 0;

  constructor(private el: ElementRef) { }

  ngAfterViewInit(): void {
    if (this.appAutoFocus) {
      setTimeout(() => {
        this.el.nativeElement.focus();
      }, this.focusDelay);
    }
  }
}