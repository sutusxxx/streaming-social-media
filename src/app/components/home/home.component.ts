import { Observable, concatMap, of } from 'rxjs';
import { User } from 'src/app/models';

import { Component, OnInit } from '@angular/core';
import { UserService } from '@services/user.service';
import { FollowService } from '@services/follow.service';

@Component({
	selector: 'app-home',
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
