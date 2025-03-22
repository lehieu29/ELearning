
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { FormsModule } from '@angular/forms';

import { AuthGuard } from '@app/shared/guard/auth.guard';
import { SharedModule } from '@app/shared/components/shared.module';
import { AccountSettingsComponent } from './account-settings/account-settings.component';
import { NotificationsComponent } from './notifications/notifications.component';
import { CertificatesComponent } from './certificates/certificates.component';
import { LearningHistoryComponent } from './learning-history/learning-history.component';
import { SkillsAssessmentComponent } from './skills-assessment/skills-assessment.component';
import { ResumeBuilderComponent } from './resume-builder/resume-builder.component';
import { SocialLinksComponent } from './social-links/social-links.component';
import { PrivacySettingsComponent } from './privacy-settings/privacy-settings.component';
import { SubscriptionManagementComponent } from './subscription-management/subscription-management.component';
import { GoalTrackingComponent } from './goal-tracking/goal-tracking.component';
import { PreferenceCenterComponent } from './preference/preference.component';
import { DeviceManagementComponent } from './device-management/device-management.component';
import { UserInfoComponent } from './user-info/user-info.component';

const routes: Routes = [
  {
    path: '',
    // component: ProfileLayoutComponent,
    canActivate: [AuthGuard],
    children: [
      {
        path: '',
        redirectTo: 'user-info',
        pathMatch: 'full'
      },
      {
        path: 'user-info',
        component: UserInfoComponent,
        data: { title: 'Thông tin cá nhân' }
      },
      {
        path: 'account-settings',
        component: AccountSettingsComponent,
        data: { title: 'Cài đặt tài khoản' }
      },
      {
        path: 'notifications',
        component: NotificationsComponent,
        data: { title: 'Cài đặt thông báo' }
      },
      {
        path: 'certificates',
        component: CertificatesComponent,
        data: { title: 'Chứng chỉ của tôi' }
      },
      {
        path: 'learning-history',
        component: LearningHistoryComponent,
        data: { title: 'Lịch sử học tập' }
      },
      {
        path: 'skills-assessment',
        component: SkillsAssessmentComponent,
        data: { title: 'Đánh giá kỹ năng' }
      },
      {
        path: 'resume-builder',
        component: ResumeBuilderComponent,
        data: { title: 'Xây dựng hồ sơ' }
      },
      {
        path: 'social-links',
        component: SocialLinksComponent,
        data: { title: 'Liên kết mạng xã hội' }
      },
      {
        path: 'privacy-settings',
        component: PrivacySettingsComponent,
        data: { title: 'Cài đặt quyền riêng tư' }
      },
      {
        path: 'subscription-management',
        component: SubscriptionManagementComponent,
        data: { title: 'Quản lý gói đăng ký' }
      },
      {
        path: 'goal-tracking',
        component: GoalTrackingComponent,
        data: { title: 'Mục tiêu học tập' }
      },
      {
        path: 'preference-center',
        component: PreferenceCenterComponent,
        data: { title: 'Tùy chỉnh trải nghiệm' }
      },
      {
        path: 'device-management',
        component: DeviceManagementComponent,
        data: { title: 'Quản lý thiết bị' }
      }
    ]
  }
];

@NgModule({
  declarations: [
    AccountSettingsComponent,
    NotificationsComponent,
    CertificatesComponent,
    LearningHistoryComponent,
    SkillsAssessmentComponent,
    ResumeBuilderComponent,
    SocialLinksComponent,
    PrivacySettingsComponent,
    SubscriptionManagementComponent,
    GoalTrackingComponent,
    PreferenceCenterComponent,
    DeviceManagementComponent
  ],
  imports: [
    CommonModule,
    FormsModule,
    RouterModule.forChild(routes),
    SharedModule
  ]
})
export class ProfileModule { }