import { Injectable } from '@angular/core';
import { CollectionReference, DocumentData, DocumentReference, Timestamp, and, doc, updateDoc } from 'firebase/firestore';
import { Observable, filter, from, of, switchMap } from 'rxjs';
import { IStory } from '../interfaces/story.interface';
import { Firestore, addDoc, collection, collectionData, docData, orderBy, query, setDoc, where } from '@angular/fire/firestore';

@Injectable({
	providedIn: 'root'
})
export class StoryService {
	constructor(
		private readonly firestore: Firestore
	) {
	}

	addStory(userId: string, url: string): Observable<any> {
		const ref: CollectionReference<DocumentData> = collection(this.firestore, 'users', userId, 'stories');
		const story: IStory = {
			url,
			date: Timestamp.fromDate(new Date()),
			userId
		};
		return from(addDoc(ref, { ...story }));
	}

	getStory(userId: string): Observable<IStory[] | null> {
		const yesterday = this.getTimestamp();
		const ref: CollectionReference<DocumentData> = collection(this.firestore, 'users', userId, 'stories');
		const q = query(ref, where('userId', '==', userId), where('date', '>', yesterday), orderBy('date', 'asc'));
		return (collectionData(q) as Observable<IStory[]>).pipe(switchMap(story => {
			if (!story || !story.length) return of(null);
			return of(story);
		}));
	}

	private getTimestamp(): Timestamp {
		const today = new Date();
		const yesterday = new Date(today);
		yesterday.setDate(today.getDate() - 1);
		return Timestamp.fromDate(yesterday);
	}
}
