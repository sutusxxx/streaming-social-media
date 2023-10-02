import { Injectable } from '@angular/core';
import { CollectionReference, DocumentData, Firestore, collection, collectionData, deleteDoc, doc, docData, setDoc } from '@angular/fire/firestore';
import { DocumentReference, deleteField, query, runTransaction, updateDoc, writeBatch } from 'firebase/firestore';
import { Observable, from, map } from 'rxjs';

@Injectable({
	providedIn: 'root'
})
export class FollowService {

	constructor(private readonly firestore: Firestore) { }

	getFollowers(userId: string) {
		console.log(userId);
		const ref: DocumentReference<DocumentData> = doc(this.firestore, `followers/${userId}`);
		return (docData(ref) as Observable<any>)
			.pipe(map(values => Object.keys(values)));
	}

	getFollowing(userId: string) {
		const ref: DocumentReference<DocumentData> = doc(this.firestore, `following/${userId}`);
		return (docData(ref) as Observable<any>)
			.pipe(map(values => Object.keys(values)));
	}

	async follow(currentUserId: string, targetUserId: string) {
		try {
			const batch = writeBatch(this.firestore);
			const followerRef: DocumentReference<DocumentData> = doc(this.firestore, 'followers', targetUserId);
			batch.set(followerRef, { [currentUserId]: true }, { merge: true });

			const followingRef: DocumentReference<DocumentData> = doc(this.firestore, 'following', currentUserId);
			batch.set(followingRef, { [targetUserId]: true }, { merge: true });
			await batch.commit();
		} catch (error) {
			console.log(error);
		}
	}

	async unfollow(currentUserId: string, targetUserId: string) {
		try {
			const batch = writeBatch(this.firestore);
			const followerRef: DocumentReference<DocumentData> = doc(this.firestore, 'followers', targetUserId);
			batch.update(followerRef, { [currentUserId]: deleteField() });

			const followingRef: DocumentReference<DocumentData> = doc(this.firestore, 'following', currentUserId);
			batch.update(followingRef, { [targetUserId]: deleteField() });
			await batch.commit();
		} catch (error) {
			console.log(error);
		}
	}

	private saveFollowing(followerId: string, followedId: string): Promise<any> {
		const ref: DocumentReference<DocumentData> = doc(this.firestore, 'users', followerId);
		return setDoc(ref, { following: [followedId] }, { merge: true });
	}

	private saveFollowed(followerId: string, followedId: string): Promise<any> {
		const ref: DocumentReference<DocumentData> = doc(this.firestore, 'users', followedId);
		return setDoc(ref, { followers: [followerId] }, { merge: true });
	}
}
