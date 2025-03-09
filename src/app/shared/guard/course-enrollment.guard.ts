// src/app/shared/guard/course-enrollment.guard.ts
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
export class CourseEnrollmentGuard implements CanActivate {

  constructor(
    private authService: AuthService,
    private courseService: CourseService,
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

    // Get courseId from route parameters
    const courseId = route.paramMap.get('courseId');

    if (!courseId) {
      return this.router.createUrlTree(['/dashboard']);
    }

    // Check if user is enrolled in the course
    return this.courseService.checkEnrollment(courseId).pipe(
      map(isEnrolled => {
        if (isEnrolled) {
          return true;
        }

        // If not enrolled, redirect to course details page
        return this.router.createUrlTree(['/courses', courseId]);
      }),
      catchError(() => {
        // In case of error, redirect to dashboard
        return of(this.router.createUrlTree(['/dashboard']));
      })
    );
  }
}