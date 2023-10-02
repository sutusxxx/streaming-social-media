import { Injectable } from '@angular/core';
import { CollectionReference, DocumentData, Firestore, collection, collectionData, deleteDoc, doc, docData, setDoc } from '@angular/fire/firestore';
import { DocumentReference, query, runTransaction, updateDoc, writeBatch } from 'firebase/firestore';
import { Observable, from } from 'rxjs';

@Injectable({
	providedIn: 'root'
})
export class FollowService {

	constructor(private readonly firestore: Firestore) { }

	getFollowers(userId: string) {
		const ref: DocumentReference<DocumentData> = doc(this.firestore, `followers/${userId}`);
		return docData(ref) as Observable<any>;
	}

	getFollowing(followerId: string, followedId: string) {
		const ref: DocumentReference<DocumentData> = doc(this.firestore, `following/${followerId}`);
		return docData(ref) as Observable<any>;
	}

	async follow(currentUserId: string, targetUserId: string) {
		try {
			const batch = writeBatch(this.firestore);
			const followerRef: DocumentReference<DocumentData> = doc(this.firestore, 'users', currentUserId);
			batch.update(followerRef, { following: [targetUserId] });

			const followingRef: DocumentReference<DocumentData> = doc(this.firestore, 'users', targetUserId);
			batch.update(followingRef, { follwers: [currentUserId] });
			await batch.commit();
		} catch (error) {
			console.log(error);
		}
	}

	unfollow(followerId: string, followedId: string) {

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
