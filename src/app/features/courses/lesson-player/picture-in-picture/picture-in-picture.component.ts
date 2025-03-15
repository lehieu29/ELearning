import { Component, Input, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-picture-in-picture',
  templateUrl: './picture-in-picture.component.html'
})
export class PictureInPictureComponent {
  @Input() isActive: boolean = false;
  @Output() togglePiP = new EventEmitter<void>();
  
  isPipSupported: boolean = document.pictureInPictureEnabled !== undefined && document.pictureInPictureEnabled;
  
  onToggle(): void {
    if (this.isPipSupported) {
      this.togglePiP.emit();
    }
  }
}
