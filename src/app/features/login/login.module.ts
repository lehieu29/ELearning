import { NgModule } from "@angular/core";
import { LoginComponent } from "./login.component";
import { SharedModule } from "../../shared/shared.module";
import { LoginRoutingModule } from "./loading-routing.module";
import { FormsModule } from "@angular/forms";
import { AngularFireModule } from '@angular/fire/compat';
import { AngularFireAuthModule } from '@angular/fire/compat/auth';
import { environment } from "../../../environments/environment";

@NgModule({
    declarations: [
        LoginComponent
    ],
    imports: [
        AngularFireModule.initializeApp(environment.firebase),
        AngularFireAuthModule,
        SharedModule,
        FormsModule,
        LoginRoutingModule
    ],
    exports: [
        LoginComponent
    ]
})
export class LoginModule {}