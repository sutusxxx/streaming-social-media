import { Component, OnInit } from '@angular/core';
import { FormControl } from '@angular/forms';
import { MessengerService } from '@services/messenger.service';
import { UserService } from '@services/user.service';
import { combineLatest, map, startWith } from 'rxjs';
import { User } from 'src/app/models';

@Component({
	selector: 'app-messenger',
	templateUrl: './messenger.component.html',
	styleUrls: ['./messenger.component.css']
})
export class MessengerComponent implements OnInit {
	searchControl = new FormControl('');

	currentUser$ = this.userService.currentUser$;
	users$ = combineLatest([
		this.userService.users$,
		this.currentUser$,
		this.searchControl.valueChanges.pipe(startWith(''))
	]).pipe(
		map(([users, currentUser, searchString]) =>
			users.filter(user => user.displayName?.toLowerCase().includes(searchString.toLowerCase()) && user.uid !== currentUser?.uid)
		)
	);
	chats$ = this.messengerService.chats$;

	constructor(
		private readonly userService: UserService,
		private readonly messengerService: MessengerService
	) { }

	ngOnInit(): void {
	}

	createChat(user: User): void {
		this.messengerService.createChat(user).subscribe(
			next => console.log(next),
			error => console.log(error)
		);
	}
}
