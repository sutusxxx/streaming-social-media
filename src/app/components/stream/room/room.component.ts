import { finalize, Observable, take } from 'rxjs';

import { AfterViewInit, Component, ElementRef, OnDestroy, ViewChild } from '@angular/core';
import { StreamService } from '@services/stream.service';

@Component({
	selector: 'app-room',
	templateUrl: './room.component.html',
	styleUrls: ['./room.component.css']
})
export class RoomComponent implements OnDestroy, AfterViewInit {
	@ViewChild('localVideoElement') localVideoElement!: ElementRef;
	messages$: Observable<any> | null = null;

	constructor(
		private readonly streamService: StreamService
	) { }

	ngAfterViewInit(): void {
		this.streamService.initPeerConnection();
		this.streamService.createRoom()
			.pipe(take(1), finalize(() => this.streamService.sendLiveStartedNotificationToFollowers()))
			.subscribe(mediaStream => {
				this.localVideoElement.nativeElement.srcObject = mediaStream;
				this.messages$ = this.streamService.getChat();
			});
	}

	ngOnDestroy(): void {
		this.streamService.stopStream(true);
	}
}
