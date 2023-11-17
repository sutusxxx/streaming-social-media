import { Injectable } from '@angular/core';
import { DocumentData, DocumentReference, Timestamp, doc, updateDoc } from 'firebase/firestore';
import { Observable, from, of, switchMap } from 'rxjs';
import { IStory } from '../interfaces/story.interface';
import { Firestore, docData, setDoc } from '@angular/fire/firestore';

@Injectable({
	providedIn: 'root'
})
export class StoryService {
	constructor(
		private readonly firestore: Firestore
	) {
	}

	addStory(userId: string, url: string): Observable<void> {
		const ref: DocumentReference<DocumentData> = doc(this.firestore, 'stories', userId);
		const story: IStory = {
			url,
			date: Timestamp.fromDate(new Date())
		};
		return from(setDoc(ref, { ...story }));
	}

	getStory(userId: string): Observable<IStory | null> {
		const ref: DocumentReference<DocumentData> = doc(this.firestore, 'stories', userId);
		return (docData(ref) as Observable<IStory>).pipe(
			switchMap((story: IStory) => {
				// Dátum ellenőrzése... Lekérni egy collection-t nem userId alapján elmenteni hanem a storynak legyen userId mezője az alapján query és dátum. ezek után több storyja is lehet a felhasználónak
				return of(story);
			})
		);
	}
}
