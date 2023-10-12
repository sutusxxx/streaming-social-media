import { Component, ElementRef, Input, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { FormControl } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { StreamService } from '@services/stream.service';
import { UserService } from '@services/user.service';
import { Observable, tap } from 'rxjs';
import { PATH } from 'src/app/constants/path.constant';

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
		this.streamService.createRoom().subscribe(
			() => {
				console.log('Room Created...');
				this.videoElement.nativeElement.srcObject = this.streamService.localStream;
			},
			error => console.log('Room Creation Failed:', error)
		);
	}

	join(): void {
		this.streamService.joinRoomById('oCcaMJYioBhm5XoRqPzZXdpeta72').subscribe(
			() => {
				console.log('Room Joined...');
				this.videoElement.nativeElement.srcObject = this.streamService.remoteStream;
			},
			error => console.log('Failed To Join:', error)
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

	ngOnDestroy(): void {
		this.end();
	}
}
