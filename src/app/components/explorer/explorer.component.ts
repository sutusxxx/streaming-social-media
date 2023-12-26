import { takeUntil, tap } from 'rxjs';
import { SCROLL_POSITION_BOTTOM } from 'src/app/shared/constants/scroll-position.constant';
import { IPost } from 'src/app/shared/interfaces/post.interface';

import { Component, OnInit } from '@angular/core';
import { BaseComponent } from '@components/base/base.component';
import { PostService } from '@services/post.service';

@Component({
	selector: 'explorer',
	templateUrl: './explorer.component.html',
	styleUrls: ['./explorer.component.css']
})
export class ExplorerComponent extends BaseComponent implements OnInit {
	posts: IPost[] = [];
	lastElement: IPost | null = null;

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

				if (this.posts.length) {
					this.lastElement = this.posts[this.posts.length - 1];
				}
			});
		this.loadPosts();
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
		await this.postService.loadPosts();
	}

	private async loadNextBatch(lastElement: IPost): Promise<void> {
		await this.postService.loadPosts(lastElement);
	}
}
