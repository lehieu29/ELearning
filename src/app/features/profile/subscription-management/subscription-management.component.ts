import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { BaseComponent } from '@app/shared/components/base/base-component';
import { SubscriptionService } from '@app/shared/services/subscription.service';
import { PaymentService } from '@app/shared/services/payment.service';
import { NotificationService } from '@app/shared/services/notification.service';
import { 
  Subscription, 
  SubscriptionPlan, 
  BillingHistory,
  CancellationReason,
  BillingCycle
} from '@app/shared/models/subscription.model';
import { PaymentMethod } from '@app/shared/models/payment.model';
import { takeUntil, finalize, catchError } from 'rxjs/operators';
import { forkJoin, of } from 'rxjs';
import * as dayjs from 'dayjs';

@Component({
  selector: 'app-subscription-management',
  templateUrl: './subscription-management.component.html'
})
export class SubscriptionManagementComponent extends BaseComponent implements OnInit {
  // Dữ liệu đăng ký và thanh toán
  currentSubscription: Subscription | null = null;
  availablePlans: SubscriptionPlan[] = [];
  billingHistory: BillingHistory[] = [];
  paymentMethods: PaymentMethod[] = [];
  cancellationReasons: CancellationReason[] = [];
  
  // Trạng thái giao diện
  isLoadingSubscription = true;
  isLoadingPlans = true;
  isLoadingBillingHistory = true;
  isLoadingPaymentMethods = true;
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
  selectedPaymentMethod: string | null = null;
  promoCodeDiscount: number | null = null;
  promoCodeValid = false;
  promoCodeMessage = '';
  
  // Pagination for billing history
  currentPage = 1;
  itemsPerPage = 5;
  totalItems = 0;
  
  /**
   * Khởi tạo component với các services cần thiết
   * Initialize component with required services
   * @param fb FormBuilder để tạo các forms
   * @param subscriptionService Service xử lý đăng ký
   * @param paymentService Service xử lý thanh toán
   * @param notificationService Service hiển thị thông báo
   * @param router Router để điều hướng
   */
  constructor(
    private fb: FormBuilder,
    private subscriptionService: SubscriptionService,
    private paymentService: PaymentService,
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
    this.isLoadingBillingHistory = true;
    this.isLoadingPaymentMethods = true;
    
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
            
            // Tải lịch sử thanh toán nếu có đăng ký
            this.loadBillingHistory();
          }
        },
        error: (error) => {
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
        },
        error: (error) => {
          this.notificationService.error('Không thể tải danh sách gói đăng ký. Vui lòng thử lại sau.');
          this.isLoadingPlans = false;
        }
      });
    
    // Tải danh sách phương thức thanh toán
    this.paymentService.getPaymentMethods()
      .pipe(takeUntil(this._onDestroySub))
      .subscribe({
        next: (methods) => {
          this.paymentMethods = methods;
          
          // Chọn phương thức thanh toán mặc định hoặc phương thức đầu tiên
          const defaultMethod = methods.find(m => m.isDefault) || methods[0];
          if (defaultMethod) {
            this.selectedPaymentMethod = defaultMethod.id;
          }
          
          this.isLoadingPaymentMethods = false;
        },
        error: (error) => {
          this.notificationService.error('Không thể tải danh sách phương thức thanh toán. Vui lòng thử lại sau.');
          this.isLoadingPaymentMethods = false;
        }
      });
  }
  
  /**
   * Tải lịch sử thanh toán
   * Load billing history
   */
  loadBillingHistory(): void {
    this.isLoadingBillingHistory = true;
    
    const offset = (this.currentPage - 1) * this.itemsPerPage;
    
    this.subscriptionService.getBillingHistory(this.itemsPerPage, offset)
      .pipe(takeUntil(this._onDestroySub))
      .subscribe({
        next: (history) => {
          this.billingHistory = history;
          this.totalItems = history.length >= this.itemsPerPage ? (this.currentPage * this.itemsPerPage) + 1 : (this.currentPage * this.itemsPerPage);
          this.isLoadingBillingHistory = false;
        },
        error: (error) => {
          this.notificationService.error('Không thể tải lịch sử thanh toán. Vui lòng thử lại sau.');
          this.isLoadingBillingHistory = false;
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
    this.promoCodeValid = false;
    this.promoCodeDiscount = null;
    this.promoCodeMessage = '';
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
          this.notificationService.error('Không thể cập nhật chu kỳ thanh toán. Vui lòng thử lại sau.');
        }
      });
  }
  
  /**
   * Đăng ký gói mới
   * Subscribe to a new plan
   */
  subscribeToPlan(): void {
    if (!this.selectedPlan || !this.selectedPaymentMethod) {
      this.notificationService.warning('Vui lòng chọn gói đăng ký và phương thức thanh toán.');
      return;
    }
    
    this.isProcessing = true;
    
    const promoCode = this.promoCodeValid ? this.promoCodeForm.get('promoCode')?.value : undefined;
    
    this.subscriptionService.subscribeToPlan(
      this.selectedPlan.id,
      this.selectedBillingCycle,
      this.selectedPaymentMethod,
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
          this.loadBillingHistory();
        },
        error: (error) => {
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
    
    this.subscriptionService.cancelSubscription(this.currentSubscription.id, {
      reasonId,
      explanation,
      feedback
    })
      .pipe(
        takeUntil(this._onDestroySub),
        finalize(() => {
          this.isProcessing = false;
        })
      )
      .subscribe({
        next: () => {
          this.currentSubscription = null;
          this.closeAllModals();
          this.notificationService.success('Đã hủy đăng ký thành công.');
        },
        error: (error) => {
          this.notificationService.error('Không thể hủy đăng ký. Vui lòng thử lại sau.');
        }
      });
  }
  
  /**
   * Áp dụng mã giảm giá
   * Apply promo code
   */
  applyPromoCode(): void {
    if (!this.promoCodeForm.valid) {
      return;
    }
    
    const promoCode = this.promoCodeForm.get('promoCode')?.value;
    
    this.isProcessing = true;
    
    this.subscriptionService.applyPromoCode(promoCode)
      .pipe(
        takeUntil(this._onDestroySub),
        finalize(() => {
          this.isProcessing = false;
        })
      )
      .subscribe({
        next: (discount) => {
          this.promoCodeDiscount = discount;
          this.promoCodeValid = true;
          this.promoCodeMessage = 'Mã giảm giá hợp lệ!';
        },
        error: (error) => {
          this.promoCodeValid = false;
          this.promoCodeMessage = 'Mã giảm giá không hợp lệ. Vui lòng thử lại.';
        }
      });
  }
  
  /**
   * Đổi phương thức thanh toán
   * Change payment method
   * @param methodId ID của phương thức thanh toán mới
   */
  changePaymentMethod(methodId: string): void {
    this.selectedPaymentMethod = methodId;
  }
  
  /**
   * Chuyển trang trong lịch sử thanh toán
   * Change page in billing history
   * @param page Trang mới
   */
  changePage(page: number): void {
    this.currentPage = page;
    this.loadBillingHistory();
  }
}
