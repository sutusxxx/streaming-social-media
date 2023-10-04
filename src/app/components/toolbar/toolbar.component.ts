import { Component, Input, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '@services/auth.service';
import { PATH } from 'src/app/constants/path.constant';
import { User } from 'src/app/models';

@Component({
	selector: 'app-toolbar',
	templateUrl: './toolbar.component.html',
	styleUrls: ['./toolbar.component.css']
})
export class ToolbarComponent implements OnInit {
	@Input() user: User | null = null;

	readonly PATH = PATH;

	constructor(public readonly authService: AuthService, private readonly router: Router) { }

	ngOnInit(): void {
	}


	logout() {
		this.authService.logout()
			.subscribe(() => {
				this.router.navigate([PATH.LOGIN]);
			});
	}

	navigateToMessages(): void {
		this.router.navigate([PATH.MESSAGES]);
	}

	navigateToUserProfile(): void {
		this.router.navigate([PATH.PROFILE], { queryParams: { id: this.user?.uid } });
	}
}
