import { SharedModule } from 'src/app/shared/shared.module';

import { NgModule } from '@angular/core';
import { StoryPreviewComponent } from '@components/story-preview/story-preview.component';
import { UserService } from '@services/user.service';

@NgModule({
    declarations: [StoryPreviewComponent],
    imports: [SharedModule],
    providers: [UserService],
    exports: [StoryPreviewComponent]
})
export class StoryPreviewModule {

}
