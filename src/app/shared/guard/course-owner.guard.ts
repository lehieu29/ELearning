// src/app/shared/guard/course-owner.guard.ts
import { Injectable } from '@angular/core';
import { 
  CanActivate, 
  ActivatedRouteSnapshot, 
  RouterStateSnapshot, 
  Router,
  UrlTree
} from '@angular/router';
import { Observable } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { of } from 'rxjs';
import { AuthService } from '../services/auth.service';
import { CourseService } from '../services/course.service';

@Injectable({
  providedIn: 'root'
})
export class CourseOwnerGuard implements CanActivate {
  
  constructor(
    private authService: AuthService,
    private courseService: CourseService,
    private router: Router
  ) {}

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
    
    // Get courseId from route parameters
    const courseId = route.paramMap.get('courseId');
    
    if (!courseId) {
      return this.router.createUrlTree(['/dashboard']);
    }
    
    // Check if user is the course owner
    return this.courseService.checkCourseOwnership(courseId).pipe(
      map(isOwner => {
        if (isOwner) {
          return true;
        }
        
        // If not owner, redirect to access denied
        return this.router.createUrlTree(['/access-denied']);
      }),
      catchError(() => {
        // In case of error, redirect to dashboard
        return of(this.router.createUrlTree(['/dashboard']));
      })
    );
  }
}