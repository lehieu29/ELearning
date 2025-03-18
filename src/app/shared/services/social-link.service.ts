import { Injectable } from '@angular/core';
import { Observable, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { HttpService } from './http.service';
import { environment } from '@environments/environment';
import { SocialLink, SocialPlatform, SocialLinkStats, ConnectResponse } from '../models/social-link.model';

@Injectable({
  providedIn: 'root'
})
export class SocialLinksService extends HttpService {
  private readonly API_BASE = `${environment.apiUrl}/user/social-links`;
  
  /**
   * Lấy danh sách tất cả các liên kết mạng xã hội của người dùng
   * Get all social links for the current user
   */
  getUserSocialLinks(): Observable<SocialLink[]> {
    return this.get<SocialLink[]>(this.API_BASE).pipe(
      map(response => 
        response.map(link => ({
          ...link,
          connectedDate: link.connectedDate ? new Date(link.connectedDate) : undefined,
          lastUpdated: link.lastUpdated ? new Date(link.lastUpdated) : undefined
        }))
      ),
      catchError(error => {
        console.error('Error fetching social links:', error);
        return throwError(() => new Error('Không thể tải liên kết mạng xã hội. Vui lòng thử lại sau.'));
      })
    );
  }
  
  /**
   * Cập nhật thông tin liên kết mạng xã hội
   * Update a social link's information
   * @param link Đối tượng liên kết mạng xã hội cần cập nhật
   */
  updateSocialLink(link: SocialLink): Observable<SocialLink> {
    return this.put<SocialLink>(`${this.API_BASE}/${link.id}`, link).pipe(
      catchError(error => {
        console.error('Error updating social link:', error);
        return throwError(() => new Error('Không thể cập nhật liên kết mạng xã hội. Vui lòng thử lại sau.'));
      })
    );
  }
  
  /**
   * Thêm liên kết mạng xã hội mới cho người dùng
   * Add a new social link for the user
   * @param link Thông tin liên kết mạng xã hội mới
   */
  addSocialLink(link: SocialLink): Observable<SocialLink> {
    return this.post<SocialLink>(this.API_BASE, link).pipe(
      catchError(error => {
        console.error('Error adding social link:', error);
        return throwError(() => new Error('Không thể thêm liên kết mạng xã hội. Vui lòng thử lại sau.'));
      })
    );
  }
  
  /**
   * Xóa liên kết mạng xã hội
   * Delete a social link
   * @param linkId ID của liên kết cần xóa
   */
  deleteSocialLink(linkId: string): Observable<void> {
    return this.delete<void>(`${this.API_BASE}/${linkId}`).pipe(
      catchError(error => {
        console.error('Error deleting social link:', error);
        return throwError(() => new Error('Không thể xóa liên kết mạng xã hội. Vui lòng thử lại sau.'));
      })
    );
  }
  
  /**
   * Kết nối với nền tảng mạng xã hội qua OAuth
   * Connect to a social platform via OAuth
   * @param platform Nền tảng mạng xã hội cần kết nối
   */
  connectSocialPlatform(platform: SocialPlatform): Observable<ConnectResponse> {
    return this.post<ConnectResponse>(`${this.API_BASE}/connect/${platform}`, {}).pipe(
      catchError(error => {
        console.error(`Error connecting to ${platform}:`, error);
        return throwError(() => new Error(`Không thể kết nối với ${platform}. Vui lòng thử lại sau.`));
      })
    );
  }
  
  /**
   * Ngắt kết nối với nền tảng mạng xã hội
   * Disconnect from a social platform
   * @param platform Nền tảng mạng xã hội cần ngắt kết nối
   */
  disconnectSocialPlatform(platform: SocialPlatform): Observable<boolean> {
    return this.post<boolean>(`${this.API_BASE}/disconnect/${platform}`, {}).pipe(
      catchError(error => {
        console.error(`Error disconnecting from ${platform}:`, error);
        return throwError(() => new Error(`Không thể ngắt kết nối với ${platform}. Vui lòng thử lại sau.`));
      })
    );
  }
  
  /**
   * Lấy thống kê về liên kết mạng xã hội của người dùng
   * Get statistics about user's social links
   */
  getSocialLinkStats(): Observable<SocialLinkStats> {
    return this.get<SocialLinkStats>(`${this.API_BASE}/stats`).pipe(
      catchError(error => {
        console.error('Error fetching social link stats:', error);
        return throwError(() => new Error('Không thể tải thống kê liên kết mạng xã hội. Vui lòng thử lại sau.'));
      })
    );
  }
  
  /**
   * Cập nhật quyền riêng tư của liên kết mạng xã hội
   * Update privacy settings for a social link
   * @param linkId ID của liên kết cần cập nhật
   * @param visibility Chế độ hiển thị mới
   */
  updateLinkVisibility(linkId: string, visibility: 'public' | 'private' | 'connections'): Observable<SocialLink> {
    return this.patch<SocialLink>(`${this.API_BASE}/${linkId}/visibility`, { visibility }).pipe(
      catchError(error => {
        console.error('Error updating link visibility:', error);
        return throwError(() => new Error('Không thể cập nhật quyền riêng tư liên kết. Vui lòng thử lại sau.'));
      })
    );
  }
  
  /**
   * Đồng bộ thông tin liên kết mạng xã hội từ nền tảng
   * Sync social link information from the platform
   * @param linkId ID của liên kết cần đồng bộ
   */
  syncSocialLinkInfo(linkId: string): Observable<SocialLink> {
    return this.post<SocialLink>(`${this.API_BASE}/${linkId}/sync`, {}).pipe(
      catchError(error => {
        console.error('Error syncing social link info:', error);
        return throwError(() => new Error('Không thể đồng bộ thông tin liên kết. Vui lòng thử lại sau.'));
      })
    );
  }
}
