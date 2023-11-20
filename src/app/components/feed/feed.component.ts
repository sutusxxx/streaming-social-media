import { combineLatest, concatMap, firstValueFrom, from, Observable, of, switchMap, takeUntil, throwError } from 'rxjs';
import { IPost } from 'src/app/interfaces/post.interface';

import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { BaseComponent } from '@components/base/base.component';
import { CreatePostDialogComponent } from '@components/create-post-dialog/create-post-dialog.component';
import { AuthService } from '@services/auth.service';
import { FollowService } from '@services/follow.service';
import { PostService } from '@services/post.service';

@Component({
	selector: 'app-feed',
	templateUrl: './feed.component.html',
	styleUrls: ['./feed.component.css']
})
export class FeedComponent extends BaseComponent implements OnInit {
	posts: IPost[] = [];
	lastKey: Date | null = null;
	totalCount: number = 0;

	constructor(
		public dialog: MatDialog,
		private readonly postService: PostService,
		private readonly authService: AuthService,
		private readonly followService: FollowService
	) {
		super();
	}

	ngOnInit(): void {
		this.loadPosts();
	}

	addPost(): void {
		this.dialog.open(CreatePostDialogComponent);
	}

	async loadPosts(): Promise<void> {
		const userIds = await firstValueFrom(this.getUserIds());

		if (this.lastKey)
			this.posts = await this.postService.getPostsForUsers(userIds, { startAt: this.lastKey });
		else
			this.posts = await this.postService.getPostsForUsers(userIds);
		this.lastKey = this.posts[this.posts.length - 1].timestamp;
	}

	async onScrollLoadPosts() {
		console.log('scroll')
		if (this.posts.length !== this.totalCount) {
			await this.loadPosts();
		}
	}

	private getUserIds(): Observable<string[]> {
		return this.authService.currentUser$.pipe(
			takeUntil(this._unsubscribeAll),
			switchMap(user => {
				if (!user) return [];
				return combineLatest([of(user.uid), this.followService.getFollowing(user.uid)]);
			}),
			concatMap(([currentUserId, userIds]) => {
				return of(userIds.concat(currentUserId));
			})
		);
	}
}
