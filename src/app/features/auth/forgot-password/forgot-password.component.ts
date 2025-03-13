// File path: src/app/features/auth/forgot-password/forgot-password.component.ts
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '@app/shared/services/auth.service';
import { BaseComponent } from '@app/shared/components/base/base-component';
import { takeUntil } from 'rxjs';

@Component({
  selector: 'app-forgot-password',
  standalone: false,
  templateUrl: './forgot-password.component.html'
})
export class ForgotPasswordComponent extends BaseComponent implements OnInit {
  forgotPasswordForm: FormGroup;
  resetRequestSent = false;
  isLoading = false;
  errorMessage = '';

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {
    super();
  }

  ngOnInit(): void {
    this.initForgotPasswordForm();
  }

  initForgotPasswordForm(): void {
    this.forgotPasswordForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]]
    });
  }

  onSubmit(): void {
    if (this.forgotPasswordForm.invalid) {
      this.forgotPasswordForm.markAllAsTouched();
      return;
    }

    this.isLoading = true;
    const email = this.forgotPasswordForm.get('email').value;

    this.authService.requestPasswordReset(email)
      .pipe(takeUntil(this._onDestroySub))
      .subscribe({
        next: success => {
          this.isLoading = false;
          this.resetRequestSent = true;
        },
        error: error => {
          this.isLoading = false;
          if (error.status === 404) {
            this.errorMessage = 'No account found with this email address.';
          } else {
            this.errorMessage = 'Unable to process your request. Please try again later.';
          }
        }
      });
  }

  navigateToLogin(): void {
    this.router.navigate(['/auth/login']);
  }

  getErrorMessage(controlName: string): string {
    const control = this.forgotPasswordForm.get(controlName);

    if (!control || !control.errors || !control.touched) {
      return '';
    }

    if (control.errors.required) {
      return 'This field is required';
    }

    if (control.errors.email) {
      return 'Please enter a valid email address';
    }

    return 'Invalid input';
  }
}