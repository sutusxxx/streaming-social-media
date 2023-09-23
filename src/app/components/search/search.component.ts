import { Component, OnInit } from '@angular/core';
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

	users: User[] = [];

	constructor(private readonly searchService: SearchService) { }

	ngOnInit(): void {
		this.onSearch.subscribe(searchTerm =>
			this.searchService.search(searchTerm)
				.subscribe(users => this.users = users)
		);
	}

	search(event: any): void {
		const searchTerm: string = event.target.value;
		this.searching.next(searchTerm);
	}
}
