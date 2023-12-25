import { InfiniteScrollModule } from 'ngx-infinite-scroll';

import { NgModule } from '@angular/core';
import { initializeApp, provideFirebaseApp } from '@angular/fire/app';
import { getAuth, provideAuth } from '@angular/fire/auth';
import { AngularFireModule } from '@angular/fire/compat';
import { getDatabase, provideDatabase } from '@angular/fire/database';
import { getFirestore, provideFirestore } from '@angular/fire/firestore';
import { getMessaging, provideMessaging } from '@angular/fire/messaging';
import { getStorage, provideStorage } from '@angular/fire/storage';
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
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { AuthModule } from '@components/auth/auth.module';
import { CommentModule } from '@components/comment/coment.module';
import { CreatePostDialogModule } from '@components/create-post-dialog/create-post-dialog.module';
import { FollowerDialogModule } from '@components/follower-dialog/follower-dialog.module';
import { HomeModule } from '@components/home/home.module';
import { MessengerModule } from '@components/messenger/messenger.module';
import { PostDetailsModule } from '@components/post-details/post-details.module';
import { SettingsModule } from '@components/settings/settings.module';
import { StoryPreviewModule } from '@components/story-preview/story-preview.module';
import { StreamModule } from '@components/stream/stream.module';
import { ToolbarModule } from '@components/toolbar/toolbar.module';
import { UserProfileModule } from '@components/user-profile/user-profile.module';
import { TranslateModule } from '@ngx-translate/core';

import { environment } from '../environments/environment';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';

@NgModule({
	declarations: [
		AppComponent
	],
	imports: [
		AngularFireModule,
		BrowserModule,
		AppRoutingModule,
		BrowserAnimationsModule,
		ReactiveFormsModule,
		FormsModule,
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
		InfiniteScrollModule,
		MatSlideToggleModule,
		AuthModule,
		CommentModule,
		CreatePostDialogModule,
		HomeModule,
		StoryPreviewModule,
		ToolbarModule,
		PostDetailsModule,
		UserProfileModule,
		FollowerDialogModule,
		MessengerModule,
		SettingsModule,
		StreamModule,
		TranslateModule.forRoot(),
		provideFirebaseApp(() => initializeApp(environment.firebase)),
		provideAuth(() => getAuth()),
		provideStorage(() => getStorage()),
		provideDatabase(() => getDatabase()),
		provideFirestore(() => getFirestore()),
		provideMessaging(() => getMessaging()),
	],
	bootstrap: [AppComponent]
})
export class AppModule { }
