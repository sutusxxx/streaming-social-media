import { SharedModule } from 'src/app/shared/shared.module';

import { NgModule } from '@angular/core';
import { LoginComponent } from '@components/auth/login/login.component';
import { RegistrationComponent } from '@components/auth/registration/registration.component';
import { ForgotPasswordDialogModule } from '@components/forgot-password-dialog/forgot-password-dialog.module';
import { AuthService } from '@services/auth.service';

@NgModule({
    declarations: [LoginComponent, RegistrationComponent],
    imports: [SharedModule, ForgotPasswordDialogModule],
    providers: [AuthService],
    exports: [LoginComponent, RegistrationComponent]
})
export class AuthModule {

}
