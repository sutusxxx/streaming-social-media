import { Component, OnInit } from '@angular/core';
import { AbstractControl, FormControl, FormGroup, ValidatorFn, Validators } from '@angular/forms';
import { AuthService } from '@services/auth.service';
import { passwordValidator } from 'src/app/validators/password-validator';

@Component({
	selector: 'app-settings',
	templateUrl: './settings.component.html',
	styleUrls: ['./settings.component.css']
})
export class SettingsComponent implements OnInit {
	passwordForm: FormGroup = new FormGroup({
		password: new FormControl('', Validators.required),
		confirmPassword: new FormControl('', Validators.required)
	}, { validators: passwordValidator() });

	constructor(private readonly authService: AuthService) { }

	ngOnInit(): void {
	}

	savePassword(): void {
		if (this.passwordForm.invalid) return;
		const newPassword = this.password?.value;
		if (!newPassword) return;

		this.authService.updateUserPassword(newPassword).subscribe();
	}

	get password() {
		return this.passwordForm.get('password');
	}

	get confirmPassword() {
		return this.passwordForm.get('confirmPassword');
	}
}
