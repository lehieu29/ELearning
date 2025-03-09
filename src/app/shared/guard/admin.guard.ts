// src/app/shared/guard/admin.guard.ts
import { Injectable } from '@angular/core';
import {
  CanActivate,
  ActivatedRouteSnapshot,
  RouterStateSnapshot,
  Router,
  UrlTree
} from '@angular/router';
import { Observable } from 'rxjs';
import { AuthService } from '../services/auth.service';

@Injectable({
  providedIn: 'root'
})
export class AdminGuard implements CanActivate {

  constructor(
    private authService: AuthService,
    private router: Router
  ) { }

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {
    // First check if the user is authenticated
    if (!this.authService.isLoggedIn()) {
      return this.router.createUrlTree(['/auth/login'], {
        queryParams: { redirectUrl: state.url }
      });
    }

    // Get user data
    const userData = this.authService.getUserData();

    // Check if user has admin role
    if (userData && userData.roles && userData.roles.includes('admin')) {
      return true;
    }

    // If user is not admin, redirect to access denied
    return this.router.createUrlTree(['/access-denied']);
  }
}