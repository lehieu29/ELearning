import { Injectable } from '@angular/core';
import { Subject, Observable } from 'rxjs';

export interface Toast {
  id: number;
  message: string;
  type: 'success' | 'error' | 'info' | 'warning';
  title?: string;
  duration?: number;
  data?: any;
}

@Injectable({
  providedIn: 'root'
})
export class ToastService {
  private toasts: Toast[] = [];
  private toastsSubject = new Subject<Toast[]>();
  private toastCounter = 0;

  public toasts$ = this.toastsSubject.asObservable();

  constructor() { }

  /**
   * Lấy danh sách toast thông báo hiện tại
   * @returns Observable chứa danh sách toast
   */
  getToasts(): Observable<Toast[]> {
    return this.toasts$;
  }

  /**
   * Hiển thị toast thông báo
   * @param message Nội dung thông báo
   * @param type Loại thông báo (success, error, info, warning)
   * @param title Tiêu đề thông báo (tùy chọn)
   * @param duration Thời gian hiển thị (ms)
   * @param data Dữ liệu bổ sung (tùy chọn)
   * @returns Đối tượng toast vừa tạo
   */
  show(message: string, type: 'success' | 'error' | 'info' | 'warning' = 'info', title?: string, duration: number = 5000, data?: any): Toast {
    const id = ++this.toastCounter;

    const toast: Toast = {
      id,
      message,
      type,
      title,
      duration,
      data
    };

    this.toasts.push(toast);
    this.toastsSubject.next([...this.toasts]);

    if (duration > 0) {
      setTimeout(() => {
        this.remove(id);
      }, duration);
    }

    return toast;
  }

  /**
   * Hiển thị toast thành công
   * @param message Nội dung thông báo
   * @param title Tiêu đề thông báo (tùy chọn)
   * @param duration Thời gian hiển thị (ms)
   * @param data Dữ liệu bổ sung (tùy chọn)
   * @returns Đối tượng toast vừa tạo
   */
  success(message: string, title?: string, duration?: number, data?: any): Toast {
    return this.show(message, 'success', title, duration, data);
  }

  /**
   * Hiển thị toast lỗi
   * @param message Nội dung thông báo
   * @param title Tiêu đề thông báo (tùy chọn)
   * @param duration Thời gian hiển thị (ms)
   * @param data Dữ liệu bổ sung (tùy chọn)
   * @returns Đối tượng toast vừa tạo
   */
  error(message: string, title?: string, duration?: number, data?: any): Toast {
    return this.show(message, 'error', title, duration, data);
  }

  /**
   * Hiển thị toast thông tin
   * @param message Nội dung thông báo
   * @param title Tiêu đề thông báo (tùy chọn)
   * @param duration Thời gian hiển thị (ms)
   * @param data Dữ liệu bổ sung (tùy chọn)
   * @returns Đối tượng toast vừa tạo
   */
  info(message: string, title?: string, duration?: number, data?: any): Toast {
    return this.show(message, 'info', title, duration, data);
  }

  /**
   * Hiển thị toast cảnh báo
   * @param message Nội dung thông báo
   * @param title Tiêu đề thông báo (tùy chọn)
   * @param duration Thời gian hiển thị (ms)
   * @param data Dữ liệu bổ sung (tùy chọn)
   * @returns Đối tượng toast vừa tạo
   */
  warning(message: string, title?: string, duration?: number, data?: any): Toast {
    return this.show(message, 'warning', title, duration, data);
  }

  /**
   * Xóa toast theo ID
   * @param id ID của toast cần xóa
   */
  remove(id: number): void {
    this.toasts = this.toasts.filter(toast => toast.id !== id);
    this.toastsSubject.next([...this.toasts]);
  }

  /**
   * Xóa tất cả toast
   */
  clear(): void {
    this.toasts = [];
    this.toastsSubject.next([]);
  }
}