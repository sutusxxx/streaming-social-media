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
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule } from '@angular/material/dialog';
import { MatDividerModule } from '@angular/material/divider';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatListModule } from '@angular/material/list';
import { MatMenuModule } from '@angular/material/menu';
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
import { FollowerDialogComponent } from './components/follower-dialog/follower-dialog.component';
import { HomeComponent } from './components/home/home.component';
import { MessengerComponent } from './components/messenger/messenger.component';
import { RoomComponent } from './components/room/room.component';
import { SearchComponent } from './components/search/search.component';
import { ToolbarComponent } from './components/toolbar/toolbar.component';
import { UserProfileComponent } from './components/user-profile/user-profile.component';
import { DatePipe } from './pipes/date.pipe';

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
		RoomComponent
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
