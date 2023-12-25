import { SharedModule } from 'src/app/shared/shared.module';

import { NgModule } from '@angular/core';
import { MessengerComponent } from '@components/messenger/messenger.component';
import { MessengerService } from '@services/messenger.service';

@NgModule({
    declarations: [MessengerComponent],
    imports: [SharedModule],
    providers: [MessengerService],
    exports: [MessengerComponent]
})
export class MessengerModule {

}
