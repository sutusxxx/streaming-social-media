import { Observable, Subject, takeUntil } from 'rxjs';
import { RouterHelper } from 'src/app/shared/helpers/router.helper';
import { IUser } from 'src/app/shared/interfaces';

import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { BaseComponent } from '@components/base/base.component';
import { SearchService } from '@services/search.service';

@Component({
	selector: 'search',
	templateUrl: './search.component.html',
	styleUrls: ['./search.component.css']
})
export class SearchComponent extends BaseComponent implements OnInit {
	searching: Subject<string> = new Subject();
	onSearch: Observable<string> = this.searching.asObservable();

	users!: Observable<IUser[]>;

	constructor(
		private readonly searchService: SearchService,
		private readonly router: Router
	) {
		super();
	}

	ngOnInit(): void {
		this.onSearch
			.pipe(takeUntil(this._unsubscribeAll))
			.subscribe(
				searchTerm => this.users = this.searchService.search(searchTerm)
			);
	}

	search(event: any): void {
		if ((event.which <= 90 && event.which >= 48) || event.which == 8) {
			const searchTerm: string = event.target.value;
			this.searching.next(searchTerm);
		}
	}

	selectUser(userId: string): void {
		RouterHelper.navigateToUserProfile(userId, this.router);
	}
}
