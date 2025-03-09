// src/app/shared/models/payment.model.ts
export interface Payment {
    id: string;
    userId: string;
    courseId: string;
    courseName: string;
    amount: number;
    currency: string;
    status: 'pending' | 'completed' | 'failed' | 'refunded';
    paymentMethod: 'credit_card' | 'paypal' | 'bank_transfer' | 'crypto';
    paymentDate: Date | string;
    transactionId: string;
    receiptUrl?: string;
    refundAmount?: number;
    refundDate?: Date | string;
    refundReason?: string;
}

export interface Subscription {
    id: string;
    userId: string;
    planId: string;
    planName: string;
    status: 'active' | 'canceled' | 'expired' | 'pending';
    startDate: Date | string;
    endDate: Date | string;
    renewalDate?: Date | string;
    price: number;
    currency: string;
    billingCycle: 'monthly' | 'quarterly' | 'annual';
    paymentMethod: string;
    autoRenew: boolean;
    canceledAt?: Date | string;
}