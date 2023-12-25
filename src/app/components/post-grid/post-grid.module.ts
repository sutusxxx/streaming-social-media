import { SharedModule } from 'src/app/shared/shared.module';

import { NgModule } from '@angular/core';
import { PostGridComponent } from '@components/post-grid/post-grid.component';

@NgModule({
    declarations: [PostGridComponent],
    imports: [SharedModule],
    exports: [PostGridComponent]
})
export class PostGridModule {

}
