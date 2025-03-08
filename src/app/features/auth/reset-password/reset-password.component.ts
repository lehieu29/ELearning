import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, AbstractControl, ValidationErrors } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from '@app/shared/services/auth.service';

@Component({
  selector: 'app-reset-password',
  standalone: false,
  templateUrl: './reset-password.component.html',
  styleUrls: ['./reset-password.component.scss']
})
export class ResetPasswordComponent implements OnInit {
  resetForm: FormGroup;
  resetToken: string;
  isLoading = false;
  resetComplete = false;
  errorMessage = '';
  
  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private authService: AuthService
  ) { }

  ngOnInit(): void {
    this.resetToken = this.route.snapshot.queryParams['token'];
    
    if (!this.resetToken) {
      this.errorMessage = 'Invalid or expired reset link. Please request a new password reset.';
      return;
    }
    
    this.initResetForm();
  }

  initResetForm(): void {
    this.resetForm = this.fb.group({
      password: ['', [
        Validators.required, 
        Validators.minLength(8),
        this.passwordStrengthValidator
      ]],
      confirmPassword: ['', [Validators.required]]
    }, { 
      validators: this.passwordMatchValidator 
    });
  }

  passwordStrengthValidator(control: AbstractControl): ValidationErrors | null {
    const password = control.value;
    if (!password) {
      return null;
    }

    const hasUpperCase = /[A-Z]/.test(password);
    const hasLowerCase = /[a-z]/.test(password);
    const hasNumeric = /[0-9]/.test(password);
    const hasSpecialChar = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]+/.test(password);

    const passwordValid = hasUpperCase && hasLowerCase && hasNumeric && hasSpecialChar;

    return !passwordValid ? { weakPassword: true } : null;
  }

  passwordMatchValidator(control: AbstractControl): ValidationErrors | null {
    const password = control.get('password')?.value;
    const confirmPassword = control.get('confirmPassword')?.value;

    if (password !== confirmPassword) {
      control.get('confirmPassword')?.setErrors({ passwordMismatch: true });
      return { passwordMismatch: true };
    } else {
      const confirmPasswordErrors = control.get('confirmPassword')?.errors;
      if (confirmPasswordErrors && 'passwordMismatch' in confirmPasswordErrors) {
        const { passwordMismatch, ...otherErrors } = confirmPasswordErrors;
        control.get('confirmPassword')?.setErrors(
          Object.keys(otherErrors).length ? otherErrors : null
        );
      }
      return null;
    }
  }

  getErrorMessage(controlName: string): string {
    const control = this.resetForm.get(controlName);
    
    if (!control || !control.errors || !control.touched) {
      return '';
    }
    
    if (control.errors.required) {
      return 'This field is required';
    }
    
    if (control.errors.minlength) {
      return `Must be at least ${control.errors.minlength.requiredLength} characters`;
    }
    
    if (control.errors.weakPassword) {
      return 'Password must include uppercase, lowercase, number and special character';
    }
    
    if (control.errors.passwordMismatch) {
      return 'Passwords do not match';
    }
    
    return 'Invalid input';
  }

  onSubmit(): void {
    if (this.resetForm.invalid) {
      this.resetForm.markAllAsTouched();
      return;
    }
    
    this.isLoading = true;
    const password = this.resetForm.get('password').value;
    
    this.authService.resetPassword(this.resetToken, password).subscribe(
      success => {
        this.isLoading = false;
        this.resetComplete = true;
      },
      error => {
        this.isLoading = false;
        this.errorMessage = 'Unable to reset your password. The reset link may have expired.';
      }
    );
  }

  navigateToLogin(): void {
    this.router.navigate(['/auth/login']);
  }
}