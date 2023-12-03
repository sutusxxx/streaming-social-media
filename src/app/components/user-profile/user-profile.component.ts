import {
	combineLatest,
	concatMap,
	from,
	iif,
	map,
	Observable,
	of,
	Subscription,
	switchMap,
	take,
	takeUntil,
	tap,
	throwError
} from 'rxjs';
import { PATH } from 'src/app/constants/path.constant';
import { IPost } from 'src/app/interfaces/post.interface';
import { User } from 'src/app/models';

import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { ActivatedRoute, Router } from '@angular/router';
import { BaseComponent } from '@components/base/base.component';
import { CreatePostDialogComponent } from '@components/create-post-dialog/create-post-dialog.component';
import { FollowerDialogComponent } from '@components/follower-dialog/follower-dialog.component';
import { PostDetailsComponent } from '@components/post-details/post-details.component';
import { AuthService } from '@services/auth.service';
import { FollowService } from '@services/follow.service';
import { ImageUploadService } from '@services/image-upload.service';
import { PostService } from '@services/post.service';
import { UserService } from '@services/user.service';
import { IStory } from 'src/app/interfaces/story.interface';
import { StoryService } from '@services/story.service';
import { StoryPreviewComponent } from '@components/story-preview/story-preview.component';
import { Timestamp } from 'firebase/firestore';
import { SCROLL_POSITION_BOTTOM } from 'src/app/constants/scroll-position.constant';

@Component({
	selector: 'app-user-profile',
	templateUrl: './user-profile.component.html',
	styleUrls: ['./user-profile.component.css']
})
export class UserProfileComponent extends BaseComponent implements OnInit {
	user$!: Observable<User | null>;
	currentUserId: string = '';

	isCurrentUser: boolean = false;
	isFollowing: boolean = false;

	followerCount: number = 0;
	followingCount: number = 0;

	postCount: Observable<number> = of(0);
	posts: IPost[] = [];
	isLoading: boolean = false;

	lastKey: Date | null = null;

	followers: Subscription | null = null;
	following: Subscription | null = null;

	story$: Observable<IStory[] | null> = of(null);

	readonly PATH = PATH;

	constructor(
		private readonly route: ActivatedRoute,
		private readonly authService: AuthService,
		private readonly userService: UserService,
		private readonly followService: FollowService,
		private readonly imageUploadService: ImageUploadService,
		private readonly postService: PostService,
		private readonly storyService: StoryService,
		private readonly router: Router,
		public dialog: MatDialog
	) {
		super();
	}

	ngOnInit(): void {
		this.route.queryParams
			.pipe(map(params => params['id']))
			.subscribe(userId => {
				this.resetUserData();
				this.setUserData(userId);
				this.addFollowersAndFollowingListeners(userId);
			});
		this.postService.onUserPostsLoaded
			.pipe(takeUntil(this._unsubscribeAll))
			.subscribe(posts => {
				this.posts.push(...posts);

				if (this.posts.length) {
					this.lastKey = this.posts[this.posts.length - 1].timestamp;
				}
				this.isLoading = false;
			});
		this.postService.onPostCreated
			.pipe(takeUntil(this._unsubscribeAll))
			.subscribe(() => this.reloadPosts());
		this.postService.onPostDeleted
			.pipe(takeUntil(this._unsubscribeAll))
			.subscribe(postId => this.deletePost(postId));
	}

	setUserData(userId: string): void {
		this.user$ = this.userService.getUserById(userId);
		this.loadPosts(userId);
		this.postCount = this.postService.getPostsCount$(userId);
		this.story$ = this.storyService.getStory(userId);
		this.authService.currentUser$.subscribe(user => {
			this.isCurrentUser = user?.uid === userId;
			this.currentUserId = user?.uid || '';
		});
	}

	onScroll(scrollPosition: string, userId: string) {
		if (this.isLoading) return;

		if (scrollPosition === SCROLL_POSITION_BOTTOM) {
			this.isLoading = true;
			this.loadPosts(userId);
		}
	}

	async loadPosts(userId: string): Promise<void> {
		if (this.lastKey) await this.loadNextBatch(userId, this.lastKey);
		else await this.initPosts(userId);
	}

	private async initPosts(userId: string): Promise<void> {
		this.posts = [];
		await this.postService.loadPostsForUser(userId);
	}

	private async loadNextBatch(userId: string, lastKey: Date): Promise<void> {
		await this.postService.loadPostsForUser(userId, lastKey);
	}

	addFollowersAndFollowingListeners(userId: string): void {
		this.followers = this.followService.getFollowers(userId)
			.pipe(takeUntil(this._unsubscribeAll))
			.subscribe(followers => {
				this.followerCount = followers.length;
				this.isFollowing = followers.includes(this.currentUserId);
			});

		this.following = this.followService.getFollowing(userId)
			.pipe(takeUntil(this._unsubscribeAll))
			.subscribe(following => {
				this.followingCount = following.length;
			});
	}

	uploadImage(event: any, user: User): void {
		this.imageUploadService.uploadImage(event.target.files[0], `images/profile/${user.uid}`).pipe(
			take(1),
			concatMap(photoURL => {
				const userToUpdate = new User(user.uid, { photoURL });
				return this.userService.saveUser(userToUpdate);
			})
		).subscribe();
	}

	addStory(event: any, user: User): void {
		const timestamp = Timestamp.fromDate(new Date());
		this.imageUploadService.uploadImage(event.target.files[0], `images/story/${user.uid}/${timestamp.toMillis()}`).pipe(
			take(1),
			concatMap(storyURL => {
				return this.storyService.addStory(user.uid, storyURL);
			})
		).subscribe();
	}

	showStory(story: IStory[]): void {
		this.dialog.open(StoryPreviewComponent, { data: story });
	}

	updateDescription(event: any, user: User): void {
		const description = user.description?.trim();
		const userToUpdate = new User(user.uid, { description });
		this.userService.saveUser(userToUpdate).subscribe();
	}

	showFollowerDialog(user: User, activeTab: number): void {
		combineLatest([
			this.followService.getFollowers(user.uid),
			this.followService.getFollowing(user.uid)
		]).pipe(
			takeUntil(this._unsubscribeAll),
			concatMap(([followerIds, followingIds]) =>
				this.followService.getDetails(followerIds, followingIds)
			)
		).subscribe(details => {
			this.dialog.open(FollowerDialogComponent, { data: { details, activeTab }, height: '600px' });
		});
	}

	toggleFollow(userId: string): void {
		this.isFollowing = !this.isFollowing;

		if (!this.currentUserId) return;

		const changeFollow = this.isFollowing
			? this.followService.follow(this.currentUserId, userId)
				.pipe(concatMap(() => this.sendFollowNotification(userId)))
			: this.followService.unfollow(this.currentUserId, userId);
		changeFollow

	}

	sendFollowNotification(userId: string): Observable<any> {
		return this.userService.currentUser$.pipe(
			concatMap(user => {
				if (!user) return throwError(() => 'Not Authenticated!');
				const notificationMessage = `${user.displayName} started following you!`;
				return this.userService.notifyUser(userId, notificationMessage);
			})
		);
	}

	resetUserData(): void {
		this.posts = [];
		this.followers?.unsubscribe();
		this.following?.unsubscribe();

		this.followerCount = 0;
		this.followingCount = 0;
	}

	startLiveStream(): void {
		this.userService.currentUser$.pipe(
			take(1),
			concatMap(user => {
				if (!user) return throwError(() => 'Not Authenticated!');
				return from(this.router.navigate([PATH.BROADCAST]));
			})
		).subscribe();
	}

	addPost(): void {
		this.dialog.open(CreatePostDialogComponent);
	}

	showPostDetails(post: IPost): void {
		this.dialog.open(PostDetailsComponent, { data: post });
	}


	private reloadPosts(): void {
		const userId: string = this.route.snapshot.queryParams['id'];
		this.isLoading = true;
		this.initPosts(userId);
	}

	private deletePost(postId: string): void {
		const postIndex = this.posts.findIndex(post => post.id === postId);
		if (postIndex < 0) return;

		this.posts.splice(postIndex, 1);
	}
}
