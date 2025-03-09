// src/app/shared/guard/guards.module.ts
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { AuthGuard } from './auth.guard';
import { RoleGuard } from './role.guard';
import { CourseEnrollmentGuard } from './course-enrollment.guard';
import { UnsavedChangesGuard } from './unsaved-changes.guard';
import { CourseProgressGuard } from './course-progress.guard';
import { AdminGuard } from './admin.guard';
import { InstructorGuard } from './instructor.guard';
import { CourseOwnerGuard } from './course-owner.guard';
import { BrowserSupportGuard } from './browser-support.guard';

@NgModule({
  imports: [CommonModule],
  providers: [
    AuthGuard,
    RoleGuard,
    CourseEnrollmentGuard,
    UnsavedChangesGuard,
    CourseProgressGuard,
    AdminGuard,
    InstructorGuard,
    CourseOwnerGuard,
    BrowserSupportGuard
  ]
})
export class GuardsModule { }