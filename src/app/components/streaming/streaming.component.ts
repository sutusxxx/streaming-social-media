import SimplePeer from 'simple-peer';

import { Component, ElementRef, OnInit, OnDestroy, ViewChild } from '@angular/core';
import { StreamService } from '@services/stream.service';
import { UserService } from '@services/user.service';
import { concatMap, take } from 'rxjs';

@Component({
	selector: 'app-streaming',
	templateUrl: './streaming.component.html',
	styleUrls: ['./streaming.component.css']
})
export class StreamingComponent implements OnInit, OnDestroy {
	@ViewChild('videoElement') videoElement!: ElementRef;

	mediaRecorder!: MediaRecorder;
	isRecording: boolean = false;

	constructor(
		private readonly streamService: StreamService,
		private readonly userService: UserService
	) { }

	async ngOnInit(): Promise<void> {
		await this.streamService.initStreamer();
		this.videoElement.nativeElement.srcObject = this.streamService.localStream;
		// this.mediaRecorder = new MediaRecorder(this.localStream);
		// const chunks: BlobPart[] = [];

		// this.mediaRecorder.ondataavailable = event => {
		// 	if (event.data.size > 0) {
		// 		console.log(`chunk-${Date.now()}`);
		// 		chunks.push(event.data);
		// 	}
		// };
		// this.mediaRecorder.onstop = () => {
		// const recordedBlob = new Blob(chunks, { type: 'video/webm' });
		// }
	}

	startRecording(): void {
		this.userService.currentUser$.pipe(
			take(1),
			concatMap(async currentUser => {
				if (!currentUser) return;
				await this.streamService.createStream(currentUser.uid)
					.then(() => {
						this.isRecording = true;
					})
					.catch(error => console.log(error));
			})
		).subscribe();
	}

	stopRecording(): void {
		// this.mediaRecorder.stop();
		this.userService.currentUser$.pipe(
			take(1),
			concatMap(async currentUser => {
				if (!currentUser) return;
				await this.streamService.removeStream(currentUser.uid)
					.then(() => {
						this.isRecording = false;
					})
					.catch(error => console.log(error));
			})
		).subscribe();
	}

	ngOnDestroy(): void {
		this.streamService.peerConnection.close();
	}
}
