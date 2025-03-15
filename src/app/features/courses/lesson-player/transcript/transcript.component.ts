import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';

@Component({
  selector: 'app-transcript',
  templateUrl: './transcript.component.html'
})
export class TranscriptComponent implements OnChanges {
  @Input() text: string;
  @Input() timestamps: { time: number; text: string }[] = [];
  
  formattedTranscript: string[];
  showTimestamps: boolean = true;
  
  ngOnChanges(changes: SimpleChanges): void {
    if (changes.text) {
      this.formatTranscript();
    }
  }
  
  formatTranscript(): void {
    if (!this.text) {
      this.formattedTranscript = [];
      return;
    }
    
    // Simple formatting - split by paragraphs
    this.formattedTranscript = this.text.split('\n').filter(line => line.trim() !== '');
  }
  
  toggleTimestamps(): void {
    this.showTimestamps = !this.showTimestamps;
  }
}
