import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { BaseComponent } from '@app/shared/components/base/base-component';
import { SubscriptionService } from '@app/shared/services/subscription.service';
import { NotificationService } from '@app/shared/services/notification.service';
import { 
  Subscription, 
  SubscriptionPlan, 
  CancellationReason,
  BillingCycle,
  CancellationRequest
} from '@app/shared/models/subscription';
import { takeUntil, finalize } from 'rxjs/operators';
import { of } from 'rxjs';

@Component({
  selector: 'app-subscription-management',
  templateUrl: './subscription-management.component.html'
})
export class SubscriptionManagementComponent extends BaseComponent implements OnInit {
  // Dữ liệu đăng ký và lập kế hoạch
  currentSubscription: Subscription | null = null;
  availablePlans: SubscriptionPlan[] = [];
  cancellationReasons: CancellationReason[] = [];
  
  // Trạng thái giao diện
  isLoadingSubscription = true;
  isLoadingPlans = true;
  isProcessing = false;
  
  // Hiển thị modal
  showPlanSelectionModal = false;
  showCancellationModal = false;
  showBillingCycleModal = false;
  showPromoCodeModal = false;
  
  // Forms
  cancellationForm: FormGroup;
  billingCycleForm: FormGroup;
  promoCodeForm: FormGroup;
  
  // Dữ liệu tạm thời
  selectedPlan: SubscriptionPlan | null = null;
  selectedBillingCycle: BillingCycle = 'monthly';
  promoCodeVerified = false;
  promoCodeError = '';
  promoCodeDiscount = '';
  cancellationReason = '';

  /**
   * Khởi tạo component với các services cần thiết
   * Initialize component with required services
   * @param fb FormBuilder để tạo các forms
   * @param subscriptionService Service xử lý đăng ký
   * @param notificationService Service hiển thị thông báo
   * @param router Router để điều hướng
   */
  constructor(
    private fb: FormBuilder,
    public subscriptionService: SubscriptionService, // Changed to public to allow template binding
    private notificationService: NotificationService,
    private router: Router
  ) {
    super();
    
    // Khởi tạo form hủy đăng ký
    this.cancellationForm = this.fb.group({
      reasonId: ['', Validators.required],
      explanation: [''],
      feedback: [''],
      confirmCancel: [false, Validators.requiredTrue]
    });
    
    // Khởi tạo form chu kỳ thanh toán
    this.billingCycleForm = this.fb.group({
      billingCycle: ['monthly', Validators.required]
    });
    
    // Khởi tạo form mã giảm giá
    this.promoCodeForm = this.fb.group({
      promoCode: ['', [Validators.required, Validators.minLength(4), Validators.maxLength(20)]]
    });
    
    // Theo dõi thay đổi lý do hủy để hiển thị/ẩn trường giải thích
    this.cancellationForm.get('reasonId')?.valueChanges
      .pipe(takeUntil(this._onDestroySub))
      .subscribe(reasonId => {
        const selectedReason = this.cancellationReasons.find(r => r.id === reasonId);
        const explanationControl = this.cancellationForm.get('explanation');
        
        if (selectedReason?.requiresExplanation) {
          explanationControl?.setValidators([Validators.required, Validators.minLength(20)]);
        } else {
          explanationControl?.clearValidators();
        }
        
        explanationControl?.updateValueAndValidity();
      });
  }
  
  /**
   * Khởi tạo component và tải dữ liệu
   * Initialize component and load data
   */
  ngOnInit(): void {
    this.loadSubscriptionData();
    this.loadCancellationReasons();
  }
  
  /**
   * Tải tất cả dữ liệu cần thiết về đăng ký
   * Load all necessary subscription data
   */
  loadSubscriptionData(): void {
    this.isLoadingSubscription = true;
    this.isLoadingPlans = true;
    
    // Tải gói đăng ký hiện tại
    this.subscriptionService.getCurrentSubscription()
      .pipe(takeUntil(this._onDestroySub))
      .subscribe({
        next: (subscription) => {
          this.currentSubscription = subscription;
          this.isLoadingSubscription = false;
          
          if (subscription) {
            this.selectedBillingCycle = subscription.billingCycle;
            this.billingCycleForm.patchValue({
              billingCycle: subscription.billingCycle
            });
          }
        },
        error: (error) => {
          console.error('Không thể tải thông tin đăng ký:', error);
          this.notificationService.error('Không thể tải thông tin đăng ký. Vui lòng thử lại sau.');
          this.isLoadingSubscription = false;
        }
      });
    
    // Tải danh sách gói đăng ký có sẵn
    this.subscriptionService.getAvailablePlans()
      .pipe(takeUntil(this._onDestroySub))
      .subscribe({
        next: (plans) => {
          this.availablePlans = plans;
          this.isLoadingPlans = false;
          
          // Nếu có gói được đề xuất, chọn mặc định
          const recommendedPlan = plans.find(p => p.recommended);
          if (recommendedPlan) {
            this.selectedPlan = recommendedPlan;
          } else if (plans.length > 0) {
            this.selectedPlan = plans[0];
          }
        },
        error: (error) => {
          console.error('Không thể tải danh sách gói đăng ký:', error);
          this.notificationService.error('Không thể tải danh sách gói đăng ký. Vui lòng thử lại sau.');
          this.isLoadingPlans = false;
        }
      });
  }
  
  /**
   * Tải danh sách lý do hủy đăng ký
   * Load cancellation reasons
   */
  loadCancellationReasons(): void {
    this.subscriptionService.getCancellationReasons()
      .pipe(takeUntil(this._onDestroySub))
      .subscribe({
        next: (reasons) => {
          this.cancellationReasons = reasons;
        },
        error: (error) => {
          console.error('Không thể tải danh sách lý do hủy đăng ký:', error);
        }
      });
  }
  
  /**
   * Mở modal lựa chọn gói đăng ký
   * Open plan selection modal
   */
  openPlanSelectionModal(): void {
    this.showPlanSelectionModal = true;
  }
  
  /**
   * Mở modal hủy đăng ký
   * Open cancellation modal
   */
  openCancellationModal(): void {
    this.showCancellationModal = true;
    this.cancellationForm.reset({
      reasonId: '',
      explanation: '',
      feedback: '',
      confirmCancel: false
    });
  }
  
  /**
   * Mở modal thay đổi chu kỳ thanh toán
   * Open billing cycle change modal
   */
  openBillingCycleModal(): void {
    this.showBillingCycleModal = true;
    this.billingCycleForm.patchValue({
      billingCycle: this.currentSubscription?.billingCycle || 'monthly'
    });
  }
  
  /**
   * Mở modal nhập mã giảm giá
   * Open promo code modal
   */
  openPromoCodeModal(): void {
    this.showPromoCodeModal = true;
    this.promoCodeForm.reset();
    this.promoCodeVerified = false;
    this.promoCodeDiscount = '';
    this.promoCodeError = '';
  }
  
  /**
   * Đóng tất cả các modal
   * Close all modals
   */
  closeAllModals(): void {
    this.showPlanSelectionModal = false;
    this.showCancellationModal = false;
    this.showBillingCycleModal = false;
    this.showPromoCodeModal = false;
  }
  
  /**
   * Chọn gói đăng ký
   * Select subscription plan
   * @param plan Gói đăng ký được chọn
   */
  selectPlan(plan: SubscriptionPlan): void {
    this.selectedPlan = plan;
  }
  
  /**
   * Thay đổi chu kỳ thanh toán
   * Change billing cycle
   */
  changeBillingCycle(): void {
    if (!this.currentSubscription || !this.billingCycleForm.valid) {
      return;
    }
    
    const newCycle = this.billingCycleForm.get('billingCycle')?.value;
    
    this.isProcessing = true;
    
    this.subscriptionService.updateSubscription(this.currentSubscription.id, {
      billingCycle: newCycle
    })
      .pipe(
        takeUntil(this._onDestroySub),
        finalize(() => {
          this.isProcessing = false;
        })
      )
      .subscribe({
        next: (updatedSubscription) => {
          this.currentSubscription = updatedSubscription;
          this.closeAllModals();
          this.notificationService.success('Đã cập nhật chu kỳ thanh toán thành công.');
        },
        error: (error) => {
          console.error('Không thể cập nhật chu kỳ thanh toán:', error);
          this.notificationService.error('Không thể cập nhật chu kỳ thanh toán. Vui lòng thử lại sau.');
        }
      });
  }
  
  /**
   * Đăng ký gói mới
   * Subscribe to a new plan
   */
  subscribeToPlan(): void {
    if (!this.selectedPlan) {
      this.notificationService.warning('Vui lòng chọn gói đăng ký.');
      return;
    }
    
    this.isProcessing = true;
    
    const promoCode = this.promoCodeVerified ? this.promoCodeForm.get('promoCode')?.value : undefined;
    
    this.subscriptionService.subscribeToPlan(
      this.selectedPlan.id,
      this.selectedBillingCycle,
      promoCode
    )
      .pipe(
        takeUntil(this._onDestroySub),
        finalize(() => {
          this.isProcessing = false;
        })
      )
      .subscribe({
        next: (subscription) => {
          this.currentSubscription = subscription;
          this.closeAllModals();
          this.notificationService.success('Đăng ký gói thành công!');
        },
        error: (error) => {
          console.error('Không thể hoàn tất đăng ký:', error);
          this.notificationService.error('Không thể hoàn tất đăng ký. Vui lòng thử lại sau.');
        }
      });
  }
  
  /**
   * Nâng cấp hoặc hạ cấp gói đăng ký hiện tại
   * Upgrade or downgrade current subscription
   */
  changePlan(): void {
    if (!this.currentSubscription || !this.selectedPlan) {
      return;
    }
    
    this.isProcessing = true;
    
    this.subscriptionService.updateSubscription(this.currentSubscription.id, {
      planId: this.selectedPlan.id
    })
      .pipe(
        takeUntil(this._onDestroySub),
        finalize(() => {
          this.isProcessing = false;
        })
      )
      .subscribe({
        next: (updatedSubscription) => {
          this.currentSubscription = updatedSubscription;
          this.closeAllModals();
          this.notificationService.success('Đã thay đổi gói đăng ký thành công!');
        },
        error: (error) => {
          console.error('Không thể thay đổi gói đăng ký:', error);
          this.notificationService.error('Không thể thay đổi gói đăng ký. Vui lòng thử lại sau.');
        }
      });
  }
  
  /**
   * Hủy đăng ký hiện tại
   * Cancel current subscription
   */
  cancelSubscription(): void {
    if (!this.currentSubscription || !this.cancellationForm.valid) {
      return;
    }
    
    const { reasonId, explanation, feedback } = this.cancellationForm.value;
    
    this.isProcessing = true;
    
    const body: CancellationRequest = {
      subscriptionId: this.currentSubscription.id,
      reasonId,
      explanation,
      feedback
    }

    this.subscriptionService.cancelSubscription(body)
      .pipe(
        takeUntil(this._onDestroySub),
        finalize(() => {
          this.isProcessing = false;
        })
      )
      .subscribe({
        next: () => {
          // Cập nhật trạng thái đăng ký thành 'cancelled'
          if (this.currentSubscription) {
            this.currentSubscription.status = 'cancelled';
          }
          this.closeAllModals();
          this.notificationService.success('Đã hủy đăng ký thành công.');
        },
        error: (error) => {
          console.error('Không thể hủy đăng ký:', error);
          this.notificationService.error('Không thể hủy đăng ký. Vui lòng thử lại sau.');
        }
      });
  }
  
  /**
   * Kiểm tra mã giảm giá
   * Verify promo code
   */
  verifyPromoCode(): void {
    if (!this.promoCodeForm.valid) {
      return;
    }
    
    const promoCode = this.promoCodeForm.get('promoCode')?.value;
    
    this.isProcessing = true;
    
    this.subscriptionService.validatePromoCode(promoCode)
      .pipe(
        takeUntil(this._onDestroySub),
        finalize(() => {
          this.isProcessing = false;
        })
      )
      .subscribe({
        next: (data) => {
          this.promoCodeVerified = data.valid;
          this.promoCodeError = '';
          
          if(data.valid) {
            if (data.type === 'percentage') {
              this.promoCodeDiscount = `Giảm ${data.discount}% cho đơn hàng của bạn`;
            } else {
              this.promoCodeDiscount = `Giảm ${data.discount.toLocaleString('vi-VN')}đ cho đơn hàng của bạn`;
            }
          } else {
            this.promoCodeError = data.message || 'Mã giảm giá không hợp lệ hoặc đã hết hạn.';
          }
        },
        error: (error) => {
          console.error('Mã giảm giá không hợp lệ:', error);
          this.promoCodeVerified = false;
          this.promoCodeError = 'Mã giảm giá không hợp lệ hoặc đã hết hạn.';
        }
      });
  }
  
  /**
   * Áp dụng mã giảm giá
   * Apply promo code
   */
  applyPromoCode(): void {
    if (!this.currentSubscription || !this.promoCodeVerified) {
      return;
    }
    
    const promoCode = this.promoCodeForm.get('promoCode')?.value;
    
    this.isProcessing = true;
    
    this.subscriptionService.updateSubscription(this.currentSubscription.id, {
      promoCode
    })
      .pipe(
        takeUntil(this._onDestroySub),
        finalize(() => {
          this.isProcessing = false;
        })
      )
      .subscribe({
        next: (updatedSubscription) => {
          this.currentSubscription = updatedSubscription;
          this.closeAllModals();
          this.notificationService.success('Đã áp dụng mã giảm giá thành công!');
        },
        error: (error) => {
          console.error('Không thể áp dụng mã giảm giá:', error);
          this.promoCodeVerified = false;
          this.promoCodeError = 'Mã giảm giá không hợp lệ. Vui lòng thử lại.';
        }
      });
  }
  
  /**
   * Tính giá dựa trên chu kỳ thanh toán
   * Calculate price based on billing cycle
   * @param plan Gói đăng ký để tính giá
   * @param cycle Chu kỳ thanh toán
   * @returns Giá theo chu kỳ đã chọn
   */
  calculatePrice(plan: SubscriptionPlan, cycle: BillingCycle): number {
    if (cycle === 'monthly') {
      return plan.monthlyPrice;
    } else if (cycle === 'quarterly') {
      return plan.monthlyPrice * 3 * 0.9; // 10% discount
    } else {
      return plan.annualPrice; // Annual price is already discounted
    }
  }
  
  /**
   * Tiến hành thanh toán và đăng ký
   * Proceed to checkout and subscription
   */
  proceedToCheckout(): void {
    if (!this.selectedPlan) {
      this.notificationService.warning('Vui lòng chọn gói đăng ký.');
      return;
    }
    
    // Nếu đã có đăng ký, thay đổi gói
    if (this.currentSubscription) {
      this.changePlan();
    } else {
      // Nếu chưa có đăng ký, đăng ký mới
      this.subscribeToPlan();
    }
  }
  
  /**
   * Định dạng giá thành chuỗi có định dạng tiền tệ
   * Format price to currency string
   * @param price Giá cần định dạng
   * @returns Chuỗi đã định dạng
   */
  formatPrice(price: number): string {
    return price.toLocaleString('vi-VN') + ' VNĐ';
  }
}
