import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { AuthService } from '@services/auth.service';
import { FollowService } from '@services/follow.service';
import { ImageUploadService } from '@services/image-upload.service';
import { UserService } from '@services/user.service';
import { Observable, catchError, concatMap } from 'rxjs';
import { User } from 'src/app/models';

@Component({
	selector: 'app-user-profile',
	templateUrl: './user-profile.component.html',
	styleUrls: ['./user-profile.component.css']
})
export class UserProfileComponent implements OnInit {
	user$!: Observable<User | null>;
	currentUserId: string | null = null;

	isCurrentUser: boolean = false;
	isFollowing: boolean = false;

	followerCount: number = 0;
	followingCount: number = 0;

	postCount: number = 0;

	followers: any;
	following: any;

	constructor(
		private readonly route: ActivatedRoute,
		private readonly authService: AuthService,
		private readonly userService: UserService,
		private readonly followService: FollowService,
		private readonly imageUploadService: ImageUploadService
	) { }

	ngOnInit(): void {
		this.route.queryParams.subscribe(params => {
			const userId = params['id'];
			this.user$ = this.userService.getUserById(userId);
			this.authService.currentUser$.subscribe(user => {
				if (!user) return;

				this.isCurrentUser = user.uid === userId;
				this.currentUserId = user.uid;

				this.followService.getFollowing(this.currentUserId, userId);
				this.followService.getFollowers(userId);
			})
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

	showFollowerDialog(user: User, activeTab: string): void {
		// TODO: implement followers.
	}

	toggleFollow(userId: string): void {
		this.isFollowing = !this.isFollowing;

		if (!this.currentUserId) return;

		this.followService.follow(this.currentUserId, userId);
	}
}
