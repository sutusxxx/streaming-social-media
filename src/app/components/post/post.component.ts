import { concatMap, map, Observable, take, throwError } from 'rxjs';
import { IPost } from 'src/app/interfaces/post.interface';

import { Component, Input, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { CommentComponent } from '@components/comment/comment.component';
import { PostService } from '@services/post.service';
import { UserService } from '@services/user.service';
import { Router } from '@angular/router';
import { PATH } from 'src/app/constants/path.constant';

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
		private readonly postService: PostService,
		private readonly router: Router
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
			this.postService.likePost(postId).pipe(
				take(1),
				concatMap(() => this.sendPostLikedNotification())
			).subscribe();
		} else {
			this.postService.dislikePost(postId).pipe(take(1)).subscribe();
		}
		this.liked = !this.liked;
	}

	sendPostLikedNotification(): Observable<void> {
		return this.userService.currentUser$.pipe(
			take(1),
			concatMap(user => {
				if (!user) return throwError(() => console.log('Not Authenticated'));

				const notificationMessage = `${user.displayName} liked your post.`;
				return this.userService.notifyUser(this.data.userId, notificationMessage);
			})
		);
	}

	navigateToUserProfile(userId: string): void {
		this.router.navigate([PATH.PROFILE], { queryParams: { id: userId } })
	}
}
