import { SharedModule } from 'src/app/shared/shared.module';

import { NgModule } from '@angular/core';
import { FollowerDialogComponent } from '@components/follower-dialog/follower-dialog.component';

@NgModule({
    declarations: [FollowerDialogComponent],
    imports: [SharedModule],
    exports: [FollowerDialogComponent]
})
export class FollowerDialogModule {

}
