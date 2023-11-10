import { combineLatest, concatMap, from, Observable, of, take } from 'rxjs';
import { v4 as uuidv4 } from 'uuid';

import { Injectable } from '@angular/core';
import {
	addDoc,
	arrayRemove,
	arrayUnion,
	collection,
	collectionData,
	deleteDoc,
	doc,
	Firestore,
	limit,
	orderBy,
	query,
	startAt,
	Timestamp,
	updateDoc,
	where
} from '@angular/fire/firestore';

import { IComment } from '../interfaces/comment.interface';
import { IPost } from '../interfaces/post.interface';
import { ImageUploadService } from './image-upload.service';
import { UserService } from './user.service';

@Injectable({
	providedIn: 'root'
})
export class PostService {

	constructor(
		private readonly userService: UserService,
		private readonly firestore: Firestore,
		private readonly imageUploadService: ImageUploadService
	) { }

	createPost(image: File, description: string): Observable<any> {
		return this.userService.currentUser$.pipe(
			take(1),
			concatMap(currentUser => {
				if (!currentUser) throw Error('Not Authenticated');

				const postId = currentUser.uid + '-' + uuidv4();
				return combineLatest([
					of(currentUser),
					this.imageUploadService.uploadImage(image, `posts/images/${postId}`)
				]);
			}),
			concatMap(([user, url]) => {
				const ref = collection(this.firestore, 'posts');
				return addDoc(ref, {
					type: 'image',
					url,
					description,
					timestamp: Timestamp.fromDate(new Date()),
					userId: user.uid,
					user: {
						displayName: user.displayName,
						photoURL: user.photoURL ? user.photoURL : ''
					}
				});
			})
		)
	}

	getPosts(
		userIds: string[],
		options?: {
			include?: boolean,
			count?: number,
			startAt?: number
		}
	): Observable<IPost[]> {
		const ref = collection(this.firestore, 'posts');
		const ArrayOperator = options?.include ? 'in' : 'not-in';
		const limitOption = options?.count ? limit(options.count) : limit(12);
		// const startAtOption = options?.startAt ? startAt()
		const q = userIds.length
			? query(ref, where('userId', ArrayOperator, userIds), limitOption,)
			: query(ref, orderBy('timestamp', 'desc'), limitOption);
		return collectionData(q, { idField: 'id' }) as Observable<IPost[]>;
	}

	deletePost(postId: string): Observable<void> {
		const ref = doc(this.firestore, 'posts', postId);
		return from(deleteDoc(ref));
	}

	likePost(postId: string, userId: string): Observable<any> {
		const ref = doc(this.firestore, 'posts', postId);
		return from(updateDoc(
			ref, {
			likes: arrayUnion(userId)
		}));
	}

	dislikePost(postId: string, userId: string): Observable<any> {
		const ref = doc(this.firestore, 'posts', postId);
		return from(updateDoc(
			ref, {
			likes: arrayRemove(userId)
		}));
	}

	addComment(postId: string, comment: string): Observable<any> {
		const ref = collection(this.firestore, 'posts', postId, 'comments');
		return this.userService.currentUser$.pipe(
			take(1),
			concatMap(currentUser =>
				addDoc(
					ref, {
					text: comment,
					creatorId: currentUser?.uid,
					creatorName: currentUser?.displayName,
					creatorPhoto: currentUser?.photoURL,
					date: Timestamp.fromDate(new Date())
				})
			)
		);
	}

	getPostComments$(postId: string): Observable<IComment[]> {
		const ref = collection(this.firestore, 'posts', postId, 'comments');
		const queryAll = query(ref, orderBy('date', 'asc'));

		return collectionData(queryAll) as Observable<IComment[]>;
	}
}
