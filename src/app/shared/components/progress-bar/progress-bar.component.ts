import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { BaseComponent } from '../base/base-component';

@Component({
  selector: 'app-progress-bar',
  templateUrl: './progress-bar.component.html'
})
export class ProgressBarComponent extends BaseComponent implements OnChanges {
  @Input() progress: number = 0; // 0 to 100
  @Input() showPercentage: boolean = true;
  @Input() color: 'primary' | 'success' | 'warning' | 'danger' = 'primary';
  @Input() height: 'sm' | 'md' | 'lg' = 'md';
  @Input() animated: boolean = false;

  normalizedProgress: number = 0;

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['progress']) {
      this.normalizedProgress = Math.max(0, Math.min(100, this.progress));
    }
  }
}