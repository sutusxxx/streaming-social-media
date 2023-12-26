import { take, takeUntil } from 'rxjs';
import { PATH } from 'src/app/shared/constants/path.constant';
import { RouterHelper } from 'src/app/shared/helpers/router.helper';
import { INotification } from 'src/app/shared/interfaces/notification.interface';

import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { BaseComponent } from '@components/base/base.component';
import { AuthService } from '@services/auth.service';
import { UserService } from '@services/user.service';

@Component({
	selector: 'toolbar',
	templateUrl: './toolbar.component.html',
	styleUrls: ['./toolbar.component.css']
})
export class ToolbarComponent extends BaseComponent implements OnInit {
	currentUser$ = this.userService.currentUser$;
	notifications$ = this.userService.notifications$;
	unreadNotifications: INotification[] = [];
	showBadge: boolean = false;

	readonly PATH = PATH;

	constructor(
		private readonly authService: AuthService,
		private readonly userService: UserService,
		private readonly router: Router
	) {
		super();
	}

	ngOnInit(): void {
		this.userService.unreadNotifications$
			.pipe(takeUntil(this._unsubscribeAll))
			.subscribe(notifications => {
				this.unreadNotifications = notifications;
				this.showBadge = this.unreadNotifications.length !== 0;
			});
	}

	logout() {
		this.authService.logout()
			.pipe(take(1))
			.subscribe(() => {
				this.router.navigate([PATH.LOGIN]);
			});
	}

	setUnreadNotifications(): void {
		this.userService.setNotificationsToRead(this.unreadNotifications).subscribe();
	}

	navigateToMessages(): void {
		this.router.navigate([PATH.MESSAGES]);
	}

	navigateToUserProfile(userId: string): void {
		RouterHelper.navigateToUserProfile(userId, this.router);
	}

	navigateToSettings(): void {
		this.router.navigate([PATH.SETTINGS]);
	}
}
