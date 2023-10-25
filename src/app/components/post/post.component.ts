import { Component, Input, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { CommentComponent } from '@components/comment/comment.component';
import { PostService } from '@services/post.service';
import { UserService } from '@services/user.service';
import { concatMap, map, take } from 'rxjs';
import { IPost } from 'src/app/interfaces/post.interface';

@Component({
	selector: 'app-post',
	templateUrl: './post.component.html',
	styleUrls: ['./post.component.css']
})
export class PostComponent implements OnInit {
	@Input() data!: IPost;

	liked: boolean = false;

	constructor(
		private readonly userService: UserService,
		private readonly dialog: MatDialog,
		private readonly postService: PostService
	) { }

	ngOnInit(): void {
		this.userService.currentUser$.pipe(
			take(1),
			map(user => {
				if (!user || !this.data.likes) return false;
				return this.data.likes?.includes(user?.uid);
			})
		).subscribe(liked => this.liked = liked);
	}

	addComment(): void {
		this.dialog.open(CommentComponent, { data: this.data?.id })
	}

	toggleLike(event: any, postId: string): void {
		event.stopPropagation();

		if (!this.liked) {
			this.postService.likePost(postId).subscribe();
		} else {
			this.postService.dislikePost(postId).subscribe();
		}
		this.liked = !this.liked;
	}
}
