import { combineLatest, concatMap, finalize, firstValueFrom, from, Observable, of, switchMap, takeUntil, tap, throwError } from 'rxjs';
import { IPost } from 'src/app/interfaces/post.interface';

import { Component, HostListener, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { BaseComponent } from '@components/base/base.component';
import { CreatePostDialogComponent } from '@components/create-post-dialog/create-post-dialog.component';
import { AuthService } from '@services/auth.service';
import { FollowService } from '@services/follow.service';
import { PostService } from '@services/post.service';
import { Router } from '@angular/router';
import { SCROLL_POSITION_BOTTOM } from 'src/app/constants/scroll-position.constant';

@Component({
	selector: 'app-feed',
	templateUrl: './feed.component.html',
	styleUrls: ['./feed.component.css']
})
export class FeedComponent extends BaseComponent implements OnInit {
	posts: IPost[] = [];
	lastKey: Date | null = null;

	isLoading: boolean = false;

	constructor(
		public dialog: MatDialog,
		private readonly postService: PostService
	) {
		super();
	}

	ngOnInit(): void {
		this.postService.onFeedPostsLoaded
			.pipe(
				takeUntil(this._unsubscribeAll),
				tap(() => this.isLoading = false)
			)
			.subscribe(posts => {
				this.posts.push(...posts);

				if (this.posts.length) {
					this.lastKey = this.posts[this.posts.length - 1].timestamp;
				}
			});
		this.loadPosts();
	}

	addPost(): void {
		this.dialog.open(CreatePostDialogComponent);
	}

	async loadPosts(): Promise<void> {
		if (this.lastKey) await this.loadNextBatch(this.lastKey);
		else await this.initPosts();
	}

	onScroll(scrollPosition: string) {
		if (this.isLoading) return;

		if (scrollPosition === SCROLL_POSITION_BOTTOM) {
			this.isLoading = true;
			this.loadPosts();
		}
	}

	private async initPosts(): Promise<void> {
		this.posts = [];
		await this.postService.loadFeedPosts();
	}

	private async loadNextBatch(lastKey: Date): Promise<void> {
		await this.postService.loadFeedPosts(lastKey);
	}
}
