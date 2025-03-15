import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'app-speed-control',
  templateUrl: './speed-control.component.html'
})
export class SpeedControlComponent {
  @Input() currentSpeed = 1;
  @Output() speedChanged = new EventEmitter<number>();
  
  isDropdownOpen = false;
  speedOptions = [0.5, 0.75, 1, 1.25, 1.5, 1.75, 2];
  
  toggleDropdown(): void {
    this.isDropdownOpen = !this.isDropdownOpen;
  }
  
  selectSpeed(speed: number): void {
    this.currentSpeed = speed;
    this.speedChanged.emit(speed);
    this.isDropdownOpen = false;
  }
}
