import { Injectable } from '@angular/core';
import { CollectionReference, DocumentData, Firestore, collection, collectionData, deleteDoc, doc, setDoc } from '@angular/fire/firestore';
import { query } from 'firebase/firestore';
import { Observable, from } from 'rxjs';

@Injectable({
	providedIn: 'root'
})
export class FollowService {

	constructor(private readonly firestore: Firestore) { }

	getFollowers(userId: string) {
		const ref: CollectionReference<DocumentData> = collection(this.firestore, `followers/${userId}`);
		return collectionData(query(ref)) as Observable<any[]>;
	}

	getFollowing(followerId: string, followedId: string) {
		const ref: CollectionReference<DocumentData> = collection(this.firestore, `following/${followerId}/${followedId}`);
		return collectionData(query(ref)) as Observable<any[]>;
	}

	follow(followerId: string, followedId: string) {
		return from(Promise.all([
			setDoc(doc(this.firestore, `followers/${followedId}`), { [followerId]: true }),
			setDoc(doc(this.firestore, `following/${followerId}`), { [followedId]: true })
		]));
	}

	unfollow(followerId: string, followedId: string) {

	}
}
