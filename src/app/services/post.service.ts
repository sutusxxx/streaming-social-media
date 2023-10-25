import { Injectable } from '@angular/core';
import { Observable, combineLatest, concatMap, from, of, take } from 'rxjs';
import { AuthService } from './auth.service';
import { Firestore, Timestamp, addDoc, arrayRemove, arrayUnion, collection, collectionData, deleteDoc, doc, docData, limit, orderBy, query, setDoc, updateDoc, where } from '@angular/fire/firestore';
import { ImageUploadService } from './image-upload.service';
import { User } from '../models';
import { v4 as uuidv4 } from 'uuid';
import { IPost } from '../interfaces/post.interface';
import { IUser } from '../interfaces';
import { UserService } from './user.service';
import { IComment } from '../interfaces/comment.interface';

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
						photoURL: user.photoURL
					}
				});
			})
		)
	}

	getPosts(userIds: string[]): Observable<IPost[]> {
		const ref = collection(this.firestore, 'posts');
		const q = query(ref, where('userId', 'in', userIds), orderBy('timestamp', 'desc'), limit(10));
		return collectionData(q, { idField: 'id' }) as Observable<IPost[]>;
	}

	deletePost(postId: string): Observable<void> {
		const ref = doc(this.firestore, 'posts', postId);
		return from(deleteDoc(ref));
	}

	likePost(postId: string): Observable<any> {
		return this.userService.currentUser$.pipe(
			take(1),
			concatMap(currentUser => {
				if (!currentUser) throw Error('Not Authenticated');

				const ref = doc(this.firestore, 'posts', postId);
				return updateDoc(
					ref, {
					likes: arrayUnion(currentUser.uid)
				});
			})
		);
	}

	dislikePost(postId: string): Observable<any> {
		return this.userService.currentUser$.pipe(
			take(1),
			concatMap(currentUser => {
				if (!currentUser) throw Error('Not Authenticated');

				const ref = doc(this.firestore, 'posts', postId);
				return updateDoc(
					ref, {
					likes: arrayRemove(currentUser.uid)
				});
			})
		);
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
