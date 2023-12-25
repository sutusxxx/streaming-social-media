import { SharedModule } from 'src/app/shared/shared.module';

import { NgModule } from '@angular/core';
import { NotificationsComponent } from '@components/notifications/notifications.component';

@NgModule({
    declarations: [NotificationsComponent],
    imports: [SharedModule],
    providers: [],
    exports: [NotificationsComponent]
})
export class NotificationsModule {

}
