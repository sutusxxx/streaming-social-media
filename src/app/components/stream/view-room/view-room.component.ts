import { concatMap, Observable, take } from 'rxjs';

import { AfterViewInit, Component, ElementRef, OnDestroy, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { StreamService } from '@services/stream.service';

@Component({
	selector: 'app-view-room',
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
		this.route.queryParams.pipe(
			take(1),
			concatMap(params => {
				this.streamService.initPeerConnection();
				return this.streamService.joinRoomById(params['room'])
			})
		).subscribe(mediaStream => {
			this.messages$ = this.streamService.getChat();
			this.remoteVideoElement.nativeElement.srcObject = mediaStream;
		});
	}

	ngOnDestroy(): void {
		this.streamService.stopStream(false);
	}
}
