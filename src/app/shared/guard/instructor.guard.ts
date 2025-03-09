// src/app/shared/guard/instructor.guard.ts
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
export class InstructorGuard implements CanActivate {

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

    // Check if user has instructor role
    if (userData && userData.roles && userData.roles.includes('instructor')) {
      return true;
    }

    // If user is not instructor, redirect to access denied
    return this.router.createUrlTree(['/access-denied']);
  }
}