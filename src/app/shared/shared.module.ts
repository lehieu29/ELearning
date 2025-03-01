import { NgModule } from "@angular/core";
import { ElearningTextBoxComponent } from "./components/elearning-text-box/elearning-text-box.component";
import { ElearningButtonComponent } from './components/elearning-button/elearning-button.component';
import { FormsModule } from "@angular/forms";

@NgModule({
    declarations: [
        ElearningTextBoxComponent,
        ElearningButtonComponent
    ],
    imports: [
        FormsModule
    ],
    exports: [
        ElearningTextBoxComponent,
        ElearningButtonComponent
    ]
})
export class SharedModule {}