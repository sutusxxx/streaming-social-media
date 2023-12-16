import { Component, OnInit, Inject, ViewEncapsulation } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { BaseComponent } from '@components/base/base.component';
import { UserService } from '@services/user.service';
import { interval, takeUntil } from 'rxjs';
import { IStory } from 'src/app/interfaces/story.interface';
import { User } from 'src/app/models';

@Component({
	selector: 'story-preview',
	templateUrl: './story-preview.component.html',
	styleUrls: ['./story-preview.component.css'],
	encapsulation: ViewEncapsulation.None
})
export class StoryPreviewComponent extends BaseComponent implements OnInit {
	currentIndex: number = 0;
	progress: number = 0;
	user: User | null = null;
	constructor(
		public dialogRef: MatDialogRef<StoryPreviewComponent>,
		@Inject(MAT_DIALOG_DATA) public data: IStory[],
		private readonly userService: UserService
	) {
		super();
	}

	ngOnInit(): void {
		interval(50).pipe(takeUntil(this._unsubscribeAll)).subscribe(() => {
			this.progress++;
			if (this.progress === 100) this.next();
		});
		this.userService.getUserById(this.data[0].userId)
			.pipe(takeUntil(this._unsubscribeAll))
			.subscribe(user => {
				this.user = user;
			});
	}

	next(): void {
		if (this.currentIndex === (this.data.length - 1)) this.dialogRef.close();
		else this.currentIndex++;
		this.progress = 0;
	}

	prev(): void {
		if (this.progress < 50) {
			if (this.currentIndex === 0) this.dialogRef.close();
			else this.currentIndex--;
		}
		this.progress = 0;
	}

	closeDialog(): void {
		this.dialogRef.close();
	}
}
