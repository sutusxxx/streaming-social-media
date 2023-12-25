import { SharedModule } from 'src/app/shared/shared.module';

import { NgModule } from '@angular/core';
import { ExplorerModule } from '@components/explorer/explorer.module';
import { FeedModule } from '@components/feed/feed.module';
import { HomeComponent } from '@components/home/home.component';
import { StreamListModule } from '@components/stream-list/stream-list.module';
import { UserService } from '@services/user.service';

@NgModule({
    declarations: [HomeComponent],
    imports: [
        SharedModule,
        ExplorerModule,
        FeedModule,
        StreamListModule
    ],
    providers: [UserService],
    exports: [HomeComponent]
})
export class HomeModule {

}
