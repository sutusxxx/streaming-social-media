import { Component, OnInit } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { PostService } from '@services/post.service';
import { UserService } from '@services/user.service';
import { take } from 'rxjs';

@Component({
	selector: 'app-create-post-dialog',
	templateUrl: './create-post-dialog.component.html',
	styleUrls: ['./create-post-dialog.component.css']
})
export class CreatePostDialogComponent implements OnInit {
	selectedImage?: File;
	description: string = '';

	user$ = this.userService.currentUser$;

	constructor(
		private readonly userService: UserService,
		private readonly postService: PostService,
		private readonly dialog: MatDialogRef<CreatePostDialogComponent>
	) { }

	ngOnInit(): void {
	}

	onPhotoSelected(selector: HTMLInputElement): void {
		if (!selector.files) return;

		this.selectedImage = selector.files[0];
		const reader = new FileReader();
		reader.readAsDataURL(this.selectedImage);
		reader.onloadend = event => {
			const previewImage = <HTMLImageElement>document.getElementById("post-preview-image");
			if (!reader.result) return;

			previewImage.src = reader.result?.toString();
		}
	}

	add(): void {
		if (!this.selectedImage) return;

		this.postService.createPost(this.selectedImage, this.description)
			.pipe(take(1))
			.subscribe(() => {
				this.dialog.close();
			});
	}
}
