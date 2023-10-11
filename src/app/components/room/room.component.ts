import { Component, ElementRef, Input, OnInit, ViewChild } from '@angular/core';
import { StreamService } from '@services/stream.service';

@Component({
	selector: 'app-room',
	templateUrl: './room.component.html',
	styleUrls: ['./room.component.css']
})
export class RoomComponent implements OnInit {
	@ViewChild('videoElement') videoElement!: ElementRef;

	@Input() isHost: boolean = true;
	isRecording: boolean = false;

	constructor(private readonly streamService: StreamService) { }

	ngOnInit(): void {
		this.streamService.registerPeerConnectionListeners();
	}

	async create(): Promise<void> {
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
}
