import { NgModule } from "@angular/core";
import { ElearningTextBoxComponent } from "./components/elearning-text-box/elearning-text-box.component";
import { ElearningButtonComponent } from './components/elearning-button/elearning-button.component';
import { FormsModule } from "@angular/forms";
import { CommonModule } from "@angular/common";

@NgModule({
    declarations: [
        ElearningTextBoxComponent,
        ElearningButtonComponent
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