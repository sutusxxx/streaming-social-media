import { SharedModule } from 'src/app/shared/shared.module';

import { NgModule } from '@angular/core';
import { NotificationsModule } from '@components/notifications/notifications.module';
import { SearchModule } from '@components/search/search.module';
import { ToolbarComponent } from '@components/toolbar/toolbar.component';
import { UserService } from '@services/user.service';

@NgModule({
    declarations: [ToolbarComponent],
    imports: [
        SharedModule,
        NotificationsModule,
        SearchModule
    ],
    providers: [UserService],
    exports: [ToolbarComponent]
})
export class ToolbarModule {

}
