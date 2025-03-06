// src/app/shared/services/theme.service.ts
import { Injectable, Renderer2, RendererFactory2 } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

type ThemeMode = 'light' | 'dark' | 'system';

@Injectable({
  providedIn: 'root'
})
export class ThemeService {
  private themeKey = 'theme_mode';
  private themeSubject = new BehaviorSubject<ThemeMode>(this.getInitialTheme());
  private renderer: Renderer2;

  constructor(private rendererFactory: RendererFactory2) {
    this.renderer = this.rendererFactory.createRenderer(null, null);
    this.applyTheme(this.themeSubject.value);

    // Lắng nghe thay đổi chủ đề hệ thống
    if (window.matchMedia) {
      window.matchMedia('(prefers-color-scheme: dark)')
        .addEventListener('change', e => {
          if (this.themeSubject.value === 'system') {
            this.updateBodyClass(e.matches ? 'dark' : 'light');
          }
        });
    }
  }

  /**
   * Lấy chủ đề hiện tại
   * @returns Observable chủ đề hiện tại
   */
  getTheme(): Observable<ThemeMode> {
    return this.themeSubject.asObservable();
  }

  /**
   * Thiết lập chủ đề mới
   * @param theme Chủ đề mới (light, dark, system)
   */
  setTheme(theme: ThemeMode): void {
    localStorage.setItem(this.themeKey, theme);
    this.themeSubject.next(theme);
    this.applyTheme(theme);
  }

  /**
   * Lấy chủ đề ban đầu từ localStorage hoặc mặc định
   * @returns Chủ đề ban đầu
   */
  private getInitialTheme(): ThemeMode {
    const savedTheme = localStorage.getItem(this.themeKey) as ThemeMode;
    return savedTheme || 'system';
  }

  /**
   * Áp dụng chủ đề vào giao diện
   * @param theme Chủ đề cần áp dụng
   */
  private applyTheme(theme: ThemeMode): void {
    if (theme === 'system') {
      const isDarkMode = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
      this.updateBodyClass(isDarkMode ? 'dark' : 'light');
    } else {
      this.updateBodyClass(theme);
    }
  }

  /**
   * Cập nhật class cho thẻ body
   * @param theme Chủ đề cần áp dụng (light, dark)
   */
  private updateBodyClass(theme: 'light' | 'dark'): void {
    if (theme === 'dark') {
      this.renderer.addClass(document.body, 'dark-theme');
      this.renderer.removeClass(document.body, 'light-theme');
    } else {
      this.renderer.addClass(document.body, 'light-theme');
      this.renderer.removeClass(document.body, 'dark-theme');
    }
  }
}