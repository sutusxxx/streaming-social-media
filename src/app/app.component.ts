import { takeUntil } from 'rxjs';

import { Component, OnInit } from '@angular/core';
import { NavigationStart, Router } from '@angular/router';
import { BaseComponent } from '@components/base/base.component';
import { TranslateService } from '@ngx-translate/core';
import { TranslationLoaderService } from '@services/translation-loader.service';
import { LanguageKeyEnum } from './enums/language-key.enum';

import { hungarian } from '../assets/i18n/hu';
import { english } from '../assets/i18n/en';

@Component({
	selector: 'app-root',
	templateUrl: './app.component.html',
	styleUrls: ['./app.component.css']
})
export class AppComponent extends BaseComponent implements OnInit {
	constructor(
		private readonly router: Router,
		private readonly translateService: TranslateService,
		private readonly translationLoaderService: TranslationLoaderService
	) {
		super();
		this.translateService.addLangs([LanguageKeyEnum.EN, LanguageKeyEnum.HU]);
		this.translationLoaderService.loadTranslations(english, hungarian);
		this.translateService.setDefaultLang(LanguageKeyEnum.HU);
		this.setLanguageByNavigator();
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
