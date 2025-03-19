// File path: src/app/shared/models/subscription.model.ts

export interface Subscription {
  id: string;
  userId: string;
  planId: string;
  planName: string;
  status: SubscriptionStatus;
  startDate: string;
  endDate: string;
  renewalDate: string;
  price: number;
  billingCycle: BillingCycle;
  autoRenew: boolean;
  paymentMethodId: string;
  features: SubscriptionFeature[];
  discountApplied?: DiscountInfo;
  createdAt: string;
  updatedAt: string;
}

export interface SubscriptionPlan {
  id: string;
  name: string;
  description: string;
  monthlyPrice: number;
  annualPrice: number;
  features: SubscriptionFeature[];
  popular: boolean;
  recommended?: boolean;
  maxConcurrentCourses?: number;
  maxDownloads?: number;
  includesCertificates: boolean;
  includesProjects: boolean;
  includesMentorship: boolean;
  trialDays?: number;
}

export interface SubscriptionFeature {
  name: string;
  description: string;
  included: boolean;
  highlight?: boolean;
}

export interface DiscountInfo {
  code: string;
  amount: number; // Percentage or fixed amount
  type: 'percentage' | 'fixed';
  expiryDate?: string;
}

export interface BillingHistory {
  id: string;
  subscriptionId: string;
  amount: number;
  date: string;
  status: PaymentStatus;
  paymentMethodId: string;
  paymentMethodType: string;
  invoice?: string;
  receiptUrl?: string;
}

export type SubscriptionStatus =
  'active' | 'cancelled' | 'expired' | 'trial' | 'past_due' | 'pending';

export type BillingCycle = 'monthly' | 'annual' | 'quarterly';

export type PaymentStatus =
  'succeeded' | 'pending' | 'failed' | 'refunded' | 'voided';

export interface SubscriptionUpdateOptions {
  planId?: string;
  billingCycle?: BillingCycle;
  autoRenew?: boolean;
  paymentMethodId?: string;
  promoCode?: string;
}

export interface CancellationReason {
  id: string;
  reason: string;
  requiresExplanation: boolean;
}

export interface CancellationRequest {
  subscriptionId: string;
  reasonId: string;
  explanation?: string;
  feedback?: string;
  retentionOfferAccepted?: boolean;
}

export interface PromoCodeResponse {
  valid: boolean;
  discount?: number;
  type?: 'percentage' | 'fixed';
  message?: string;
  expiryDate?: string;
}

/**
* Kiểm tra khả năng nâng cấp hoặc hạ cấp gói đăng ký
* Check options for upgrading or downgrading subscription
* @param subscriptionId ID của gói đăng ký
* @returns Observable chứa thông tin về các gói có thể chuyển đổi
*/
export interface UpgradeOptionsResponse {
  upgrades: SubscriptionPlan[];
  downgrades: SubscriptionPlan[];
  currentPlan: SubscriptionPlan;
  prorationDetails: {
    date: string;
    credits: number
  };
}
