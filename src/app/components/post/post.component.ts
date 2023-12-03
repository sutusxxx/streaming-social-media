import { concatMap, firstValueFrom, map, Observable, of, switchMap, take, tap, throwError } from 'rxjs';
import { PATH } from 'src/app/constants/path.constant';
import { IPost } from 'src/app/interfaces/post.interface';
import { User } from 'src/app/models';

import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { PostService } from '@services/post.service';
import { UserService } from '@services/user.service';
import { PostDetailsComponent } from '@components/post-details/post-details.component';

@Component({
	selector: 'app-post',
	templateUrl: './post.component.html',
	styleUrls: ['./post.component.css']
})
export class PostComponent implements OnInit {
	@Input() post!: IPost;
	@Input() showCommentPreview: boolean = false;

	@Output() postChange: EventEmitter<IPost> = new EventEmitter<IPost>();

	post$!: Observable<IPost>
	commentCount$: Observable<number> = of(0);

	liked: boolean = false;

	constructor(
		private readonly userService: UserService,
		private readonly postService: PostService,
		private readonly router: Router,
		private readonly dialog: MatDialog
	) { }

	async ngOnInit(): Promise<void> {
		this.liked = await this.isLikedByCurrentUser();
		this.post$ = this.postService.getPost(this.post.id);
		this.commentCount$ = this.postService.getCommentsCount$(this.post.id);

	}

	async isLikedByCurrentUser(): Promise<boolean> {
		return firstValueFrom(this.userService.currentUser$.pipe(
			map(user => {
				if (!user || !this.post.likes) return false;
				return this.post.likes?.includes(user?.uid);
			})
		));
	}

	addComment(): void {
		if (this.showCommentPreview)
			this.dialog.open(PostDetailsComponent, { data: this.post });
	}

	toggleLike(event: any, post: IPost): void {
		event.stopPropagation();

		this.userService.currentUser$.pipe(
			switchMap(user => {
				if (!user) return throwError(() => 'Not Authenticated!');

				if (!this.liked) {
					return this.postService.likePost(post.id, user.uid).pipe(
						tap(() => {
							if (post.userId !== user.uid) {
								this.sendPostLikedNotification(user, post);
							}
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
