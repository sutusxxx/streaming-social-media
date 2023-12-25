import { SharedModule } from 'src/app/shared/shared.module';

import { NgModule } from '@angular/core';
import { SearchComponent } from '@components/search/search.component';
import { SearchService } from '@services/search.service';

@NgModule({
    declarations: [SearchComponent],
    imports: [SharedModule],
    providers: [SearchService],
    exports: [SearchComponent]
})
export class SearchModule {

}
