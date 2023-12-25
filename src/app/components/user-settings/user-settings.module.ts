import { SharedModule } from 'src/app/shared/shared.module';

import { NgModule } from '@angular/core';
import { UserSettingsComponent } from '@components/user-settings/user-settings.component';
import { UserService } from '@services/user.service';

@NgModule({
    declarations: [UserSettingsComponent],
    imports: [SharedModule],
    providers: [UserService],
    exports: [UserSettingsComponent]
})
export class UserSettingsModule {

}
