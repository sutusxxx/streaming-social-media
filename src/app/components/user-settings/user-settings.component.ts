import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { BaseComponent } from '@components/base/base.component';
import { UserService } from '@services/user.service';
import { PATH } from 'src/app/constants/path.constant';
import { passwordValidator } from 'src/app/validators/password-validator';

import { takeUntil } from 'rxjs';
import { Router } from '@angular/router';
import { RouterHelper } from 'src/app/helpers/router.helper';

@Component({
	selector: 'app-user-settings',
	templateUrl: './user-settings.component.html',
	styleUrls: ['./user-settings.component.css']
})
export class UserSettingsComponent extends BaseComponent implements OnInit {
	settingsForm: FormGroup | null = null;

	id: string | null = null;
	email: string | null = null;
	username: string | null = null;

	genders: string[] = [
		'male',
		'female'
	];

	PATH = PATH;

	constructor(
		private readonly userService: UserService,
		private readonly router: Router
	) {
		super();
	}

	ngOnInit(): void {
		this.userService.currentUser$
			.pipe(takeUntil(this._unsubscribeAll))
			.subscribe(user => {
				this.settingsForm = new FormGroup({
					fullName: new FormControl(user?.fullName),
					gender: new FormControl(user?.gender),
					dateOfBirth: new FormControl(user?.dateOfBirth)
				}, { validators: passwordValidator() });
				this.id = user?.uid || null;
				this.email = user?.email || null;
				this.username = user?.displayName || null;
			});
	}

	navigateToUserProfile(): void {
		if (this.id) RouterHelper.navigateToUserProfile(this.id, this.router);
	}

	get fullName() {
		return this.settingsForm?.get('fullName');
	}

	get password() {
		return this.settingsForm?.get('password');
	}

	get confirmPassword() {
		return this.settingsForm?.get('confirmPassword');
	}

	get dateOfBirth() {
		return this.settingsForm?.get('dateOfBirth');
	}

	get gender() {
		return this.settingsForm?.get('gender');
	}
}
