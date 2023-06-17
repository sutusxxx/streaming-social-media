export class DateFormatHelper {
    static getFullDate(date: Date): string {
        return date.getFullYear() + "/" + date.getMonth() + "/" + date.getDay();
    }

    static getMonthAndDay(date: Date): string {
        const month = date.getMonth() + 1;
        const day = date.getDay();
        return ((month < 10) ? (0 + '' + month) : month) + '/' + ((day < 10) ? (0 + '' + day) : day);
    }

    static getHoursAndMinutes(date: Date): string {
        const hours = date.getHours();
        const minutes = date.getMinutes();
        return ((hours < 10) ? (0 + '' + hours) : hours) + ':' + ((minutes < 10) ? (0 + '' + minutes) : minutes);
    }
}