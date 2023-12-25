import { SharedModule } from 'src/app/shared/shared.module';

import { NgModule } from '@angular/core';
import { CommentComponent } from '@components/comment/comment.component';
import { PostService } from '@services/post.service';

@NgModule({
    declarations: [CommentComponent],
    imports: [SharedModule],
    providers: [PostService],
    exports: [CommentComponent]
})
export class CommentModule {

}
