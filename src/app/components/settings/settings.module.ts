import { SharedModule } from 'src/app/shared/shared.module';

import { NgModule } from '@angular/core';
import { SettingsComponent } from '@components/settings/settings.component';
import { AuthService } from '@services/auth.service';
import { StorageService } from '@services/storage.service';

@NgModule({
    declarations: [SettingsComponent],
    imports: [SharedModule],
    providers: [AuthService, StorageService],
    exports: [SettingsComponent]
})
export class SettingsModule {

}
