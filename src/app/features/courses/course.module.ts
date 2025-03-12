/* src/app/features/dashboard/dashboard.module.ts */
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { FormsModule } from '@angular/forms';

import { SharedModule } from '@app/shared/components/shared.module';
import { CourseDetailsComponent } from './course-details/course-details.component';

const routes: Routes = [
    
];

@NgModule({
    declarations: [
        CourseDetailsComponent,
    ],
    imports: [
        CommonModule,
        FormsModule,
        RouterModule.forChild(routes),
        SharedModule
    ],
    exports: [
    ]
})
export class CourseModule { }