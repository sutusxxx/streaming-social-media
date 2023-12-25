import { takeUntil } from 'rxjs';

import { Component, OnInit } from '@angular/core';
import { NavigationStart, Router } from '@angular/router';
import { BaseComponent } from '@components/base/base.component';
import { TranslateService } from '@ngx-translate/core';
import { StorageService } from '@services/storage.service';
import { TranslationLoaderService } from '@services/translation-loader.service';

import { english } from '../assets/i18n/en';
import { hungarian } from '../assets/i18n/hu';
import { LanguageKeyEnum } from './shared/enums/language-key.enum';

@Component({
	selector: 'app-root',
	templateUrl: './app.component.html',
	styleUrls: ['./app.component.css']
})
export class AppComponent extends BaseComponent implements OnInit {
	constructor(
		private readonly router: Router,
		private readonly translateService: TranslateService,
		private readonly translationLoaderService: TranslationLoaderService,
		private readonly storageService: StorageService
	) {
		super();
		this.translateService.addLangs([LanguageKeyEnum.EN, LanguageKeyEnum.HU]);
		this.translationLoaderService.loadTranslations(english, hungarian);
		this.translateService.setDefaultLang(LanguageKeyEnum.HU);
		this.setLanguage();
	}

	setLanguage(): void {
		const storedLanguage = this.storageService.getItem('language');

		if (storedLanguage) {
			this.translateService.setDefaultLang(storedLanguage);
		} else {
			this.setLanguageByNavigator();
		}
	}

	setLanguageByNavigator(): void {
		if (navigator && navigator.language &&
			(navigator.language === LanguageKeyEnum.EN || navigator.language === LanguageKeyEnum.HU)
		) {
			this.translateService.use(navigator.language);
		}
	}

	ngOnInit(): void {
		this.router.events.pipe(takeUntil(this._unsubscribeAll)).subscribe(event => {
			if (event instanceof NavigationStart) {
				const browserRefresh = !this.router.navigated;
				if (browserRefresh) {
					console.log(this.router.getCurrentNavigation());
				}
			}
		});
	}
}
