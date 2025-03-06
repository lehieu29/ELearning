// src/app/shared/services/certificate.service.ts
import { Injectable } from '@angular/core';
import { Observable, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { HttpService } from './http.service';
import { Certificate } from '../models/certificate.model';
import { ApiResponse, PaginationInfo } from '../models/api.model';

@Injectable({
  providedIn: 'root'
})
export class CertificateService {
  constructor(private http: HttpService) { }

  /**
   * Lấy danh sách chứng chỉ của người dùng
   * @param page Trang hiện tại
   * @param limit Số lượng mục mỗi trang
   * @returns Observable chứa danh sách chứng chỉ và thông tin phân trang
   */
  getUserCertificates(page: number = 1, limit: number = 10): Observable<{ certificates: Certificate[], pagination: PaginationInfo }> {
    return this.http.get<ApiResponse<Certificate[]>>(`user/certificates?page=${page}&limit=${limit}`).pipe(
      map(response => {
        return {
          certificates: response.data || [],
          pagination: response.pagination || {
            currentPage: 1,
            totalPages: 1,
            pageSize: 10,
            totalItems: response.data?.length || 0,
            hasNextPage: false,
            hasPreviousPage: false
          }
        };
      }),
      catchError(error => {
        return throwError(() => new Error(error.error?.message || 'Không thể tải danh sách chứng chỉ'));
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
   * Tải xuống chứng chỉ dạng PDF
   * @param certificateId ID chứng chỉ
   * @returns Observable chứa dữ liệu Blob của file PDF
   */
  downloadCertificate(certificateId: string): Observable<Blob> {
    return this.http.get<Blob>(`certificates/${certificateId}/download`, {
      responseType: 'blob' as 'json'
    }).pipe(
      catchError(error => {
        return throwError(() => new Error('Không thể tải xuống chứng chỉ'));
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
}