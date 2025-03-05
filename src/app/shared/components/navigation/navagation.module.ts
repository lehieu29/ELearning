import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { RouterModule, Routes } from '@angular/router';
import { SharedModule } from '@app/shared/components/shared.module';
import { NavigationComponent } from './navigation/navigation.component';

const routes: Routes = [
    
];

@NgModule({
    declarations: [
        NavigationComponent
    ],
    imports: [
        CommonModule,
        ReactiveFormsModule,
        HttpClientModule,
        RouterModule.forChild(routes),
        SharedModule
    ],
    exports: [
        NavigationComponent
    ]
})
export class NavigationModule { }