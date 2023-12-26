

import { AppRoutingModule } from 'src/app/app-routing.module';

import { NgModule } from '@angular/core';
import { initializeApp, provideFirebaseApp } from '@angular/fire/app';
import { getAuth, provideAuth } from '@angular/fire/auth';
import { AngularFireModule } from '@angular/fire/compat';
import { getDatabase, provideDatabase } from '@angular/fire/database';
import { getFirestore, provideFirestore } from '@angular/fire/firestore';
import { getMessaging, provideMessaging } from '@angular/fire/messaging';
import { getStorage, provideStorage } from '@angular/fire/storage';
import { AuthModule } from '@components/auth/auth.module';
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
import { AppComponent } from './app.component';

@NgModule({
	declarations: [
		AppComponent
	],
	imports: [
		AppRoutingModule,
		AngularFireModule,
		AuthModule,
		CreatePostDialogModule,
		FollowerDialogModule,
		HomeModule,
		MessengerModule,
		PostDetailsModule,
		SettingsModule,
		StoryPreviewModule,
		StreamModule,
		ToolbarModule,
		UserProfileModule,
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
