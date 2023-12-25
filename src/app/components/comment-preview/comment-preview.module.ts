import { SharedModule } from 'src/app/shared/shared.module';

import { NgModule } from '@angular/core';
import { CommentPreviewComponent } from '@components/comment-preview/comment-preview.component';
import { PostService } from '@services/post.service';

@NgModule({
    declarations: [CommentPreviewComponent],
    imports: [SharedModule],
    providers: [PostService],
    exports: [CommentPreviewComponent]
})
export class CommentPreviewModule {

}
