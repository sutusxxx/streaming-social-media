import { deleteField, DocumentReference } from 'firebase/firestore';
import { catchError, combineLatest, from, map, Observable, throwError } from 'rxjs';

import { Injectable } from '@angular/core';
import {
	doc,
	docData,
	DocumentData,
	Firestore,
	runTransaction,
	setDoc
} from '@angular/fire/firestore';

import { IFollowDetails } from '../interfaces';
import { UserService } from './user.service';

@Injectable({
	providedIn: 'root'
})
export class FollowService {

	constructor(
		private readonly firestore: Firestore,
		private readonly userService: UserService
	) { }

	getFollowers(userId: string): Observable<string[]> {
		const ref: DocumentReference<DocumentData> = doc(this.firestore, `followers/${userId}`);
		return (docData(ref) as Observable<any>)
			.pipe(map(values => {
				if (!values) return [];
				return Object.keys(values)
			}));
	}

	getFollowing(userId: string): Observable<string[]> {
		const ref: DocumentReference<DocumentData> = doc(this.firestore, `following/${userId}`);
		return (docData(ref) as Observable<any>)
			.pipe(map(values => {
				if (!values) return [];
				return Object.keys(values)
			}));
	}

	getDetails(followerIds: string[], followingIds: string[]): Observable<IFollowDetails> {
		return combineLatest([
			this.userService.getMultipleUsersById(followerIds),
			this.userService.getMultipleUsersById(followingIds)
		]).pipe(
			map(([followers, following]) => {
				return {
					followers,
					following
				};
			})
		);
	}

	follow(currentUserId: string, targetUserId: string) {
		return from(runTransaction(this.firestore, async transaction => {
			const followerRef: DocumentReference<DocumentData> = doc(this.firestore, 'followers', targetUserId);
			transaction.set(followerRef, { [currentUserId]: true }, { merge: true })

			const followingRef: DocumentReference<DocumentData> = doc(this.firestore, 'following', currentUserId);
			transaction.set(followingRef, { [targetUserId]: true }, { merge: true });
		})).pipe(
			catchError(error => throwError(() => console.log(error)))
		);
	}

	unfollow(currentUserId: string, targetUserId: string) {
		return from(runTransaction(this.firestore, async transaction => {
			const followerRef: DocumentReference<DocumentData> = doc(this.firestore, 'followers', targetUserId);
			transaction.update(followerRef, { [currentUserId]: deleteField() });

			const followingRef: DocumentReference<DocumentData> = doc(this.firestore, 'following', currentUserId);
			transaction.update(followingRef, { [targetUserId]: deleteField() });
		})).pipe(
			catchError(error => throwError(() => console.log(error)))
		);

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
