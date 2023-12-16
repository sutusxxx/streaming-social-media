import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { TranslateService } from '@ngx-translate/core';
import { AuthService } from '@services/auth.service';
import { LanguageKeyEnum } from 'src/app/enums/language-key.enum';
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

	selectedLanguage: LanguageKeyEnum | null = null;
	languages: LanguageKeyEnum[] = [LanguageKeyEnum.EN, LanguageKeyEnum.HU]

	constructor(
		private readonly authService: AuthService,
		private translateService: TranslateService
	) { }

	ngOnInit(): void {
		this.selectedLanguage = this.translateService.getDefaultLang() as LanguageKeyEnum;
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
