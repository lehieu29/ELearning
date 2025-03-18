import { Component, Input, Output, EventEmitter } from '@angular/core';
import { BaseComponent } from '@app/shared/components/base/base-component';

@Component({
  selector: 'app-speed-control',
  templateUrl: './speed-control.component.html'
})
export class SpeedControlComponent extends BaseComponent {
  @Input() currentSpeed: number = 1;
  @Output() speedChanged = new EventEmitter<number>();
  
  isDropdownOpen: boolean = false;
  
  // Available playback speeds
  speeds: number[] = [0.25, 0.5, 0.75, 1, 1.25, 1.5, 1.75, 2];
  
  /**
   * Chuyển đổi hiển thị/ẩn menu tốc độ phát
   * Toggle speed menu dropdown visibility
   */
  toggleDropdown(): void {
    this.isDropdownOpen = !this.isDropdownOpen;
  }
  
  /**
   * Chọn tốc độ phát lại mới và thông báo ra ngoài
   * Select a new playback speed and emit the change
   * @param speed Tốc độ phát lại mới / New playback speed
   */
  selectSpeed(speed: number): void {
    if (this.currentSpeed !== speed) {
      this.currentSpeed = speed;
      this.speedChanged.emit(speed);
    }
    this.isDropdownOpen = false;
  }
  
  /**
   * Định dạng hiển thị giá trị tốc độ
   * Format the speed value for display
   * @param speed Tốc độ cần định dạng / Speed to format
   * @returns Chuỗi hiển thị tốc độ / Speed display string
   */
  formatSpeed(speed: number): string {
    return speed === 1 ? 'Normal' : `${speed}x`;
  }
  
  /**
   * Đóng dropdown khi người dùng click ra ngoài
   * Close dropdown when user clicks outside
   */
  closeDropdown(): void {
    this.isDropdownOpen = false;
  }
}
