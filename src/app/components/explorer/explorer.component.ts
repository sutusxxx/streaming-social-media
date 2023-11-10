import { combineLatest, concatMap, Observable, of } from 'rxjs';
import { IPost } from 'src/app/interfaces/post.interface';

import { Component, OnInit } from '@angular/core';
import { FollowService } from '@services/follow.service';
import { PostService } from '@services/post.service';
import { UserService } from '@services/user.service';

@Component({
	selector: 'app-explorer',
	templateUrl: './explorer.component.html',
	styleUrls: ['./explorer.component.css']
})
export class ExplorerComponent implements OnInit {
	posts$: Observable<IPost[]> = this.userService.currentUser$.pipe(
		concatMap(user => {
			if (!user) throw Error('Not Authenticated!');
			return combineLatest([of(user.uid), this.followService.getFollowing(user.uid)]);
		}),
		concatMap(([currentUserId, userIds]) =>
			this.postService.getPosts(userIds.concat(currentUserId), { include: false })
		)
	);

	constructor(
		private readonly userService: UserService,
		private readonly followService: FollowService,
		private readonly postService: PostService
	) { }

	ngOnInit(): void {
	}

}
