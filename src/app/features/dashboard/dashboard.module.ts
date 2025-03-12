/* src/app/features/dashboard/dashboard.module.ts */
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { FormsModule } from '@angular/forms';

import { DashboardComponent } from './dashboard.component';

import { AuthGuard } from '@app/shared/guard/auth.guard';
import { SharedModule } from '@app/shared/components/shared.module';
import { CourseCatalogComponent } from './course-catalog/course-catalog.component';
import { ProgressTrackerComponent } from './progress-tracker/progress-tracker.component';
import { LearningPathVisualizationComponent } from './learning-path-visualization/learning-path-visualization.component';
import { ActivityFeedComponent } from './activity-feed/activity-feed.component';
import { AchievementsComponent } from './achievements/achievements.component';
import { WelcomeBannerComponent } from './welcome-banner/welcome-banner.component';
import { DeadlinesCalendarComponent } from './deadlines-calendar/deadlines-calendar.component';
import { RecommendationEngineComponent } from './recommendation-engine/recommendation-engine.component';

const routes: Routes = [
    {
        path: '',
        component: DashboardComponent,
        canActivate: [AuthGuard],
        children: [
            { path: '', component: DashboardComponent }
        ]
    }
];

@NgModule({
    declarations: [
        DashboardComponent,
        CourseCatalogComponent,
        ProgressTrackerComponent,
        LearningPathVisualizationComponent,
        ActivityFeedComponent,
        AchievementsComponent,
        WelcomeBannerComponent,
        DeadlinesCalendarComponent,
        RecommendationEngineComponent
    ],
    imports: [
        CommonModule,
        FormsModule,
        RouterModule.forChild(routes),
        SharedModule
    ]
})
export class DashboardModule { }