import { combineLatest, concatMap, map, Observable, Subscription } from 'rxjs';
import { PATH } from 'src/app/constants/path.constant';
import { User } from 'src/app/models';

import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { AuthService } from '@services/auth.service';
import { FollowService } from '@services/follow.service';
import { ImageUploadService } from '@services/image-upload.service';
import { UserService } from '@services/user.service';
import { IFollowDetails } from 'src/app/interfaces';
import { MatDialog } from '@angular/material/dialog';
import { FollowerDialogComponent } from '@components/follower-dialog/follower-dialog.component';

@Component({
	selector: 'app-user-profile',
	templateUrl: './user-profile.component.html',
	styleUrls: ['./user-profile.component.css']
})
export class UserProfileComponent implements OnInit {
	user$!: Observable<User | null>;
	currentUserId: string = '';

	isCurrentUser: boolean = false;
	isFollowing: boolean = false;

	followerCount: number = 0;
	followingCount: number = 0;

	postCount: number = 0;

	followers: Subscription | null = null;
	following: Subscription | null = null;

	readonly PATH = PATH;

	constructor(
		private readonly route: ActivatedRoute,
		private readonly authService: AuthService,
		private readonly userService: UserService,
		private readonly followService: FollowService,
		private readonly imageUploadService: ImageUploadService,
		public dialog: MatDialog
	) { }

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
		this.authService.currentUser$.subscribe(user => {
			if (!user) return;

			this.isCurrentUser = user.uid === userId;
			this.currentUserId = user.uid;
		});
	}

	addFollowersAndFollowingListeners(userId: string): void {
		this.followers = this.followService.getFollowers(userId)
			.subscribe(followers => {
				this.followerCount = followers.length;
				this.isFollowing = followers.includes(this.currentUserId);
			});

		this.following = this.followService.getFollowing(userId)
			.subscribe(following => {
				this.followingCount = following.length;
			});
	}

	uploadImage(event: any, user: User): void {
		this.imageUploadService.uploadImage(event.target.files[0], `images/profile/${user.uid}`).pipe(
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
			concatMap(([followerIds, followingIds]) =>
				this.followService.getDetails(followerIds, followingIds)
			)
		).subscribe(details => {
			this.dialog.open(FollowerDialogComponent, { data: { details, activeTab }, height: '600px' });
		}, error => console.log(error));
	}

	toggleFollow(userId: string): void {
		this.isFollowing = !this.isFollowing;

		if (!this.currentUserId) return;

		if (this.isFollowing) this.followService.follow(this.currentUserId, userId);
		else this.followService.unfollow(this.currentUserId, userId);
	}

	resetUserData(): void {
		this.followers?.unsubscribe();
		this.following?.unsubscribe();

		this.followerCount = 0;
		this.followingCount = 0;
	}
}