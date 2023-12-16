import { Observable } from 'rxjs';

import { AfterViewInit, Component, ElementRef, OnDestroy, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { StreamService } from '@services/stream.service';

@Component({
	selector: 'view-room',
	templateUrl: './view-room.component.html',
	styleUrls: ['./view-room.component.css']
})
export class ViewRoomComponent implements AfterViewInit, OnDestroy {
	@ViewChild('remoteVideoElement') remoteVideoElement!: ElementRef;
	messages$: Observable<any> | null = null;

	constructor(
		private readonly streamService: StreamService,
		private readonly route: ActivatedRoute
	) { }

	ngAfterViewInit(): void {
		const roomId = this.route.snapshot.queryParamMap.get('room');
		if (!roomId) return;

		this.streamService.initPeerConnection();
		this.streamService.joinRoomById(roomId).subscribe(mediaStream => {
			this.messages$ = this.streamService.getChat();
			this.remoteVideoElement.nativeElement.srcObject = mediaStream;
		});
	}

	ngOnDestroy(): void {
		this.streamService.stopStream(false);
	}
}
