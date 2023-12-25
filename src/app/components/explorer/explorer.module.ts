import { SharedModule } from 'src/app/shared/shared.module';

import { NgModule } from '@angular/core';
import { ExplorerComponent } from '@components/explorer/explorer.component';
import { PostGridModule } from '@components/post-grid/post-grid.module';
import { PostService } from '@services/post.service';

@NgModule({
    declarations: [ExplorerComponent],
    imports: [
        SharedModule,
        PostGridModule
    ],
    providers: [PostService],
    exports: [ExplorerComponent]
})
export class ExplorerModule {

}
