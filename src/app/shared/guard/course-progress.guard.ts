// src/app/shared/guard/course-progress.guard.ts
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
import { CourseService } from '../services/course.service';

@Injectable({
  providedIn: 'root'
})
export class CourseProgressGuard implements CanActivate {

  constructor(
    private courseService: CourseService,
    private router: Router
  ) { }

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {
    // Get course and lesson IDs from route parameters
    const courseId = route.paramMap.get('courseId');
    const lessonId = route.paramMap.get('lessonId');

    if (!courseId || !lessonId) {
      return this.router.createUrlTree(['/dashboard']);
    }

    // Check if prerequisites are met for this lesson
    return this.courseService.checkLessonPrerequisites(courseId, lessonId).pipe(
      map(prerequisitesMet => {
        if (prerequisitesMet) {
          return true;
        }

        // If prerequisites not met, redirect to course syllabus
        return this.router.createUrlTree(['/courses', courseId, 'syllabus'], {
          queryParams: { message: 'complete-prerequisites' }
        });
      }),
      catchError(() => {
        // In case of error, redirect to course syllabus
        return of(this.router.createUrlTree(['/courses', courseId, 'syllabus']));
      })
    );
  }
}