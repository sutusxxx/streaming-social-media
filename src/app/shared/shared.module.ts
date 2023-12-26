import { AppRoutingModule } from 'src/app/app-routing.module';
import { ScrollableDirective } from 'src/app/shared/directives/scrollable.directive';
import { DatePipe } from 'src/app/shared/pipes/date.pipe';
import { PastTimePipe } from 'src/app/shared/pipes/past-time.pipe';

import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatBadgeModule } from '@angular/material/badge';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatNativeDateModule } from '@angular/material/core';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatDialogModule } from '@angular/material/dialog';
import { MatDividerModule } from '@angular/material/divider';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatGridListModule } from '@angular/material/grid-list';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatListModule } from '@angular/material/list';
import { MatMenuModule } from '@angular/material/menu';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatSelectModule } from '@angular/material/select';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatTabsModule } from '@angular/material/tabs';
import { MatToolbarModule } from '@angular/material/toolbar';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { LoadingSpinnerModule } from '@components/loading-spinner/loading-spinner.module';
import { TranslateModule } from '@ngx-translate/core';

@NgModule({
    declarations: [
        PastTimePipe,
        DatePipe,
        ScrollableDirective
    ],
    imports: [
        CommonModule,
        BrowserModule,
        AppRoutingModule,
        BrowserAnimationsModule,
        ReactiveFormsModule,
        FormsModule,
        MatToolbarModule,
        MatIconModule,
        MatButtonModule,
        MatFormFieldModule,
        MatInputModule,
        MatAutocompleteModule,
        MatMenuModule,
        MatListModule,
        MatDividerModule,
        MatSnackBarModule,
        MatDialogModule,
        MatTabsModule,
        MatSelectModule,
        MatDatepickerModule,
        MatNativeDateModule,
        MatCardModule,
        MatGridListModule,
        MatBadgeModule,
        MatProgressBarModule,
        MatExpansionModule,
        MatSlideToggleModule,
        TranslateModule,
        LoadingSpinnerModule
    ],
    exports: [
        CommonModule,
        BrowserModule,
        AppRoutingModule,
        BrowserAnimationsModule,
        ReactiveFormsModule,
        FormsModule,
        MatToolbarModule,
        MatIconModule,
        MatButtonModule,
        MatFormFieldModule,
        MatInputModule,
        MatAutocompleteModule,
        MatMenuModule,
        MatListModule,
        MatDividerModule,
        MatSnackBarModule,
        MatDialogModule,
        MatTabsModule,
        MatSelectModule,
        MatDatepickerModule,
        MatNativeDateModule,
        MatCardModule,
        MatGridListModule,
        MatBadgeModule,
        MatProgressBarModule,
        MatExpansionModule,
        MatSlideToggleModule,
        TranslateModule,
        DatePipe,
        PastTimePipe,
        ScrollableDirective,
        LoadingSpinnerModule
    ],
})
export class SharedModule {

}
