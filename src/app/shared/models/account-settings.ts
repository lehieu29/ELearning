// File path: src/app/features/profile/models/account-settings.model.ts
/**
 * Model định nghĩa cấu trúc dữ liệu cho cài đặt tài khoản
 * Model defining data structure for account settings
 */
export interface AccountSettings {
  email: string;
  username: string;
  firstName: string;
  lastName: string;
  phone?: string;
  language: string;
  timezone: string;
  twoFactorEnabled: boolean;
  emailNotifications: EmailNotificationSettings;
  sessionTimeout: number; // Thời gian tính bằng phút / Time in minutes
  lastPasswordChange: Date;
}

/**
 * Cài đặt thông báo qua email
 * Email notification settings
 */
export interface EmailNotificationSettings {
  courseUpdates: boolean;
  promotions: boolean;
  accountAlerts: boolean;
  feedback: boolean;
  newsletters: boolean;
}

/**
 * Dữ liệu cập nhật mật khẩu
 * Password update data
 */
export interface PasswordUpdateData {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

/**
 * Kết quả xác thực email
 * Email verification result
 */
export interface EmailVerificationResult {
  success: boolean;
  message: string;
  verified: boolean;
}

/**
 * Dữ liệu phản hồi về bảo mật
 * Security settings response
 */
export interface SecuritySettingsResponse {
  twoFactorEnabled: boolean;
  activeSessions: SessionInfo[];
  lastPasswordChange: Date;
  securityEvents: SecurityEvent[];
}

/**
 * Thông tin về phiên đăng nhập
 * Session information
 */
export interface SessionInfo {
  id: string;
  deviceName: string;
  browser: string;
  ipAddress: string;
  location?: string;
  lastActive: Date;
  current: boolean;
}

/**
 * Sự kiện bảo mật
 * Security event
 */
export interface SecurityEvent {
  id: string;
  type: 'login' | 'password_change' | 'security_settings_change' | 'logout';
  timestamp: Date;
  ipAddress: string;
  deviceInfo: string;
  location?: string;
  successful: boolean;
}

/**
 * Danh sách múi giờ
 * List of timezones
 */
export const TIMEZONES = [
  { value: 'UTC-12:00', label: '(UTC-12:00) International Date Line West' },
  { value: 'UTC-11:00', label: '(UTC-11:00) Coordinated Universal Time-11' },
  { value: 'UTC-10:00', label: '(UTC-10:00) Hawaii' },
  { value: 'UTC-09:00', label: '(UTC-09:00) Alaska' },
  { value: 'UTC-08:00', label: '(UTC-08:00) Pacific Time (US & Canada)' },
  { value: 'UTC-07:00', label: '(UTC-07:00) Mountain Time (US & Canada)' },
  { value: 'UTC-06:00', label: '(UTC-06:00) Central Time (US & Canada)' },
  { value: 'UTC-05:00', label: '(UTC-05:00) Eastern Time (US & Canada)' },
  { value: 'UTC-04:00', label: '(UTC-04:00) Atlantic Time (Canada)' },
  { value: 'UTC-03:00', label: '(UTC-03:00) Brasilia' },
  { value: 'UTC-02:00', label: '(UTC-02:00) Coordinated Universal Time-02' },
  { value: 'UTC-01:00', label: '(UTC-01:00) Azores' },
  { value: 'UTC+00:00', label: '(UTC+00:00) London, Dublin' },
  { value: 'UTC+01:00', label: '(UTC+01:00) Amsterdam, Berlin, Rome, Paris' },
  { value: 'UTC+02:00', label: '(UTC+02:00) Athens, Cairo' },
  { value: 'UTC+03:00', label: '(UTC+03:00) Moscow, Kuwait' },
  { value: 'UTC+04:00', label: '(UTC+04:00) Abu Dhabi, Dubai' },
  { value: 'UTC+05:00', label: '(UTC+05:00) Islamabad, Karachi' },
  { value: 'UTC+05:30', label: '(UTC+05:30) Chennai, Kolkata, Mumbai, New Delhi' },
  { value: 'UTC+06:00', label: '(UTC+06:00) Astana, Dhaka' },
  { value: 'UTC+07:00', label: '(UTC+07:00) Bangkok, Hanoi, Jakarta' },
  { value: 'UTC+08:00', label: '(UTC+08:00) Beijing, Hong Kong, Singapore' },
  { value: 'UTC+09:00', label: '(UTC+09:00) Tokyo, Seoul' },
  { value: 'UTC+10:00', label: '(UTC+10:00) Sydney, Melbourne' },
  { value: 'UTC+11:00', label: '(UTC+11:00) Vladivostok' },
  { value: 'UTC+12:00', label: '(UTC+12:00) Auckland, Wellington' },
  { value: 'UTC+13:00', label: '(UTC+13:00) Nuku\'alofa' }
];

/**
 * Danh sách ngôn ngữ
 * List of languages
 */
export const LANGUAGES = [
  { value: 'en', label: 'English' },
  { value: 'vi', label: 'Tiếng Việt' },
  { value: 'fr', label: 'Français' },
  { value: 'de', label: 'Deutsch' },
  { value: 'es', label: 'Español' },
  { value: 'pt', label: 'Português' },
  { value: 'zh', label: '中文' },
  { value: 'ja', label: '日本語' },
  { value: 'ko', label: '한국어' },
  { value: 'ru', label: 'Русский' }
];