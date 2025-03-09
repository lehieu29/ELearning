/* src/app/features/dashboard/dashboard.module.ts */
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { FormsModule } from '@angular/forms';

import { SharedModule } from '@app/shared/components/shared.module';
import { CourseCatalogComponent } from './course-catalog/course-catalog.component';
import { CourseDetailsComponent } from './course-details/course-details.component';
import { CourseFiltersComponent } from './course-filters/course-filters.component';

const routes: Routes = [
    
];

@NgModule({
    declarations: [
        CourseCatalogComponent,
        CourseDetailsComponent,
        CourseFiltersComponent
    ],
    imports: [
        CommonModule,
        FormsModule,
        RouterModule.forChild(routes),
        SharedModule
    ],
    exports: [
        CourseCatalogComponent
    ]
})
export class CourseModule { }