import { Component, OnInit } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';

import { LanguageKeyEnum } from '../../enums/language-key.enum';

@Component({
	selector: 'app-settings',
	templateUrl: './settings.component.html',
	styleUrls: ['./settings.component.css']
})
export class SettingsComponent implements OnInit {
	panelOpenState = false;
	selectedLanguage: LanguageKeyEnum | null = null;

	readonly languages = [LanguageKeyEnum.EN, LanguageKeyEnum.HU];

	constructor(
		private translateService: TranslateService
	) { }

	ngOnInit(): void {
		this.selectedLanguage = this.translateService.getDefaultLang() as LanguageKeyEnum;
	}

}
