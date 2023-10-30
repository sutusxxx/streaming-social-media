import { filter, map } from 'rxjs';
import { PATH } from 'src/app/constants/path.constant';

import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '@services/auth.service';
import { UserService } from '@services/user.service';

@Component({
	selector: 'app-toolbar',
	templateUrl: './toolbar.component.html',
	styleUrls: ['./toolbar.component.css']
})
export class ToolbarComponent implements OnInit {
	currentUser$ = this.userService.currentUser$;
	notifications$ = this.userService.notifications$;
	unreadNotificationCounter$ = this.notifications$.pipe(
		map(notifications => notifications
			.filter(notification => !notification.read)
			.length
		)
	);

	readonly PATH = PATH;

	constructor(
		private readonly authService: AuthService,
		private readonly userService: UserService,
		private readonly router: Router
	) { }

	ngOnInit(): void {
	}

	logout() {
		this.authService.logout()
			.subscribe(() => {
				this.router.navigate([PATH.LOGIN]);
			});
	}

	setUnreadNotifications(): void {
		console.log('karcsi')
	}

	navigateToMessages(): void {
		this.router.navigate([PATH.MESSAGES]);
	}

	navigateToUserProfile(userId: string): void {
		this.router.navigate([PATH.PROFILE], { queryParams: { id: userId } });
	}
}
