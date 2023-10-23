import { Component, Input, OnInit } from '@angular/core';
import { IPost } from 'src/app/interfaces/post.interface';

@Component({
	selector: 'app-post',
	templateUrl: './post.component.html',
	styleUrls: ['./post.component.css']
})
export class PostComponent implements OnInit {
	@Input() data: IPost | null = null;

	constructor() { }

	ngOnInit(): void {
	}

}
