import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { BaseComponent } from '../../shared/components/base/base-component';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { FacebookAuthProvider, GoogleAuthProvider } from 'firebase/auth';

@Component({
  selector: 'app-login',
  standalone: false,
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss'
})
export class LoginComponent extends BaseComponent {
  email: string = '';
  password: string = '';

  constructor(private router: Router, private afAuth: AngularFireAuth) {
    super();
  }

  signInWithGoogle() {
    const provider = new GoogleAuthProvider();
    this.afAuth.signInWithPopup(provider)
      .then((result) => {
        console.log('Đăng nhập Google thành công', result);
        // Xử lý sau khi đăng nhập thành công
      })
      .catch((error) => {
        console.error('Lỗi đăng nhập Google', error);
      });
  }

  signInWithFacebook() {
    const provider = new FacebookAuthProvider();
    provider.addScope('email'); // Yêu cầu quyền truy cập email
    
    this.afAuth.signInWithPopup(provider)
      .then((result) => {
        console.log('Đăng nhập Facebook thành công', result);
        // Xử lý sau khi đăng nhập thành công
      })
      .catch((error) => {
        console.error('Lỗi đăng nhập Facebook', error);
      });
  }

  onSubmit() {
    // Implement email/password sign-in logic here
    console.log('Signing in with email:', this.email);
  }

  forgotPassword() {
    // Implement forgot password logic
    console.log('Forgot password clicked');
  }

  signInWithOrganization() {
    // Implement organization sign-in logic
    console.log('Sign in with organization clicked');
  }
}
