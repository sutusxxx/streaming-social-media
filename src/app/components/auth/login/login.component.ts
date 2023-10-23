import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { UserService } from '@services/user.service';
import { catchError, concatMap, of, throwError } from 'rxjs';
import { PATH } from 'src/app/constants/path.constant';
import { User } from 'src/app/models';
import { AuthService } from 'src/app/services/auth.service';

@Component({
	selector: 'app-login',
	templateUrl: './login.component.html',
	styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {

	loginForm = new FormGroup({
		email: new FormControl('', [Validators.required, Validators.email]),
		password: new FormControl('', Validators.required)
	});

	readonly PATH = PATH;

	constructor(
		private readonly authService: AuthService,
		private readonly userService: UserService,
		private readonly router: Router
	) { }

	ngOnInit(): void {

	}

	login(): void {
		if (!this.loginForm.valid) return;

		const { email, password } = this.loginForm.value;
		this.authService.login(email, password).pipe(
			catchError(error => {
				this.loginForm.setErrors({ 'userNotFound': true });
				return of(error);
			})
		)
			.subscribe(() => {
				this.router.navigate(['home']);
			});
	}

	signInWithGoogle(): void {
		this.authService.signInWithGoogle().pipe(
			concatMap(userData => {
				const user = userData.user;
				if (!user.email || !user.displayName) throw Error('Something went wrong!');

				return this.userService.createUser({ uid: user.uid, displayName: user.displayName, email: user.email, photoURL: user.photoURL ?? '' });
			})
		)
			.subscribe(() => {
				this.router.navigate(['home']);
			});
	}

	signInWithFacebook(): void {
		this.authService.signInWithFacebook().pipe(
			concatMap(userData => {
				const user = userData.user;
				if (!user.email || !user.displayName) throw Error('Something went wrong!');

				return this.userService.createUser({ uid: user.uid, displayName: user.displayName, email: user.email, photoURL: user.photoURL ?? '' });
			})
		)
			.subscribe(() => {
				this.router.navigate(['home']);
			});
	}

	get email() {
		return this.loginForm.get('email');
	}

	get password() {
		return this.loginForm.get('password');
	}
}
