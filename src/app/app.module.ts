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
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatGridListModule } from '@angular/material/grid-list';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatListModule } from '@angular/material/list';
import { MatMenuModule } from '@angular/material/menu';
import { MatSelectModule } from '@angular/material/select';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatTabsModule } from '@angular/material/tabs';
import { MatToolbarModule } from '@angular/material/toolbar';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { LoginComponent } from '@components/auth/login/login.component';
import { RegistrationComponent } from '@components/auth/registration/registration.component';

import { environment } from '../environments/environment';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { CommentComponent } from './components/comment/comment.component';
import { CreatePostDialogComponent } from './components/create-post-dialog/create-post-dialog.component';
import { FeedComponent } from './components/feed/feed.component';
import { FollowerDialogComponent } from './components/follower-dialog/follower-dialog.component';
import { ForgotPasswordDialogComponent } from './components/forgot-password-dialog/forgot-password-dialog.component';
import { HomeComponent } from './components/home/home.component';
import { MessengerComponent } from './components/messenger/messenger.component';
import { NotificationsComponent } from './components/notifications/notifications.component';
import { PostComponent } from './components/post/post.component';
import { SearchComponent } from './components/search/search.component';
import { RoomComponent } from './components/stream/room/room.component';
import { StreamListComponent } from './components/stream/stream-list/stream-list.component';
import { ToolbarComponent } from './components/toolbar/toolbar.component';
import { UserProfileComponent } from './components/user-profile/user-profile.component';
import { DatePipe } from './pipes/date.pipe';
import { ViewRoomComponent } from './components/stream/view-room/view-room.component';
import { LiveChatComponent } from './components/stream/live-chat/live-chat.component';
import { PostDetailsComponent } from './components/post-details/post-details.component';
import { PostGridComponent } from './components/post-grid/post-grid.component';
import { ExplorerComponent } from './components/explorer/explorer.component';
import { StoryPreviewComponent } from './components/story-preview/story-preview.component';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { PastTimePipe } from './pipes/past-time.pipe';
import { InfiniteScrollModule } from 'ngx-infinite-scroll';
import { ScrollableDirective } from './directives/scrollable.directive';
import { LoadingSpinnerComponent } from './components/loading-spinner/loading-spinner.component';

@NgModule({
	declarations: [
		AppComponent,
		LoginComponent,
		RegistrationComponent,
		DatePipe,
		HomeComponent,
		SearchComponent,
		UserProfileComponent,
		ToolbarComponent,
		MessengerComponent,
		FollowerDialogComponent,
		RoomComponent,
		StreamListComponent,
		FeedComponent,
		CreatePostDialogComponent,
		PostComponent,
		CommentComponent,
		ForgotPasswordDialogComponent,
		NotificationsComponent,
		ViewRoomComponent,
		LiveChatComponent,
		PostDetailsComponent,
		PostGridComponent,
		ExplorerComponent,
		StoryPreviewComponent,
		PastTimePipe,
		ScrollableDirective,
		LoadingSpinnerComponent
	],
	imports: [
		AngularFireModule,
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
		InfiniteScrollModule,
		provideFirebaseApp(() => initializeApp(environment.firebase)),
		provideAuth(() => getAuth()),
		provideStorage(() => getStorage()),
		provideDatabase(() => getDatabase()),
		provideFirestore(() => getFirestore()),
		provideMessaging(() => getMessaging()),
	],
	providers: [DatePipe],
	bootstrap: [AppComponent]
})
export class AppModule { }
