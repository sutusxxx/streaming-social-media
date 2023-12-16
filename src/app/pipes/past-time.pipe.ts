import { Pipe, PipeTransform } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { Timestamp } from 'firebase/firestore';

@Pipe({
	name: 'pastTime'
})
export class PastTimePipe implements PipeTransform {

	constructor(private readonly translateService: TranslateService) {
	}

	transform(value: Timestamp | undefined): string | undefined {
		if (!value) return;

		const seconds = Math.floor((Date.now() - value.toMillis()) / 1000);

		const intervals: any = {
			year: 31536000,
			month: 2592000,
			week: 604800,
			day: 86400,
			hour: 3600,
			minute: 60,
		};

		let counter;
		for (const interval in intervals) {
			if (intervals.hasOwnProperty(interval)) {
				counter = Math.floor(seconds / intervals[interval]);

				if (counter > 0) {
					const translatedInterval = this.translateService.instant(interval);
					return `${counter}${translatedInterval.charAt(0)}`;
				}
			}
		}

		return this.translateService.instant('justNow');
	}

}
