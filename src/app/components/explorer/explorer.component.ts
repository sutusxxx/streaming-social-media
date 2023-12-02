import { Observable, combineLatest, concatMap, of, takeUntil, tap } from 'rxjs';
import { IPost } from 'src/app/interfaces/post.interface';

import { Component, OnInit } from '@angular/core';
import { FollowService } from '@services/follow.service';
import { PostService } from '@services/post.service';
import { UserService } from '@services/user.service';
import { SCROLL_POSITION_BOTTOM } from 'src/app/constants/scroll-position.constant';
import { BaseComponent } from '@components/base/base.component';

@Component({
	selector: 'app-explorer',
	templateUrl: './explorer.component.html',
	styleUrls: ['./explorer.component.css']
})
export class ExplorerComponent extends BaseComponent implements OnInit {
	posts: IPost[] = [];
	lastKey: Date | null = null;

	isLoading: boolean = false;

	constructor(private readonly postService: PostService) {
		super();
	}

	ngOnInit(): void {
		this.postService.onPostsLoaded
			.pipe(
				takeUntil(this._unsubscribeAll),
				tap(() => this.isLoading = false)
			)
			.subscribe(posts => {
				this.posts.push(...posts);
			});
		this.loadPosts();
	}

	async loadPosts(): Promise<void> {
		if (this.lastKey) await this.loadNextBatch(this.lastKey);
		else await this.initPosts();

		if (this.posts.length) {
			this.lastKey = this.posts[this.posts.length - 1].timestamp;
		}
	}

	onScroll(scrollPosition: string) {
		if (scrollPosition === SCROLL_POSITION_BOTTOM) {
			this.isLoading = true;
			this.loadPosts();
		}
	}

	private async initPosts(): Promise<void> {
		this.posts = [];
		await this.postService.loadPosts();
	}

	private async loadNextBatch(lastKey: Date): Promise<void> {
		await this.postService.loadPosts(lastKey);
	}
}
