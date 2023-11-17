import { Component, OnInit, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { IStory } from 'src/app/interfaces/story.interface';

@Component({
	selector: 'app-story-preview',
	templateUrl: './story-preview.component.html',
	styleUrls: ['./story-preview.component.css']
})
export class StoryPreviewComponent implements OnInit {

	constructor(
		public dialogRef: MatDialogRef<StoryPreviewComponent>,
		@Inject(MAT_DIALOG_DATA) public data: IStory
	) { }

	ngOnInit(): void {
	}

	closeDialog(): void {
		this.dialogRef.close();
	}
}
