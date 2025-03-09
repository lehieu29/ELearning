// src/app/shared/guard/role.guard.ts
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
export class RoleGuard implements CanActivate {

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

    // Get the required role(s) from route data
    const requiredRoles = route.data.roles as Array<string>;

    // If no specific roles required, allow access
    if (!requiredRoles || requiredRoles.length === 0) {
      return true;
    }

    // Get user data
    const userData = this.authService.getUserData();

    // Check if user has any of the required roles
    if (userData && userData.roles && this.hasRequiredRole(userData.roles, requiredRoles)) {
      return true;
    }

    // If user doesn't have required role, redirect to access denied
    return this.router.createUrlTree(['/access-denied']);
  }

  private hasRequiredRole(userRoles: string[], requiredRoles: string[]): boolean {
    return requiredRoles.some(role => userRoles.includes(role));
  }
}