import { SharedModule } from 'src/app/shared/shared.module';

import { NgModule } from '@angular/core';
import { CommentPreviewModule } from '@components/comment-preview/comment-preview.module';
import { PostComponent } from '@components/post/post.component';
import { PostService } from '@services/post.service';

@NgModule({
    declarations: [PostComponent],
    imports: [
        SharedModule,
        CommentPreviewModule
    ],
    providers: [PostService],
    exports: [PostComponent]
})
export class PostModule {

}
