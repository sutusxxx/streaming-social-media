import { SharedModule } from 'src/app/shared/shared.module';

import { NgModule } from '@angular/core';
import { PostGridModule } from '@components/post-grid/post-grid.module';
import { UserProfileComponent } from '@components/user-profile/user-profile.component';
import { UserSettingsModule } from '@components/user-settings/user-settings.module';
import { AuthService } from '@services/auth.service';

@NgModule({
    declarations: [
        UserProfileComponent
    ],
    imports: [
        SharedModule,
        PostGridModule,
        UserSettingsModule
    ],
    providers: [AuthService],
    exports: [UserProfileComponent]
})
export class UserProfileModule {

}
