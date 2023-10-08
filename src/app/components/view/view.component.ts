import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { StreamService } from '@services/stream.service';

@Component({
	selector: 'app-view',
	templateUrl: './view.component.html',
	styleUrls: ['./view.component.css']
})
export class ViewComponent implements OnInit {
	@ViewChild('videoElement') videoElement!: ElementRef;

	constructor(private readonly streamService: StreamService) { }

	ngOnInit(): void {
		this.videoElement.nativeElement.srcObject = this.streamService.remoteStream;
	}

	joinStream(): void {
		this.streamService.join('oCcaMJYioBhm5XoRqPzZXdpeta72').catch(error => console.log(error));
	}

}
