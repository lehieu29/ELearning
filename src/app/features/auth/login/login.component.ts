import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, AbstractControl, ValidationErrors } from '@angular/forms';
import { Router } from '@angular/router';
import { BaseComponent } from '@app/shared/components/base/base-component';
import { LoginRequest, RegisterRequest } from '@app/shared/models/auth.model';
import { AuthService } from '@app/shared/services/auth.service';
import { takeUntil } from 'rxjs';

@Component({
  selector: 'app-login',
  standalone: false,
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent extends BaseComponent implements OnInit {
  activeTab: 'login' | 'register' = 'login';
  loginForm: FormGroup;
  registerForm: FormGroup;
  isLoading = false;
  
  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) { 
    super();
  }

  ngOnInit(): void {
    this.initLoginForm();
    this.initRegisterForm();
  }

  setActiveTab(tab: 'login' | 'register'): void {
    this.activeTab = tab;
  }

  initLoginForm(): void {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(8)]]
    });
  }

  initRegisterForm(): void {
    this.registerForm = this.fb.group({
      fullName: ['', [Validators.required]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [
        Validators.required, 
        Validators.minLength(8),
        this.passwordStrengthValidator
      ]],
      confirmPassword: ['', [Validators.required]],
      termsAccepted: [false, [Validators.requiredTrue]]
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
      // We need to explicitly return null to remove any passwordMismatch errors
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

  getErrorMessage(controlName: string, form: FormGroup): string {
    const control = form.get(controlName);
    
    if (!control || !control.errors || !control.touched) {
      return '';
    }
    
    if (control.errors.required) {
      return 'This field is required';
    }
    
    if (control.errors.email) {
      return 'Please enter a valid email address';
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

  onLoginSubmit(): void {
    if (this.loginForm.invalid) {
      this.loginForm.markAllAsTouched();
      return;
    }
    
    this.isLoading = true;
    
    const { email, password } = this.loginForm.value;

    const body: LoginRequest = {
      email,
      password
    }
    
    this.authService.login(body).subscribe(
      success => {
        this.isLoading = false;
        if (success) {
          this.router.navigate(['/dashboard']);
        } else {
          // Handle login failure
          this.loginForm.setErrors({ invalidCredentials: true });
        }
      },
      error => {
        this.isLoading = false;
        // Handle error
        console.error('Login error:', error);
        this.loginForm.setErrors({ serverError: true });
      }
    );
  }

  onRegisterSubmit(): void {
    if (this.registerForm.invalid) {
      this.registerForm.markAllAsTouched();
      return;
    }
    
    this.isLoading = true;
    
    const { fullName, email, password } = this.registerForm.value;
    const body: RegisterRequest = {
      fullName,
      email,
      password
    }
    this.authService.register(body).pipe(takeUntil(this._onDestroySub)).subscribe(
      success => {
        this.isLoading = false;
        if (success) {
          // Registration successful, navigate to login or dashboard
          this.activeTab = 'login';
          this.loginForm.patchValue({ email });
        } else {
          // Handle registration failure
          this.registerForm.setErrors({ registrationFailed: true });
        }
      },
      error => {
        this.isLoading = false;
        // Handle specific errors
        console.error('Registration error:', error);
        
        if (error.status === 409) {
          // Email already exists
          this.registerForm.get('email').setErrors({ emailExists: true });
        } else {
          this.registerForm.setErrors({ serverError: true });
        }
      }
    );
  }
}