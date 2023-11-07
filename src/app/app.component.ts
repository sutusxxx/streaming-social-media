import { takeUntil } from 'rxjs';

import { Component, OnInit } from '@angular/core';
import { NavigationStart, Router } from '@angular/router';
import { BaseComponent } from '@components/base/base.component';

@Component({
	selector: 'app-root',
	templateUrl: './app.component.html',
	styleUrls: ['./app.component.css']
})
export class AppComponent extends BaseComponent implements OnInit {
	constructor(
		private readonly router: Router
	) {
		super();
	}

	ngOnInit(): void {
		this.router.events.pipe(takeUntil(this._unsubscribeAll)).subscribe(event => {
			if (event instanceof NavigationStart) {
				const browserRefresh = !this.router.navigated;
				if (browserRefresh) {
					console.log(this.router.getCurrentNavigation);
				}
			}
		})
	}
}
