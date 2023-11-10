import {
	combineLatest,
	concatMap,
	from,
	map,
	Observable,
	of,
	Subscription,
	take,
	takeUntil,
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
	posts: Observable<IPost[]> = of([]);

	followers: Subscription | null = null;
	following: Subscription | null = null;

	readonly PATH = PATH;

	constructor(
		private readonly route: ActivatedRoute,
		private readonly authService: AuthService,
		private readonly userService: UserService,
		private readonly followService: FollowService,
		private readonly imageUploadService: ImageUploadService,
		private readonly postService: PostService,
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
	}

	setUserData(userId: string): void {
		this.user$ = this.userService.getUserById(userId);
		this.authService.currentUser$
			.pipe(take(1), concatMap(user => {
				if (!user) return of(null);

				this.posts = this.postService.getPosts([userId], { include: true });
				this.postCount = this.posts.pipe(map((posts) => posts.length));

				return of(user);
			}))
			.subscribe(user => {
				if (!user) return;


				this.isCurrentUser = user.uid === userId;
				this.currentUserId = user.uid;
			});
	}

	addFollowersAndFollowingListeners(userId: string): void {
		this.followers = this.followService.getFollowers(userId)
			.pipe(take(1))
			.subscribe(followers => {
				this.followerCount = followers.length;
				this.isFollowing = followers.includes(this.currentUserId);
			});

		this.following = this.followService.getFollowing(userId)
			.pipe(take(1))
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

		if (this.isFollowing) this.followService.follow(this.currentUserId, userId).pipe(
			concatMap(() => this.sendFollowNotification(userId))
		).subscribe();
		else this.followService.unfollow(this.currentUserId, userId).subscribe();
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
}
