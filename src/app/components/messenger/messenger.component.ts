import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { FormControl } from '@angular/forms';
import { Router } from '@angular/router';
import { BaseComponent } from '@components/base/base.component';
import { MessengerService } from '@services/messenger.service';
import { UserService } from '@services/user.service';
import { combineLatest, map, of, startWith, switchMap, takeUntil, tap } from 'rxjs';
import { PATH } from 'src/app/constants/path.constant';
import { IChat } from 'src/app/interfaces';
import { User } from 'src/app/models';

@Component({
	selector: 'app-messenger',
	templateUrl: './messenger.component.html',
	styleUrls: ['./messenger.component.css']
})
export class MessengerComponent extends BaseComponent implements OnInit {
	@ViewChild('endOfChat')
	endOfChat!: ElementRef;

	searchControl = new FormControl('');
	chatListControl = new FormControl();
	messageControl = new FormControl('');

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

	selectedChat$ = combineLatest([
		this.chatListControl.valueChanges,
		this.chats$
	]).pipe(
		map(([value, chats]) => chats.find(c => c.id === value[0]))
	);

	messages$ = this.chatListControl.valueChanges.pipe(
		map(value => value[0]),
		switchMap(chatId => this.messengerService.getChatMessages$(chatId)),
		tap(() => this.scrollToBottom())
	);

	readonly PATH = PATH;

	constructor(
		private readonly userService: UserService,
		private readonly messengerService: MessengerService,
		private readonly router: Router
	) {
		super();
	}

	ngOnInit(): void {
	}

	createChat(user: User): void {
		this.messengerService.isExistingChat(user.uid).pipe(
			takeUntil(this._unsubscribeAll),
			switchMap(chatId => {
				if (chatId) return of(chatId);
				else return this.messengerService.createChat(user);
			})
		).subscribe(chatId => {
			this.chatListControl.setValue([chatId]);
		});
	}

	sendMessage(): void {
		const message = this.messageControl.value;
		const selectedChatId = this.chatListControl.value[0];

		if (!message || !selectedChatId) return;

		this.messengerService.addChatMessage(selectedChatId, message).subscribe(
			() => this.scrollToBottom()
		);

		this.messageControl.setValue('');
	}

	scrollToBottom(): void {
		setTimeout(() => {
			if (!this.endOfChat) return;
			this.endOfChat.nativeElement.scrollIntoView({ behavior: 'smooth' });
		}, 100)
	}

	navigateToUserProfile(selectedChat: IChat): void {

	}
}
