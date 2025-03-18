
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

const routes: Routes = [
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