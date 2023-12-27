import { SharedModule } from 'src/app/shared/shared.module';

import { NgModule } from '@angular/core';
import { SettingsComponent } from '@components/settings/settings.component';
import { AuthService } from '@services/auth.service';
import { StorageService } from '@services/storage.service';
import { ConfirmationDialogComponent } from './confirmation-dialog/confirmation-dialog.component';

@NgModule({
    declarations: [SettingsComponent, ConfirmationDialogComponent],
    imports: [SharedModule],
    providers: [AuthService, StorageService],
    exports: [SettingsComponent]
})
export class SettingsModule {

}
