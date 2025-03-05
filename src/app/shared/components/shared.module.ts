import { NgModule } from "@angular/core";
import { ElearningTextBoxComponent } from "./elearning-text-box/elearning-text-box.component";
import { ElearningButtonComponent } from './elearning-button/elearning-button.component';
import { FormsModule } from "@angular/forms";
import { CommonModule } from "@angular/common";
import { PaginationComponent } from './pagination/pagination.component';
import { SearchBarComponent } from './search-bar/search-bar.component';
import { LoaderComponent } from './loader/loader.component';
import { ModalComponent } from './modal/modal.component';
import { ProgressBarComponent } from './progress-bar/progress-bar.component';
import { RatingComponent } from './rating/rating.component';
import { TabsComponent } from './tabs/tabs.component';
import { BadgeComponent } from './badge/badge.component';
import { TooltipComponent } from './tooltip/tooltip.component';
import { BreadcrumbsComponent } from './breadcrumbs/breadcrumbs.component';
import { CardComponent } from './card/card.component';
import { AlertComponent } from './alert/alert.component';
import { AccordionComponent } from './accordion/accordion.component';
import { FileUploadComponent } from './file-upload/file-upload.component';
import { ToggleSwitchComponent } from './toggle-switch/toggle-switch.component';
import { StepperComponent } from './stepper/stepper.component';
import { DataTableComponent } from './data-table/data-table.component';
import { SkeletonLoaderComponent } from './skeleton-loader/skeleton-loader.component';
import { ImageGalleryComponent } from './image-gallery/image-gallery.component';
import { TimelineComponent } from './timeline/timeline.component';
import { FileViewerComponent } from './file-viewer/file-viewer.component';
import { TagInputComponent } from './tag-input/tag-input.component';

@NgModule({
    declarations: [
        ElearningTextBoxComponent,
        ElearningButtonComponent,
        PaginationComponent,
        SearchBarComponent,
        LoaderComponent,
        ModalComponent,
        ProgressBarComponent,
        RatingComponent,
        TabsComponent,
        BadgeComponent,
        TooltipComponent,
        BreadcrumbsComponent,
        CardComponent,
        AlertComponent,
        AccordionComponent,
        FileUploadComponent,
        ToggleSwitchComponent,
        StepperComponent,
        DataTableComponent,
        SkeletonLoaderComponent,
        ImageGalleryComponent,
        TimelineComponent,
        FileViewerComponent,
        TagInputComponent
    ],
    imports: [
        FormsModule,
        CommonModule
    ],
    exports: [
        ElearningTextBoxComponent,
        ElearningButtonComponent
    ]
})
export class SharedModule {}