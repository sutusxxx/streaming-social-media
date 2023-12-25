import { SharedModule } from 'src/app/shared/shared.module';

import { NgModule } from '@angular/core';
import { CommentModule } from '@components/comment/coment.module';
import { PostDetailsComponent } from '@components/post-details/post-details.component';
import { PostModule } from '@components/post/post.module';
import { PostService } from '@services/post.service';

@NgModule({
    declarations: [PostDetailsComponent],
    imports: [
        SharedModule,
        CommentModule,
        PostModule
    ],
    providers: [PostService],
    exports: [PostDetailsComponent]
})
export class PostDetailsModule {

}
