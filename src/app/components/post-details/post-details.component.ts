import { IPost } from 'src/app/interfaces/post.interface';

import { Component, Inject, OnInit, ViewEncapsulation } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { PostService } from '@services/post.service';
import { UserService } from '@services/user.service';

@Component({
	selector: 'post-details',
	templateUrl: './post-details.component.html',
	styleUrls: ['./post-details.component.css'],
	encapsulation: ViewEncapsulation.None
})
export class PostDetailsComponent implements OnInit {
	currentUser$ = this.userService.currentUser$;

	constructor(
		public dialogRef: MatDialogRef<PostDetailsComponent>,
		@Inject(MAT_DIALOG_DATA) public data: IPost,
		private readonly userService: UserService,
		private readonly postService: PostService
	) { }

	ngOnInit(): void {
	}

	deletePost(postId: string): void {
		this.dialogRef.close();
		this.postService.deletePost(postId);
	}
}
