import { Component, OnInit, Inject, ViewEncapsulation } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { IStory } from 'src/app/interfaces/story.interface';

@Component({
	selector: 'app-story-preview',
	templateUrl: './story-preview.component.html',
	styleUrls: ['./story-preview.component.css'],
	encapsulation: ViewEncapsulation.None
})
export class StoryPreviewComponent implements OnInit {
	currentIndex: number = 0;

	constructor(
		public dialogRef: MatDialogRef<StoryPreviewComponent>,
		@Inject(MAT_DIALOG_DATA) public data: IStory[]
	) { }

	ngOnInit(): void {
	}

	next() {
		if (this.currentIndex === (this.data.length - 1)) this.dialogRef.close();
		else this.currentIndex++;
	}

	prev() {
		if (this.currentIndex === 0) this.dialogRef.close();
		else this.currentIndex--;
	}

	closeDialog(): void {
		this.dialogRef.close();
	}
}
