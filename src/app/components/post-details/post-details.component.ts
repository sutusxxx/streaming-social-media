import { IPost } from 'src/app/interfaces/post.interface';

import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { UserService } from '@services/user.service';

@Component({
	selector: 'app-post-details',
	templateUrl: './post-details.component.html',
	styleUrls: ['./post-details.component.css']
})
export class PostDetailsComponent implements OnInit {
	currentUser$ = this.userService.currentUser$;

	constructor(
		public dialogRef: MatDialogRef<PostDetailsComponent>,
		@Inject(MAT_DIALOG_DATA) public data: IPost,
		private readonly userService: UserService
	) { }

	ngOnInit(): void {
	}

}
