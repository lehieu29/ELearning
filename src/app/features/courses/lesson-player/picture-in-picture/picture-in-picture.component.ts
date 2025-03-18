import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { BaseComponent } from '@app/shared/components/base/base-component';
import { NotificationService } from '@app/shared/services/notification.service';

@Component({
  selector: 'app-picture-in-picture',
  templateUrl: './picture-in-picture.component.html'
})
export class PictureInPictureComponent extends BaseComponent implements OnInit {
  @Input() isActive: boolean = false;
  @Input() videoElement: HTMLVideoElement;
  @Output() togglePiP = new EventEmitter<void>();
  @Output() pipStatusChange = new EventEmitter<boolean>();
  
  isPipSupported: boolean = false;
  errorMessage: string = '';
  
  constructor(private notificationService: NotificationService) {
    super();
  }
  
  /**
   * Khởi tạo component và kiểm tra hỗ trợ PiP
   * Initialize component and check PiP support
   */
  ngOnInit(): void {
    this.checkPictureInPictureSupport();
  }

  /**
   * Kiểm tra trình duyệt có hỗ trợ chức năng hình trong hình không
   * Check if browser supports Picture-in-Picture
   */
  checkPictureInPictureSupport(): void {
    // Kiểm tra chức năng PiP có được hỗ trợ không
    // Check if PiP is supported
    if (document.pictureInPictureEnabled !== undefined) {
      this.isPipSupported = document.pictureInPictureEnabled;
    } else {
      this.isPipSupported = false;
      this.errorMessage = 'Trình duyệt của bạn không hỗ trợ chức năng hình trong hình.';
    }
  }
  
  /**
   * Xử lý khi người dùng nhấp vào nút PiP
   * Handle when user clicks the PiP button
   */
  onToggle(): void {
    if (!this.isPipSupported) {
      this.notificationService.error('Trình duyệt của bạn không hỗ trợ chức năng hình trong hình.');
      return;
    }
    
    if (!this.videoElement) {
      this.notificationService.error('Không thể tìm thấy phần tử video.');
      return;
    }
    
    this.togglePiP.emit();
    
    // Attempt to handle PiP directly if needed
    this.handlePictureInPicture();
  }
  
  /**
   * Xử lý việc bật/tắt chế độ hình trong hình trực tiếp
   * Handle enabling/disabling Picture-in-Picture mode directly
   */
  handlePictureInPicture(): void {
    try {
      if (!this.videoElement) return;
      
      if (document.pictureInPictureElement === this.videoElement) {
        document.exitPictureInPicture()
          .then(() => {
            this.isActive = false;
            this.pipStatusChange.emit(false);
          })
          .catch(error => {
            console.error('Lỗi khi thoát chế độ hình trong hình:', error);
            this.notificationService.error('Không thể thoát chế độ hình trong hình.');
          });
      } else {
        if (this.videoElement.readyState >= 2) { // HAVE_CURRENT_DATA or better
          this.videoElement.requestPictureInPicture()
            .then(() => {
              this.isActive = true;
              this.pipStatusChange.emit(true);
              
              // Monitor when user exits PiP mode via browser controls
              this.videoElement.addEventListener('leavepictureinpicture', () => {
                this.isActive = false;
                this.pipStatusChange.emit(false);
              });
            })
            .catch(error => {
              console.error('Lỗi khi bật chế độ hình trong hình:', error);
              this.notificationService.error('Không thể bật chế độ hình trong hình.');
            });
        } else {
          this.notificationService.warning('Video chưa sẵn sàng. Vui lòng đợi video tải xong.');
        }
      }
    } catch (error) {
      console.error('Lỗi xử lý hình trong hình:', error);
      this.notificationService.error('Đã xảy ra lỗi khi xử lý chế độ hình trong hình.');
    }
  }
  
  /**
   * Kiểm tra xem chế độ PiP có đang hoạt động không
   * Check if PiP mode is currently active
   * @returns true nếu đang ở chế độ PiP
   */
  isPictureInPictureActive(): boolean {
    return document.pictureInPictureElement === this.videoElement;
  }
}
