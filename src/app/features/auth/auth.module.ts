import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';

import { LoginComponent } from './login/login.component';
import { RegistrationComponent } from './registration/registration.component';
import { PasswordResetComponent } from './password-reset/password-reset.component';
import { SocialLoginComponent } from './social-login/social-login.component';
import { TwoFactorAuthComponent } from './two-factor-authentication/two-factor-authentication.component';
import { EmailVerificationComponent } from './email-verification/email-verification.component';
import { SharedModule } from '../../shared/shared.module';

@NgModule({
  declarations: [
    LoginComponent,
    RegistrationComponent,
    PasswordResetComponent,
    SocialLoginComponent,
    TwoFactorAuthComponent,
    EmailVerificationComponent
  ],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterModule.forChild([
      { path: 'login', component: LoginComponent },
      { path: 'register', component: RegistrationComponent },
      { path: 'password-reset', component: PasswordResetComponent },
      { path: 'email-verification', component: EmailVerificationComponent },
      { path: 'two-factor', component: TwoFactorAuthComponent }
    ]),
    SharedModule
  ],
  exports: [
    LoginComponent,
    RegistrationComponent,
    SocialLoginComponent
  ]
})
export class AuthModule { }