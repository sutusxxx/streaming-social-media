import SimplePeer from 'simple-peer';

import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { StreamService } from '@services/stream.service';

@Component({
	selector: 'app-streaming',
	templateUrl: './streaming.component.html',
	styleUrls: ['./streaming.component.css']
})
export class StreamingComponent implements OnInit {
	@ViewChild('videoElement') videoElement!: ElementRef;

	mediaRecorder!: MediaRecorder;
	isRecording: boolean = false;

	localStream!: MediaStream;
	remoteStream!: MediaStream;

	constructor(private readonly streamService: StreamService) { }

	async ngOnInit(): Promise<void> {
		this.localStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
		this.remoteStream = new MediaStream();

		this.localStream.getTracks().forEach(track => {
			this.streamService.peerConnection.addTrack(track, this.localStream);
		});

		this.streamService.peerConnection.ontrack = event => {
			event.streams[0].getTracks().forEach(track => {
				this.remoteStream.addTrack(track);
			});
		}
		this.videoElement.nativeElement.srcObject = this.localStream;
		// this.mediaRecorder = new MediaRecorder(this.localStream);
		// const chunks: BlobPart[] = [];

		// this.mediaRecorder.ondataavailable = event => {
		// 	if (event.data.size > 0) {
		// 		console.log(`chunk-${Date.now()}`);
		// 		chunks.push(event.data);
		// 	}
		// };
		// this.mediaRecorder.onstop = () => {
		// 	const recordedBlob = new Blob(chunks, { type: 'video/webm' });
		// }
	}

	async startRecording(): Promise<void> {
		await this.streamService.createOffer('test')
			.then(() => {
				this.isRecording = true;
			});
	}

	stopRecording(): void {
		// this.mediaRecorder.stop();
		this.isRecording = false;
	}
}
