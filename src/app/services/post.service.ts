import { BehaviorSubject, combineLatest, concatMap, firstValueFrom, from, Observable, of, Subject, switchMap, take } from 'rxjs';
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
	docData,
	DocumentData,
	Firestore,
	getDocs,
	limit,
	orderBy,
	Query,
	query,
	startAfter,
	startAt,
	Timestamp,
	updateDoc,
	where
} from '@angular/fire/firestore';

import { IComment } from '../interfaces/comment.interface';
import { IPost } from '../interfaces/post.interface';
import { ImageUploadService } from './image-upload.service';
import { UserService } from './user.service';
import { FollowService } from './follow.service';

@Injectable({
	providedIn: 'root'
})
export class PostService {

	feedPostsLoadedSubject: Subject<IPost[]> = new Subject<IPost[]>();
	onFeedPostsLoaded: Observable<IPost[]> = this.feedPostsLoadedSubject.asObservable();

	postsLoadedSubject: Subject<IPost[]> = new Subject<IPost[]>();
	onPostsLoaded: Observable<IPost[]> = this.postsLoadedSubject.asObservable();

	userPostsLoadedSubject: Subject<IPost[]> = new Subject<IPost[]>();
	onUserPostsLoaded: Observable<IPost[]> = this.userPostsLoadedSubject.asObservable();

	postCreatedSubject: Subject<void> = new Subject<void>();
	onPostCreated: Observable<void> = this.postCreatedSubject.asObservable();

	postDeletedSubject: Subject<string> = new Subject<string>();
	onPostDeleted: Observable<string> = this.postDeletedSubject.asObservable();

	constructor(
		private readonly userService: UserService,
		private readonly firestore: Firestore,
		private readonly imageUploadService: ImageUploadService,
		private readonly followService: FollowService
	) { }

	createPost(image: File, description: string): Observable<any> {
		return this.userService.currentUser$.pipe(
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
				}).then(() => this.postCreatedSubject.next());
			})
		);
	}

	async loadPosts(lastKey?: Date): Promise<void> {
		const userIds = await firstValueFrom(this.getUserIds());
		const posts = await this.getPosts(userIds, false, 12, lastKey);
		this.postsLoadedSubject.next(posts);
	}

	async loadFeedPosts(lastKey?: Date): Promise<void> {
		const userIds = await firstValueFrom(this.getUserIds());
		const posts = await this.getPosts(userIds, true, 3, lastKey);
		this.feedPostsLoadedSubject.next(posts);
	}

	async loadPostsForUser(userId: string, lastKey?: Date): Promise<void> {
		const posts = await this.getPosts([userId], true, 6, lastKey);
		this.userPostsLoadedSubject.next(posts);
	}

	getPostsCount$(userId: string): Observable<number> {
		const ref = collection(this.firestore, 'posts');
		const q = query(ref, where('userId', '==', userId));
		return collectionData(q).pipe(
			switchMap(data => of(data.length))
		);
	}

	async deletePost(postId: string): Promise<void> {
		const ref = doc(this.firestore, 'posts', postId);
		return deleteDoc(ref).then(() => this.postDeletedSubject.next(postId));
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

	getPostCommentPreview$(postId: string): Observable<IComment[]> {
		const ref = collection(this.firestore, 'posts', postId, 'comments');
		const queryAll = query(ref, orderBy('date', 'desc'), limit(2));

		return collectionData(queryAll) as Observable<IComment[]>;
	}

	getCommentsCount$(postId: string): Observable<number> {
		const ref = collection(this.firestore, 'posts', postId, 'comments');
		return (collectionData(ref) as Observable<IComment[]>).pipe(
			switchMap(data => of(data.length))
		);
	}

	getPost(postId: string): Observable<IPost> {
		const ref = doc(this.firestore, 'posts', postId);
		return docData(ref, { idField: 'id' }) as Observable<IPost>;
	}

	private getUserIds(): Observable<string[]> {
		return this.userService.currentUser$.pipe(
			switchMap(user => {
				if (!user) return [];
				return combineLatest([of(user.uid), this.followService.getFollowing(user.uid)]);
			}),
			concatMap(([currentUserId, userIds]) => {
				return of(userIds.concat(currentUserId));
			})
		);
	}

	private async getPosts(userIds: string[], include: boolean, count: number, lastKey?: Date): Promise<IPost[]> {
		const query = this.createQuery(userIds, include, count, lastKey);
		const snapshot = await getDocs(query);
		const result: IPost[] = []
		snapshot.docs.forEach(doc => {
			const post: IPost = doc.data() as IPost;
			post.id = doc.id;
			result.push(post);
		});
		return result;
	}

	private createQuery(userIds: string[], include: boolean, count: number, lastKey?: Date): Query<DocumentData> {
		const ref = collection(this.firestore, 'posts');

		if (include) {
			return lastKey
				? query(ref, where('userId', 'in', userIds), orderBy('timestamp', 'desc'), startAfter(lastKey), limit(count))
				: query(ref, where('userId', 'in', userIds), orderBy('timestamp', 'desc'), limit(count));
		} else {
			return lastKey
				? query(ref, where('userId', 'not-in', userIds), orderBy('userId', 'desc'), orderBy('timestamp', 'desc'), startAfter(lastKey), limit(count))
				: query(ref, where('userId', 'not-in', userIds), orderBy('userId', 'desc'), orderBy('timestamp', 'desc'), limit(count));
		}
	}
}
