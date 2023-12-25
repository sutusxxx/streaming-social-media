import { SharedModule } from 'src/app/shared/shared.module';

import { NgModule } from '@angular/core';
import { ForgotPasswordDialogComponent } from '@components/forgot-password-dialog/forgot-password-dialog.component';
import { AuthService } from '@services/auth.service';

@NgModule({
    declarations: [ForgotPasswordDialogComponent],
    imports: [SharedModule],
    providers: [AuthService],
    exports: [ForgotPasswordDialogComponent]
})
export class ForgotPasswordDialogModule {

}
