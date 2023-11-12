import { concatMap, map, Observable, of, take, throwError } from 'rxjs';
import { PATH } from 'src/app/constants/path.constant';
import { IPost } from 'src/app/interfaces/post.interface';
import { User } from 'src/app/models';

import { Component, Input, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { CommentComponent } from '@components/comment/comment.component';
import { PostService } from '@services/post.service';
import { UserService } from '@services/user.service';

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

		this.postService.getPost(this.data.id).subscribe((post) => console.log('post', post))
	}

	addComment(): void {
		this.dialog.open(CommentComponent, { data: this.data?.id })
	}

	toggleLike(event: any, post: IPost): void {
		event.stopPropagation();

		this.userService.currentUser$.pipe(
			take(1),
			concatMap(user => {
				if (!user) return throwError(() => 'Not Authenticated!');

				if (!this.liked) {
					return this.postService.likePost(post.id, user.uid).pipe(
						concatMap(() => {
							if (post.userId !== user.uid) {
								return this.sendPostLikedNotification(user, post);
							}
							return of();
						})
					);
				} else {
					return this.postService.dislikePost(post.id, user.uid);
				}
			})
		).subscribe(() => {
			this.liked = !this.liked;
		});
	}

	sendPostLikedNotification(currentUser: User, post: IPost): Observable<void> {
		const notificationMessage = `${currentUser.displayName} liked your post.`;
		return this.userService.notifyUser(post.userId, notificationMessage);
	}

	navigateToUserProfile(userId: string): void {
		this.router.navigate([PATH.PROFILE], { queryParams: { id: userId } })
	}
}
