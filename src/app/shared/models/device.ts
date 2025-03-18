// File path: src/app/shared/models/device.model.ts

export interface Device {
  id: string;
  deviceName: string;
  deviceType: DeviceType;
  browser?: string;
  operatingSystem?: string;
  ipAddress?: string;
  location?: string; 
  lastActive: Date;
  isCurrent: boolean;
  isTrusted: boolean;
  dateAdded: Date;
}

export type DeviceType = 'desktop' | 'laptop' | 'tablet' | 'mobile' | 'other';

export interface DeviceActivity {
  deviceId: string;
  activityType: 'login' | 'logout' | 'course_access' | 'settings_change' | 'payment' | 'other';
  timestamp: Date;
  details?: string;
  ipAddress?: string;
  location?: string;
}

export interface DeviceAuthResponse {
  success: boolean;
  message: string;
  requiresMFA?: boolean;
  authCode?: string;
}

export interface DeviceManagementStats {
  totalDevices: number;
  activeInLast30Days: number;
  unrecognizedDevices: number;
  mfaEnabledDevices: number;
}