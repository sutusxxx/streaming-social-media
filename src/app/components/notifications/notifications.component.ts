import { INotification } from 'src/app/shared/interfaces/notification.interface';

import { Component, Input, OnInit } from '@angular/core';

@Component({
	selector: 'notifications',
	templateUrl: './notifications.component.html',
	styleUrls: ['./notifications.component.css']
})
export class NotificationsComponent implements OnInit {
	@Input() notifications: INotification[] | null = null;

	constructor() { }

	ngOnInit(): void {
	}

}
