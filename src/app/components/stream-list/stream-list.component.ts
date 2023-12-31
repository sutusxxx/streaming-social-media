import { PATH } from 'src/app/shared/constants/path.constant';

import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { StreamService } from '@services/stream.service';

@Component({
	selector: 'stream-list',
	templateUrl: './stream-list.component.html',
	styleUrls: ['./stream-list.component.css']
})
export class StreamListComponent implements OnInit {

	rooms$ = this.streamService.getRooms();

	constructor(
		private readonly streamService: StreamService,
		private router: Router
	) { }

	ngOnInit(): void {
	}

	joinStream(room: string): void {
		this.router.navigate([PATH.LIVE], { queryParams: { room } });
	}
}
