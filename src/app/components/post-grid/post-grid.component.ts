import { IPost } from 'src/app/shared/interfaces/post.interface';

import { Component, Input, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { PostDetailsComponent } from '@components/post-details/post-details.component';

@Component({
	selector: 'post-grid',
	templateUrl: './post-grid.component.html',
	styleUrls: ['./post-grid.component.css']
})
export class PostGridComponent implements OnInit {
	@Input() cols: number = 3;
	@Input() posts: IPost[] | null = null;

	constructor(public dialog: MatDialog) { }

	ngOnInit(): void {
	}

	showPostDetails(post: IPost): void {
		this.dialog.open(PostDetailsComponent, { data: post });
	}
}
