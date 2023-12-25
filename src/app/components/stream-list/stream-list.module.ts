import { SharedModule } from 'src/app/shared/shared.module';

import { NgModule } from '@angular/core';
import { StreamListComponent } from '@components/stream-list/stream-list.component';
import { StreamService } from '@services/stream.service';

@NgModule({
    declarations: [StreamListComponent],
    imports: [SharedModule],
    providers: [StreamService],
    exports: [StreamListComponent]
})
export class StreamListModule {

}
