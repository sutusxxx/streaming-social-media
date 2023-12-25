import { SharedModule } from 'src/app/shared/shared.module';

import { NgModule } from '@angular/core';
import { CreatePostDialogComponent } from '@components/create-post-dialog/create-post-dialog.component';
import { PostService } from '@services/post.service';

@NgModule({
    declarations: [CreatePostDialogComponent],
    imports: [SharedModule],
    providers: [PostService],
    exports: [CreatePostDialogComponent]
})
export class CreatePostDialogModule {

}
