import { SharedModule } from 'src/app/shared/shared.module';

import { NgModule } from '@angular/core';
import { FeedComponent } from '@components/feed/feed.component';
import { PostModule } from '@components/post/post.module';
import { PostService } from '@services/post.service';

@NgModule({
    declarations: [FeedComponent],
    imports: [
        SharedModule,
        PostModule
    ],
    providers: [PostService],
    exports: [FeedComponent]
})
export class FeedModule {

}
