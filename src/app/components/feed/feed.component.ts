import { Component, Input, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { CreatePostDialogComponent } from '@components/create-post-dialog/create-post-dialog.component';
import { FollowService } from '@services/follow.service';
import { PostService } from '@services/post.service';
import { UserService } from '@services/user.service';
import { concatMap, map } from 'rxjs';
import { IPost } from 'src/app/interfaces/post.interface';

@Component({
	selector: 'app-feed',
	templateUrl: './feed.component.html',
	styleUrls: ['./feed.component.css']
})
export class FeedComponent implements OnInit {
	posts: IPost[] = [];

	constructor(
		public dialog: MatDialog,
		private readonly postService: PostService,
		private readonly userService: UserService,
		private readonly followService: FollowService
	) { }

	ngOnInit(): void {
		this.getPosts();
	}

	addPost(): void {
		this.dialog.open(CreatePostDialogComponent);
	}

	getPosts(): void {
		this.userService.currentUser$.pipe(
			concatMap(user => {
				if (!user) throw Error('Not Authenticated!');
				return this.followService.getFollowing(user.uid);
			}),
			concatMap(userIds =>
				this.postService.getPosts(userIds.concat('oCcaMJYioBhm5XoRqPzZXdpeta72'))
			)
		).subscribe(posts => {
			this.posts = posts;
		});
	}
}
