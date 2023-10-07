import { NgModule } from '@angular/core';
import { canActivate, redirectLoggedInTo, redirectUnauthorizedTo } from '@angular/fire/auth-guard';
import { RouterModule, Routes } from '@angular/router';
import { LoginComponent } from '@components/auth/login/login.component';
import { RegistrationComponent } from '@components/auth/registration/registration.component';
import { HomeComponent } from '@components/home/home.component';
import { MessengerComponent } from '@components/messenger/messenger.component';
import { StreamingComponent } from '@components/streaming/streaming.component';
import { UserProfileComponent } from '@components/user-profile/user-profile.component';

const redirectToLogin = () => redirectUnauthorizedTo(['login']);
const redirectToHome = () => redirectLoggedInTo(['home']);

const routes: Routes = [
  { path: 'login', component: LoginComponent, ...canActivate(redirectToHome) },
  { path: 'registration', component: RegistrationComponent, ...canActivate(redirectToHome) },
  { path: 'profile', component: UserProfileComponent, ...canActivate(redirectToLogin) },
  { path: 'messages', component: MessengerComponent, ...canActivate(redirectToLogin) },
  { path: 'broadcast', component: StreamingComponent, ...canActivate(redirectToLogin) },
  { path: 'home', component: HomeComponent, ...canActivate(redirectToLogin) },
  { path: '', redirectTo: 'home', pathMatch: 'full' }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
