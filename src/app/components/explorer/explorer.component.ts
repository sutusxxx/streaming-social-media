import { Observable } from 'rxjs';
import { IPost } from 'src/app/interfaces/post.interface';

import { Component, OnInit } from '@angular/core';
import { PostService } from '@services/post.service';

@Component({
	selector: 'app-explorer',
	templateUrl: './explorer.component.html',
	styleUrls: ['./explorer.component.css']
})
export class ExplorerComponent implements OnInit {
	posts$: Observable<IPost[]> = this.postService.getPosts();

	constructor(
		private readonly postService: PostService
	) { }

	ngOnInit(): void {
	}

}
