import { PATH } from 'src/app/constants/path.constant';

import { Component, Inject, Input, OnInit } from '@angular/core';
import { FormControl } from '@angular/forms';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { PostService } from '@services/post.service';
import { take } from 'rxjs';

@Component({
	selector: 'app-comment',
	templateUrl: './comment.component.html',
	styleUrls: ['./comment.component.css']
})
export class CommentComponent implements OnInit {
	@Input() postId: string = '';
	commentControl = new FormControl('');

	comments$ = this.postService.getPostComments$(this.postId);

	readonly PATH = PATH;

	constructor(
		private readonly postService: PostService
	) { }

	ngOnInit(): void {
	}

	sendComment(): void {
		const comment = this.commentControl.value;
		if (!comment) return;

		this.postService.addComment(this.postId, comment)
			.subscribe();
		this.commentControl.setValue('');
	}
}
