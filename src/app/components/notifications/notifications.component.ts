import { INotification } from 'src/app/interfaces/notification.interface';

import { Component, Input, OnInit } from '@angular/core';

@Component({
	selector: 'app-notifications',
	templateUrl: './notifications.component.html',
	styleUrls: ['./notifications.component.css']
})
export class NotificationsComponent implements OnInit {
	@Input() notifications: INotification[] | null = null;

	constructor() { }

	ngOnInit(): void {
	}

}