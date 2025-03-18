// src/app/shared/services/certificate.service.ts
import { Injectable } from '@angular/core';
import { Observable, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { HttpService } from './http.service';
import { Certificate, CertificateFilter } from '../models/certificate.model';
import { ApiResponse, PaginationInfo } from '../models/api.model';
import { environment } from '@environments/environment';

@Injectable({
  providedIn: 'root'
})
export class CertificateService extends HttpService {
  private readonly API_BASE = `${environment.apiUrl}/user/certificates`;

  /**
   * Lấy danh sách chứng chỉ của người dùng
   * Get certificates for the current user
   */
  getUserCertificates(filters?: CertificateFilter): Observable<Certificate[]> {
    let url = this.API_BASE;

    // Thêm các tham số lọc nếu có
    // Add filter parameters if present
    if (filters) {
      const params = new URLSearchParams();
      if (filters.query) params.append('query', filters.query);
      if (filters.type) params.append('type', filters.type);
      if (filters.status) params.append('status', filters.status);
      if (filters.dateRange?.start) params.append('startDate', filters.dateRange.start.toISOString());
      if (filters.dateRange?.end) params.append('endDate', filters.dateRange.end.toISOString());

      if (params.toString()) {
        url += `?${params.toString()}`;
      }
    }

    return this.get<Certificate[]>(url).pipe(
      map(response => response),
      catchError(error => {
        console.error('Error fetching certificates:', error);
        return throwError(() => new Error('Không thể tải danh sách chứng chỉ. Vui lòng thử lại sau.'));
      })
    );
  }

  /**
   * Lấy thông tin chi tiết của chứng chỉ
   * @param certificateId ID chứng chỉ
   * @returns Observable chứa thông tin chi tiết chứng chỉ
   */
  getCertificateById(certificateId: string): Observable<Certificate> {
    return this.http.get<ApiResponse<Certificate>>(`certificates/${certificateId}`).pipe(
      map(response => {
        if (!response.data) {
          throw new Error('Không tìm thấy chứng chỉ');
        }
        return response.data;
      }),
      catchError(error => {
        return throwError(() => new Error(error.error?.message || 'Không thể tải thông tin chứng chỉ'));
      })
    );
  }

  /**
   * Lấy chứng chỉ hoàn thành khóa học
   * @param courseId ID khóa học
   * @returns Observable chứa thông tin chứng chỉ
   */
  getCourseCompletionCertificate(courseId: string): Observable<Certificate> {
    return this.http.get<ApiResponse<Certificate>>(`courses/${courseId}/certificate`).pipe(
      map(response => {
        if (!response.data) {
          throw new Error('Không tìm thấy chứng chỉ');
        }
        return response.data;
      }),
      catchError(error => {
        return throwError(() => new Error(error.error?.message || 'Không thể tải chứng chỉ khóa học'));
      })
    );
  }

  /**
   * Tạo chứng chỉ mới khi hoàn thành khóa học
   * @param courseId ID khóa học
   * @returns Observable chứa thông tin chứng chỉ mới
   */
  generateCertificate(courseId: string): Observable<Certificate> {
    return this.http.post<ApiResponse<Certificate>>(`courses/${courseId}/certificate/generate`, {}).pipe(
      map(response => {
        if (!response.data) {
          throw new Error('Không thể tạo chứng chỉ');
        }
        return response.data;
      }),
      catchError(error => {
        return throwError(() => new Error(error.error?.message || 'Không thể tạo chứng chỉ'));
      })
    );
  }

  /**
   * Tải xuống chứng chỉ dưới dạng PDF
   * Download certificate as PDF
   * @param certificateId ID của chứng chỉ cần tải xuống
   */
  downloadCertificate(certificateId: string): Observable<Blob> {
    return this.getBlob(`${this.API_BASE}/${certificateId}/download`).pipe(
      catchError(error => {
        console.error('Error downloading certificate:', error);
        return throwError(() => new Error('Không thể tải xuống chứng chỉ. Vui lòng thử lại sau.'));
      })
    );
  }

  /**
   * Xác minh chứng chỉ thông qua mã xác minh
   * @param verificationCode Mã xác minh chứng chỉ
   * @returns Observable chứa thông tin chứng chỉ nếu hợp lệ
   */
  verifyCertificate(verificationCode: string): Observable<Certificate> {
    return this.http.get<ApiResponse<Certificate>>(`certificates/verify/${verificationCode}`).pipe(
      map(response => {
        if (!response.data) {
          throw new Error('Mã xác minh chứng chỉ không hợp lệ');
        }
        return response.data;
      }),
      catchError(error => {
        return throwError(() => new Error(error.error?.message || 'Không thể xác minh chứng chỉ'));
      })
    );
  }

  /**
   * Chia sẻ chứng chỉ qua email
   * Share certificate via email
   * @param certificateId ID của chứng chỉ cần chia sẻ
   * @param emails Danh sách email người nhận
   * @param message Tin nhắn tùy chọn
   */
  shareCertificate(certificateId: string, emails: string[], message?: string): Observable<void> {
    return this.post(`${this.API_BASE}/${certificateId}/share`, { emails, message }).pipe(
      catchError(error => {
        console.error('Error sharing certificate:', error);
        return throwError(() => new Error('Không thể chia sẻ chứng chỉ. Vui lòng thử lại sau.'));
      })
    );
  }

  /**
   * Xác minh tính hợp lệ của chứng chỉ
   * Verify certificate validity
   * @param credentialId Mã xác minh của chứng chỉ
   */
  verifyCertificate(credentialId: string): Observable<{ isValid: boolean; certificate?: Certificate }> {
    return this.get(`${this.API_BASE}/verify/${credentialId}`).pipe(
      catchError(error => {
        console.error('Error verifying certificate:', error);
        return throwError(() => new Error('Không thể xác minh chứng chỉ. Vui lòng thử lại sau.'));
      })
    );
  }

  /**
   * Thêm chứng chỉ vào hồ sơ LinkedIn
   * Add certificate to LinkedIn profile
   * @param certificateId ID của chứng chỉ cần thêm vào LinkedIn
   */
  addToLinkedIn(certificateId: string): Observable<{ linkedInUrl: string }> {
    return this.post(`${this.API_BASE}/${certificateId}/linkedin`, {}).pipe(
      catchError(error => {
        console.error('Error adding certificate to LinkedIn:', error);
        return throwError(() => new Error('Không thể thêm chứng chỉ vào LinkedIn. Vui lòng thử lại sau.'));
      })
    );
  }
}