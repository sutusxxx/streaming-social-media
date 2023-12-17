import { Pipe, PipeTransform } from '@angular/core';
import { Timestamp } from '@angular/fire/firestore';
import { DateFormatHelper } from '../helpers/date-format.helper';

@Pipe({
	name: 'date'
})
export class DatePipe implements PipeTransform {

	transform(value: Timestamp | undefined, type?: string): string | undefined {
		if (!value) return;

		const date = value.toDate();
		const now = new Date();

		if (type === 'fullDate') {
			const year = date.getFullYear();
			const month = ('0' + (date.getMonth() + 1)).slice(-2);
			const day = ('0' + date.getDate()).slice(-2);

			return `${year}.${month}.${day}`;
		}

		if (date.getFullYear() !== now.getFullYear()) {
			return DateFormatHelper.getFullDate(date);
		}

		if (date.getMonth() === now.getMonth() && date.getDay() === now.getDay()) {
			return DateFormatHelper.getHoursAndMinutes(date);
		}

		return DateFormatHelper.getMonthAndDay(date);
	}
}
