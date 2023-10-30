import { Observable, tap } from 'rxjs';

import { AfterViewInit, Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { FormControl } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { StreamService } from '@services/stream.service';
import { UserService } from '@services/user.service';

@Component({
	selector: 'app-room',
	templateUrl: './room.component.html',
	styleUrls: ['./room.component.css']
})
export class RoomComponent implements OnInit, OnDestroy, AfterViewInit {
	@ViewChild('localVideoElement') localVideoElement!: ElementRef;
	@ViewChild('remoteVideoElement') remoteVideoElement!: ElementRef;
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
		private readonly userService: UserService
	) { }

	ngOnInit(): void {
		this.route.queryParams.subscribe(params => {
			this.roomId = params['roomId'];
			this.messages$ = this.streamService.getChat(this.roomId).pipe(
				tap(this.scrollToBottom)
			);
		});
	}

	ngAfterViewInit(): void {
		this.streamService.initStream(this.roomId)
			.pipe(tap(() => this.streamService.sendLiveStartedNotificationToFollowers()))
			.subscribe(mediaStream => this.localVideoElement.nativeElement.srcObject = mediaStream);
	}

	exit(): void {
		this.streamService.stopStream(this.roomId);
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
		this.exit();
	}
}
