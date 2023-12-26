import { PATH } from 'src/app/shared/constants/path.constant';
import { IFollowDetails } from 'src/app/shared/interfaces';

import { Component, Inject, OnInit, ViewEncapsulation } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { Router } from '@angular/router';

@Component({
	selector: 'follower-dialog',
	templateUrl: './follower-dialog.component.html',
	styleUrls: ['./follower-dialog.component.css'],
	encapsulation: ViewEncapsulation.None
})
export class FollowerDialogComponent implements OnInit {

	constructor(
		public dialogRef: MatDialogRef<FollowerDialogComponent>,
		@Inject(MAT_DIALOG_DATA) public data: { details: IFollowDetails, activeTab: number },
		private router: Router
	) { }

	ngOnInit(): void {
	}

	navigateToUserProfile(userId: string): void {
		this.router.navigate([PATH.PROFILE], { queryParams: { id: userId } });
	}
}
