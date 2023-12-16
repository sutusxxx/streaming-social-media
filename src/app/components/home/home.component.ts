import { Observable } from 'rxjs';
import { User } from 'src/app/models';

import { Component, OnInit } from '@angular/core';
import { UserService } from '@services/user.service';

@Component({
	selector: 'home',
	templateUrl: './home.component.html',
	styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit {
	currentUser: Observable<User | null> = this.userService.currentUser$;

	constructor(
		private readonly userService: UserService
	) { }

	ngOnInit(): void {

	}

}
