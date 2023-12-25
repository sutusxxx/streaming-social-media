import { SharedModule } from 'src/app/shared/shared.module';

import { NgModule } from '@angular/core';
import { LiveChatComponent } from '@components/stream/live-chat/live-chat.component';
import { RoomComponent } from '@components/stream/room/room.component';
import { ViewRoomComponent } from '@components/stream/view-room/view-room.component';
import { StreamService } from '@services/stream.service';

@NgModule({
    declarations: [
        LiveChatComponent,
        RoomComponent,
        ViewRoomComponent,
    ],
    imports: [SharedModule],
    providers: [StreamService],
    exports: [
        LiveChatComponent,
        RoomComponent,
        ViewRoomComponent,
    ]
})
export class StreamModule {

}
