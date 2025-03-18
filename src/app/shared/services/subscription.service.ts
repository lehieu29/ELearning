import { Injectable } from '@angular/core';
import { Observable, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { HttpService } from './http.service';
import { environment } from '@environments/environment';
import { 
  Subscription, 
  SubscriptionPlan, 
  BillingHistory,
  SubscriptionUpdateOptions,
  CancellationReason,
  CancellationRequest
} from '@app/shared/models/subscription.model';

@Injectable({
  providedIn: 'root'
})
export class SubscriptionService extends HttpService {
  private readonly API_BASE = `${environment.apiUrl}/users/subscriptions`;

  /**
   * Lấy thông tin về gói đăng ký hiện tại của người dùng
   * Get the current user's subscription information
   * @returns Observable chứa thông tin về gói đăng ký
   */
  getCurrentSubscription(): Observable<Subscription | null> {
    return this.get<Subscription>(`${this.API_BASE}/current`)
      .pipe(
        catchError(error => {
          // 404 means no subscription exists
          if (error.status === 404) {
            return new Observable<null>(observer => {
              observer.next(null);
              observer.complete();
            });
          }
          console.error('Error getting current subscription:', error);
          return throwError(() => new Error('Không thể tải thông tin gói đăng ký. Vui lòng thử lại sau.'));
        })
      );
  }

  /**
   * Lấy danh sách tất cả các gói đăng ký có sẵn
   * Get a list of all available subscription plans
   * @returns Observable chứa danh sách các gói đăng ký
   */
  getAvailablePlans(): Observable<SubscriptionPlan[]> {
    return this.get<SubscriptionPlan[]>(`${environment.apiUrl}/subscription-plans`)
      .pipe(
        catchError(error => {
          console.error('Error loading subscription plans:', error);
          return throwError(() => new Error('Không thể tải danh sách gói đăng ký. Vui lòng thử lại sau.'));
        })
      );
  }

  /**
   * Lấy lịch sử thanh toán của người dùng
   * Get the user's billing history
   * @param limit Số lượng bản ghi tối đa cần lấy
   * @param offset Vị trí bắt đầu lấy dữ liệu
   * @returns Observable chứa lịch sử thanh toán
   */
  getBillingHistory(limit: number = 10, offset: number = 0): Observable<BillingHistory[]> {
    const params = { limit: limit.toString(), offset: offset.toString() };
    return this.get<BillingHistory[]>(`${this.API_BASE}/billing-history`, { params })
      .pipe(
        catchError(error => {
          console.error('Error loading billing history:', error);
          return throwError(() => new Error('Không thể tải lịch sử thanh toán. Vui lòng thử lại sau.'));
        })
      );
  }

  /**
   * Đăng ký gói mới
   * Subscribe to a new plan
   * @param planId ID của gói đăng ký
   * @param billingCycle Chu kỳ thanh toán (monthly, annual)
   * @param paymentMethodId ID của phương thức thanh toán
   * @param promoCode Mã khuyến mãi (nếu có)
   * @returns Observable chứa thông tin gói đăng ký mới
   */
  subscribeToPlan(
    planId: string, 
    billingCycle: 'monthly' | 'annual' | 'quarterly', 
    paymentMethodId: string, 
    promoCode?: string
  ): Observable<Subscription> {
    return this.post<Subscription>(`${this.API_BASE}`, {
      planId,
      billingCycle,
      paymentMethodId,
      promoCode
    }).pipe(
      catchError(error => {
        console.error('Error subscribing to plan:', error);
        return throwError(() => new Error('Không thể đăng ký gói. Vui lòng thử lại sau.'));
      })
    );
  }

  /**
   * Cập nhật gói đăng ký hiện tại
   * Update the current subscription
   * @param subscriptionId ID của gói đăng ký cần cập nhật
   * @param options Các thông số cần cập nhật
   * @returns Observable chứa thông tin gói đăng ký đã cập nhật
   */
  updateSubscription(subscriptionId: string, options: SubscriptionUpdateOptions): Observable<Subscription> {
    return this.patch<Subscription>(`${this.API_BASE}/${subscriptionId}`, options)
      .pipe(
        catchError(error => {
          console.error('Error updating subscription:', error);
          return throwError(() => new Error('Không thể cập nhật gói đăng ký. Vui lòng thử lại sau.'));
        })
      );
  }

  /**
   * Hủy gói đăng ký hiện tại
   * Cancel the current subscription
   * @param request Thông tin yêu cầu hủy đăng ký
   * @returns Observable chứa thông tin gói đăng ký đã hủy
   */
  cancelSubscription(request: CancellationRequest): Observable<Subscription> {
    return this.post<Subscription>(`${this.API_BASE}/${request.subscriptionId}/cancel`, request)
      .pipe(
        catchError(error => {
          console.error('Error cancelling subscription:', error);
          return throwError(() => new Error('Không thể hủy gói đăng ký. Vui lòng thử lại sau.'));
        })
      );
  }

  /**
   * Lấy danh sách các lý do hủy đăng ký
   * Get list of cancellation reasons
   * @returns Observable chứa danh sách các lý do hủy đăng ký
   */
  getCancellationReasons(): Observable<CancellationReason[]> {
    return this.get<CancellationReason[]>(`${environment.apiUrl}/cancellation-reasons`)
      .pipe(
        catchError(error => {
          console.error('Error loading cancellation reasons:', error);
          return throwError(() => new Error('Không thể tải danh sách lý do hủy đăng ký. Vui lòng thử lại sau.'));
        })
      );
  }

  /**
   * Áp dụng mã giảm giá cho gói đăng ký
   * Apply promo code to subscription
   * @param subscriptionId ID của gói đăng ký
   * @param promoCode Mã giảm giá
   * @returns Observable chứa thông tin về mã giảm giá đã áp dụng
   */
  applyPromoCode(subscriptionId: string, promoCode: string): Observable<{ discount: number, message: string }> {
    return this.post<{ discount: number, message: string }>(
      `${this.API_BASE}/${subscriptionId}/promo`, 
      { code: promoCode }
    ).pipe(
      catchError(error => {
        console.error('Error applying promo code:', error);
        if (error.status === 404) {
          return throwError(() => new Error('Mã khuyến mãi không hợp lệ hoặc đã hết hạn.'));
        }
        return throwError(() => new Error('Không thể áp dụng mã khuyến mãi. Vui lòng thử lại sau.'));
      })
    );
  }

  /**
   * Bật/tắt tự động gia hạn gói đăng ký
   * Toggle subscription auto-renewal
   * @param subscriptionId ID của gói đăng ký
   * @param autoRenew Trạng thái tự động gia hạn
   * @returns Observable chứa thông tin gói đăng ký đã cập nhật
   */
  toggleAutoRenewal(subscriptionId: string, autoRenew: boolean): Observable<Subscription> {
    return this.patch<Subscription>(`${this.API_BASE}/${subscriptionId}`, { autoRenew })
      .pipe(
        catchError(error => {
          console.error('Error toggling auto-renewal:', error);
          return throwError(() => new Error('Không thể cập nhật cài đặt tự động gia hạn. Vui lòng thử lại sau.'));
        })
      );
  }

  /**
   * Lấy hóa đơn dưới dạng PDF
   * Get invoice as PDF
   * @param invoiceId ID của hóa đơn
   * @returns Observable chứa dữ liệu hóa đơn dạng blob
   */
  getInvoicePdf(invoiceId: string): Observable<Blob> {
    return this.getBlob(`${this.API_BASE}/invoices/${invoiceId}/pdf`)
      .pipe(
        catchError(error => {
          console.error('Error downloading invoice:', error);
          return throwError(() => new Error('Không thể tải hóa đơn. Vui lòng thử lại sau.'));
        })
      );
  }

  /**
   * Kiểm tra khả năng nâng cấp hoặc hạ cấp gói đăng ký
   * Check options for upgrading or downgrading subscription
   * @param subscriptionId ID của gói đăng ký
   * @returns Observable chứa thông tin về các gói có thể chuyển đổi
   */
  getUpgradeOptions(subscriptionId: string): Observable<{
    upgrades: SubscriptionPlan[],
    downgrades: SubscriptionPlan[],
    currentPlan: SubscriptionPlan,
    prorationDetails: { date: string, credits: number }
  }> {
    return this.get(`${this.API_BASE}/${subscriptionId}/upgrade-options`)
      .pipe(
        catchError(error => {
          console.error('Error fetching upgrade options:', error);
          return throwError(() => new Error('Không thể tải thông tin nâng cấp gói. Vui lòng thử lại sau.'));
        })
      );
  }

  /**
   * Kiểm tra xem mã giảm giá có hợp lệ không và lấy thông tin chi tiết
   * Validate promo code and get details
   * @param promoCode Mã giảm giá cần kiểm tra
   * @returns Observable chứa thông tin mã giảm giá
   */
  validatePromoCode(promoCode: string): Observable<{
    valid: boolean,
    discount?: number,
    type?: 'percentage' | 'fixed',
    message?: string,
    expiryDate?: string
  }> {
    return this.get(`${environment.apiUrl}/promo-codes/${promoCode}/validate`)
      .pipe(
        catchError(error => {
          if (error.status === 404) {
            return new Observable(observer => {
              observer.next({ valid: false, message: 'Mã khuyến mãi không tồn tại' });
              observer.complete();
            });
          }
          console.error('Error validating promo code:', error);
          return throwError(() => new Error('Không thể xác minh mã khuyến mãi. Vui lòng thử lại sau.'));
        })
      );
  }
}
