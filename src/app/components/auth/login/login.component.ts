import { UserCredential } from 'firebase/auth';
import { catchError, concatMap, Observable, of, take } from 'rxjs';
import { AuthService } from 'src/app/services/auth.service';
import { PATH } from 'src/app/shared/constants/path.constant';
import { User } from 'src/app/shared/models';

import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { ForgotPasswordDialogComponent } from '@components/forgot-password-dialog/forgot-password-dialog.component';
import { UserService } from '@services/user.service';

@Component({
	selector: 'login',
	templateUrl: './login.component.html',
	styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {

	loginForm = new FormGroup({
		email: new FormControl('', [Validators.required, Validators.email]),
		password: new FormControl('', Validators.required)
	});

	isForgotPasswordEmailSent: boolean = false;
	forgotPasswordEmail?: string;

	isPasswordVisible: boolean = false;

	readonly PATH = PATH;

	constructor(
		public dialog: MatDialog,
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
			take(1),
			catchError(error => {
				this.loginForm.setErrors({ 'userNotFound': true });
				return of(error);
			})
		).subscribe(() => {
			this.router.navigate(['home']);
		});
	}

	signInWithGoogle(): void {
		this.authService.signInWithGoogle().pipe(
			take(1),
			concatMap(async userData =>
				await this.saveUserIfNotExists(userData)
			)
		).subscribe(() => {
			this.router.navigate(['home']);
		});
	}

	signInWithFacebook(): void {
		this.authService.signInWithFacebook().pipe(
			take(1),
			concatMap(async userData =>
				await this.saveUserIfNotExists(userData)
			)
		).subscribe(() => {
			this.router.navigate(['home']);
		});
	}

	async saveUserIfNotExists(userData: UserCredential): Promise<Observable<void>> {
		const user = userData.user;
		if (!user.email) throw Error('Something went wrong!');

		const displayName = await this.userService.generateUsername(user.displayName ?? undefined);
		const createUser = new User(user.uid, {
			displayName,
			fullName: user.displayName ?? '',
			email: user.email,
			photoURL: user.photoURL ?? ''
		});
		return this.userService.createUserIfNotExists(createUser);
	}

	openForgotPasswordDialog(): void {
		const dialogRef = this.dialog.open(ForgotPasswordDialogComponent, { width: '400px' });
		dialogRef.afterClosed().subscribe(email => {
			if (email) {
				this.forgotPasswordEmail = email;
				this.isForgotPasswordEmailSent = true;
			}
		});
	}

	togglePasswordVisibility(event: Event): void {
		event.stopPropagation();
		this.isPasswordVisible = !this.isPasswordVisible;
	}

	get email() {
		return this.loginForm.get('email');
	}

	get password() {
		return this.loginForm.get('password');
	}
}
