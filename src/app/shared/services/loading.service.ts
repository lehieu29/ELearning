import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class LoadingService {
  private loadingSubject = new BehaviorSubject<boolean>(false);
  private loadingMap = new Map<string, boolean>();

  public loading$ = this.loadingSubject.asObservable();

  constructor() { }

  /**
   * Thiết lập trạng thái loading chung
   * @param loading Trạng thái loading (true/false)
   */
  setLoading(loading: boolean): void {
    this.loadingSubject.next(loading);
  }

  /**
   * Bắt đầu loading cho một khóa cụ thể
   * @param key Khóa định danh cho loading (mặc định là 'global')
   */
  startLoading(key: string = 'global'): void {
    this.loadingMap.set(key, true);
    this.updateLoadingState();
  }

  /**
   * Kết thúc loading cho một khóa cụ thể
   * @param key Khóa định danh cho loading (mặc định là 'global')
   */
  stopLoading(key: string = 'global'): void {
    this.loadingMap.set(key, false);
    this.updateLoadingState();
  }

  /**
   * Kiểm tra trạng thái loading của một khóa
   * @param key Khóa định danh cần kiểm tra
   * @returns Trạng thái loading (true/false)
   */
  isLoading(key: string = 'global'): boolean {
    return this.loadingMap.get(key) || false;
  }

  /**
   * Lấy Observable của trạng thái loading
   * @returns Observable trạng thái loading
   */
  getLoadingState(): Observable<boolean> {
    return this.loading$;
  }

  /**
   * Cập nhật trạng thái loading chung dựa trên tất cả các khóa
   */
  private updateLoadingState(): void {
    let loading = false;
    this.loadingMap.forEach(value => {
      if (value) loading = true;
    });
    this.loadingSubject.next(loading);
  }
}