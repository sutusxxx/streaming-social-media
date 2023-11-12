import { combineLatest, concatMap, from, Observable, of, takeUntil } from 'rxjs';
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
	posts$ = this.getPosts();

	constructor(
		public dialog: MatDialog,
		private readonly postService: PostService,
		private readonly authService: AuthService,
		private readonly followService: FollowService
	) {
		super();
	}

	ngOnInit(): void {
		this.getPosts();
	}

	addPost(): void {
		this.dialog.open(CreatePostDialogComponent);
	}

	getPosts(): Observable<IPost[]> {
		return this.authService.currentUser$.pipe(
			takeUntil(this._unsubscribeAll),
			concatMap(user => {
				if (!user) throw Error('Not Authenticated!');
				return combineLatest([of(user.uid), this.followService.getFollowing(user.uid)]);
			}),
			concatMap(([currentUserId, userIds]) =>
				from(this.postService.getPosts(userIds.concat(currentUserId), { include: true }))
			)
		);
	}
}
