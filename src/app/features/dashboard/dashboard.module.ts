/* src/app/features/dashboard/dashboard.module.ts */
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { FormsModule } from '@angular/forms';

import { DashboardComponent } from './dashboard.component';
import { DashboardHomeComponent } from './dashboard-home/dashboard-home.component';
import { EnrolledCoursesComponent } from './enrolled-courses/enrolled-courses.component';
import { RecommendationsComponent } from './recommendations/recommendations.component';

import { AuthGuard } from '@app/shared/guard/auth.guard';
import { SharedModule } from '@app/shared/components/shared.module';

const routes: Routes = [
    {
        path: '',
        component: DashboardComponent,
        canActivate: [AuthGuard],
        children: [
            { path: '', component: DashboardHomeComponent },
            { path: 'enrolled-courses', component: EnrolledCoursesComponent },
            { path: 'recommendations', component: RecommendationsComponent }
        ]
    }
];

@NgModule({
    declarations: [
        DashboardComponent,
        DashboardHomeComponent,
        EnrolledCoursesComponent,
        RecommendationsComponent
    ],
    imports: [
        CommonModule,
        FormsModule,
        RouterModule.forChild(routes),
        SharedModule
    ]
})
export class DashboardModule { }