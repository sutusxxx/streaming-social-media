import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { canActivate, redirectUnauthorizedTo, redirectLoggedInTo } from '@angular/fire/auth-guard';
import { LoginComponent } from '@components/auth/login/login.component';
import { RegistrationComponent } from '@components/auth/registration/registration.component';
import { HomeComponent } from '@components/home/home.component';
import { UserProfileComponent } from '@components/user-profile/user-profile.component';
import { MessengerComponent } from '@components/messenger/messenger.component';

const redirectToLogin = () => redirectUnauthorizedTo(['login']);
const redirectToHome = () => redirectLoggedInTo(['home']);

const routes: Routes = [
  { path: 'login', component: LoginComponent, ...canActivate(redirectToHome) },
  { path: 'registration', component: RegistrationComponent, ...canActivate(redirectToHome) },
  { path: 'profile', component: UserProfileComponent, ...canActivate(redirectToLogin) },
  { path: 'messages', component: MessengerComponent, ...canActivate(redirectToLogin) },
  { path: 'home', component: HomeComponent, ...canActivate(redirectToLogin) },
  { path: '', redirectTo: 'home', pathMatch: 'full' }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
