import { concatMap, switchMap, throwError } from 'rxjs';
import { AuthService } from 'src/app/services/auth.service';
import { UserService } from 'src/app/services/user.service';
import { PATH } from 'src/app/shared/constants/path.constant';
import { User, UserRegistration } from 'src/app/shared/models';
import { passwordValidator } from 'src/app/validators/password-validator';

import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';

@Component({
	selector: 'registration',
	templateUrl: './registration.component.html',
	styleUrls: ['./registration.component.css']
})
export class RegistrationComponent implements OnInit {
	registrationForm = new FormGroup({
		displayName: new FormControl('', [Validators.required, Validators.pattern('^[a-zA-Z0-9]*$')]),
		fullName: new FormControl(''),
		email: new FormControl('', [Validators.required, Validators.email]),
		password: new FormControl('', Validators.required),
		confirmPassword: new FormControl('', Validators.required),
		gender: new FormControl(''),
		dateOfBirth: new FormControl('')
	}, { validators: passwordValidator() });

	genders: string[] = [
		'male',
		'female'
	];

	PATH = PATH;

	constructor(
		private readonly authService: AuthService,
		private readonly userService: UserService,
		private readonly router: Router
	) { }

	ngOnInit(): void {
	}

	registration(): void {
		if (!this.registrationForm.valid) return;

		const registration = new UserRegistration(this.registrationForm.value);
		this.userService.checkUsernameAvailability(registration.displayName).pipe(
			concatMap(validity => {
				if (!validity) {
					this.registrationForm.setErrors({ 'usernameOccupied': true });
					return throwError(() => 'Username occupied!');
				}
				return this.authService.registration(registration.email, registration.password);
			}),
			switchMap(({ user: { uid } }) => {
				const user = User.fromRegistration(uid, registration);
				return this.userService.createUser(user);
			}))
			.subscribe(() => this.router.navigate(['/home']));
	}

	get displayName() {
		return this.registrationForm.get('displayName');
	}

	get fullName() {
		return this.registrationForm.get('fullName');
	}

	get email() {
		return this.registrationForm.get('email');
	}

	get password() {
		return this.registrationForm.get('password');
	}

	get confirmPassword() {
		return this.registrationForm.get('confirmPassword');
	}

	get dateOfBirth() {
		return this.registrationForm.get('dateOfBirth');
	}

	get gender() {
		return this.registrationForm.get('gender');
	}
}
