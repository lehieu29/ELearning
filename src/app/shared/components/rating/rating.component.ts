import { Component, EventEmitter, Input, Output, OnInit } from '@angular/core';
import { BaseComponent } from '../base/base-component';

@Component({
  selector: 'app-rating',
  templateUrl: './rating.component.html'
})
export class RatingComponent extends BaseComponent implements OnInit {
  @Input() value: number = 0;
  @Input() totalStars: number = 5;
  @Input() readonly: boolean = false;
  @Input() size: 'sm' | 'md' | 'lg' = 'md';

  @Output() ratingChange = new EventEmitter<number>();

  stars: number[] = [];
  hoverIndex: number = -1;

  ngOnInit(): void {
    super.ngOnInit();
    this.stars = Array(this.totalStars).fill(0).map((_, i) => i + 1);
  }

  setRating(index: number): void {
    if (!this.readonly) {
      this.value = index;
      this.ratingChange.emit(index);
    }
  }

  setHoverState(index: number): void {
    if (!this.readonly) {
      this.hoverIndex = index;
    }
  }

  resetHoverState(): void {
    this.hoverIndex = -1;
  }

  isActive(index: number): boolean {
    return (this.hoverIndex === -1 ? this.value : this.hoverIndex) >= index;
  }
}