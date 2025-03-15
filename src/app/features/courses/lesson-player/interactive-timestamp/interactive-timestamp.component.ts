import { Component, Input, OnInit } from '@angular/core';
import { BaseComponent } from '@app/shared/components/base/base-component';

interface Timestamp {
  id: string;
  time: number; // in seconds
  label: string;
  description?: string;
}

@Component({
  selector: 'app-interactive-timestamp',
  templateUrl: './interactive-timestamp.component.html'
})
export class InteractiveTimestampComponent extends BaseComponent implements OnInit {
  @Input() timestamps: Timestamp[] = [];
  @Input() videoElement: HTMLVideoElement;

  sortedTimestamps: Timestamp[] = [];
  expandedTimestamp: string | null = null;
  
  ngOnInit(): void {
    if (this.timestamps && this.timestamps.length) {
      this.sortedTimestamps = [...this.timestamps].sort((a, b) => a.time - b.time);
    }
  }

  seekToTimestamp(time: number): void {
    if (this.videoElement) {
      this.videoElement.currentTime = time;
      this.videoElement.play();
    }
  }

  formatTime(seconds: number): string {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  }

  toggleExpand(id: string): void {
    if (this.expandedTimestamp === id) {
      this.expandedTimestamp = null;
    } else {
      this.expandedTimestamp = id;
    }
  }
}
