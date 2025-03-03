import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { RouterModule, Routes } from '@angular/router';
import { LoginComponent } from './login/login.component';
import { AuthService } from '@app/shared/services/auth.service';
import { AuthGuard } from '@app/shared/guard/auth.guard';
import { AuthInterceptor } from '@app/shared/interceptor/auth.interceptor';
import { SharedModule } from '@app/shared/shared.module';

const routes: Routes = [
  { path: 'login', component: LoginComponent },
  { path: 'register', redirectTo: 'login', pathMatch: 'full' }
];

@NgModule({
  declarations: [
    LoginComponent
  ],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    HttpClientModule,
    RouterModule.forChild(routes),
    SharedModule
  ],
  exports: [
    LoginComponent,
    RouterModule
  ],
  providers: [
    AuthService,
    AuthGuard,
    {
      provide: HTTP_INTERCEPTORS,
      useClass: AuthInterceptor,
      multi: true
    }
  ]
})
export class AuthModule { }