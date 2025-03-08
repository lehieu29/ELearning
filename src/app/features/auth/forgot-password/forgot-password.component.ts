import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '@app/shared/services/auth.service';

@Component({
  selector: 'app-forgot-password',
  standalone: false,
  templateUrl: './forgot-password.component.html',
  styleUrls: ['./forgot-password.component.scss']
})
export class ForgotPasswordComponent implements OnInit {
  forgotPasswordForm: FormGroup;
  resetRequestSent = false;
  isLoading = false;
  errorMessage = '';
  
  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) { }

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
    
    this.authService.requestPasswordReset(email).subscribe(
      success => {
        this.isLoading = false;
        this.resetRequestSent = true;
      },
      error => {
        this.isLoading = false;
        if (error.status === 404) {
          this.errorMessage = 'No account found with this email address.';
        } else {
          this.errorMessage = 'Unable to process your request. Please try again later.';
        }
      }
    );
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