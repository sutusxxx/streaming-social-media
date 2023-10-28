import { combineLatest, concatMap, EMPTY, forkJoin, Observable, of, tap, throwError } from 'rxjs';
import { PATH } from 'src/app/constants/path.constant';

import { Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { FormControl } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { FollowService } from '@services/follow.service';
import { StreamService } from '@services/stream.service';
import { UserService } from '@services/user.service';

@Component({
	selector: 'app-room',
	templateUrl: './room.component.html',
	styleUrls: ['./room.component.css']
})
export class RoomComponent implements OnInit, OnDestroy {
	@ViewChild('videoElement') videoElement!: ElementRef;
	@ViewChild('endOfChat') endOfChat!: ElementRef;

	isHost: boolean = true;
	roomId: string = '';

	isRecording: boolean = false;

	messageControl = new FormControl('');

	currentUser$ = this.userService.currentUser$;
	messages$!: Observable<any>;

	constructor(
		private readonly streamService: StreamService,
		private readonly route: ActivatedRoute,
		private readonly userService: UserService,
		private readonly followService: FollowService,
		private readonly router: Router
	) { }

	ngOnInit(): void {
		this.route.queryParams.subscribe(params => {
			this.isHost = params['host'];
			this.roomId = params['userId'];
			this.messages$ = this.streamService.getChat(this.roomId).pipe(
				tap(this.scrollToBottom)
			);
			this.streamService.registerPeerConnectionListeners();
			this.initStream();
		});
	}

	initStream(): void {
		if (this.isHost) {
			this.create();
		} else {
			this.join();
		}
	}

	create(): void {
		this.streamService.createRoom()
			.pipe(
				concatMap(() => this.sendLiveStartedNotificationToFollowers())
			).subscribe(
				() => {
					this.videoElement.nativeElement.srcObject = this.streamService.localStream;
				}
			);
	}

	join(): void {
		this.streamService.joinRoomById(this.roomId).subscribe(
			() => {
				this.videoElement.nativeElement.srcObject = this.streamService.remoteStream;
			}
		);
	}

	end(): void {
		if (this.isHost) {
			console.log('Removing Room from database...');
			this.streamService.deleteRoom(this.roomId).subscribe(() => {
				console.log('Room deleted with id=', this.roomId);
				this.router.navigate([PATH.PROFILE], { queryParams: { id: this.roomId } });
			});
		} else {
			console.log('Leave room.')
		}
	}

	sendMessage(): void {
		const message = this.messageControl.value;
		this.streamService.addMessage(this.roomId, message).subscribe(
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

	private sendLiveStartedNotificationToFollowers(): Observable<any> {
		return this.currentUser$.pipe(
			concatMap(user => {
				if (!user) return throwError(() => 'Not Authenticated');
				return combineLatest([of(user), this.followService.getFollowers(user.uid)]);
			}),
			concatMap(([user, followers]) => {
				if (!followers || !followers.length) return EMPTY;
				const notificationMessage = `${user.displayName} is LIVE!`
				return forkJoin(followers.map(followerId => this.userService.notifyUser(followerId, notificationMessage)))
			})
		)
	}


	ngOnDestroy(): void {
		this.end();
	}
}
