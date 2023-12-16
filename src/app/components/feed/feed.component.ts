import { takeUntil, tap } from 'rxjs';
import { SCROLL_POSITION_BOTTOM } from 'src/app/constants/scroll-position.constant';
import { IPost } from 'src/app/interfaces/post.interface';

import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { BaseComponent } from '@components/base/base.component';
import { CreatePostDialogComponent } from '@components/create-post-dialog/create-post-dialog.component';
import { PostService } from '@services/post.service';

@Component({
	selector: 'feed',
	templateUrl: './feed.component.html',
	styleUrls: ['./feed.component.css']
})
export class FeedComponent extends BaseComponent implements OnInit {
	posts: IPost[] = [];
	lastElement: IPost | null = null;

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
					this.lastElement = this.posts[this.posts.length - 1];
				}
			});
		this.loadPosts();
	}

	addPost(): void {
		this.dialog.open(CreatePostDialogComponent);
	}

	async loadPosts(): Promise<void> {
		if (this.lastElement) await this.loadNextBatch(this.lastElement);
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

	private async loadNextBatch(lastElement: IPost): Promise<void> {
		await this.postService.loadFeedPosts(lastElement);
	}
}
