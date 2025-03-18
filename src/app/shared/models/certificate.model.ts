// src/app/shared/models/certificate.model.ts

export interface Certificate {
  id: string;
  courseId: string;
  courseName: string;
  courseImage?: string;
  title: string;
  issueDate: string;
  expirationDate?: string;
  certificateUrl: string;
  downloadUrl: string;
  credentialId: string;
  verificationUrl: string;
  status: 'issued' | 'expired' | 'revoked' | 'pending';
  type: 'course' | 'nanodegree' | 'specialization' | 'professional';
  issuer: {
    name: string;
    logo?: string;
  };
  skills?: string[];
}

export interface CertificateFilter {
  query?: string;
  type?: string;
  status?: string;
  dateRange?: {
    start?: Date;
    end?: Date;
  };
}