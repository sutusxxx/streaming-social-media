import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { SearchService } from '@services/search.service';
import { Observable, Subject, combineLatest } from "rxjs";
import { User } from 'src/app/models';

@Component({
	selector: 'app-search',
	templateUrl: './search.component.html',
	styleUrls: ['./search.component.css']
})
export class SearchComponent implements OnInit {
	searching: Subject<string> = new Subject();
	onSearch: Observable<string> = this.searching.asObservable();

	users!: Observable<User[]>;

	constructor(
		private readonly searchService: SearchService,
		private readonly router: Router
	) { }

	ngOnInit(): void {
		this.onSearch.subscribe(
			searchTerm => this.users = this.searchService.search(searchTerm)
		);
	}

	search(event: any): void {
		const searchTerm: string = event.target.value;
		this.searching.next(searchTerm);
	}

	selectUser(userId: string): void {
		this.router.navigate(['/profile'], { queryParams: { id: userId } });
	}
}
