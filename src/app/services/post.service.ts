import {
	combineLatest,
	concatMap,
	firstValueFrom,
	from,
	Observable,
	of,
	Subject,
	switchMap
} from 'rxjs';
import { CreatePost } from 'src/app/shared/models';
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
	Timestamp,
	updateDoc,
	where
} from '@angular/fire/firestore';

import { IComment } from '../shared/interfaces/comment.interface';
import { IPost } from '../shared/interfaces/post.interface';
import { FollowService } from './follow.service';
import { ImageUploadService } from './image-upload.service';
import { UserService } from './user.service';

@Injectable({
	providedIn: 'root'
})
export class PostService {

	private feedPostsLoadedSubject: Subject<IPost[]> = new Subject<IPost[]>();
	readonly onFeedPostsLoaded: Observable<IPost[]> = this.feedPostsLoadedSubject.asObservable();

	private postsLoadedSubject: Subject<IPost[]> = new Subject<IPost[]>();
	readonly onPostsLoaded: Observable<IPost[]> = this.postsLoadedSubject.asObservable();

	private userPostsLoadedSubject: Subject<IPost[]> = new Subject<IPost[]>();
	readonly onUserPostsLoaded: Observable<IPost[]> = this.userPostsLoadedSubject.asObservable();

	private postCreatedSubject: Subject<void> = new Subject<void>();
	readonly onPostCreated: Observable<void> = this.postCreatedSubject.asObservable();

	private postDeletedSubject: Subject<string> = new Subject<string>();
	readonly onPostDeleted: Observable<string> = this.postDeletedSubject.asObservable();

	constructor(
		private readonly userService: UserService,
		private readonly firestore: Firestore,
		private readonly imageUploadService: ImageUploadService,
		private readonly followService: FollowService
	) { }

	createPost(image: File, description: string): void {
		this.userService.currentUser$.pipe(concatMap(currentUser => {
			if (!currentUser) throw Error('Not Authenticated');

			const postId = currentUser.uid + '-' + uuidv4();
			return combineLatest([
				of(currentUser),
				this.imageUploadService.uploadImage(image, `posts/images/${postId}`)
			]);
		})).subscribe(async ([user, url]) => {
			const ref = collection(this.firestore, 'posts');
			const post = new CreatePost(
				'image',
				url,
				description,
				Timestamp.fromDate(new Date()),
				user.uid,
				user.displayName ? user.displayName : '',
				user.photoURL ? user.photoURL : ''
			)
			await addDoc(ref, { ...post });
			this.postCreatedSubject.next();
		});
	}

	async loadPosts(lastElement?: IPost): Promise<void> {
		const userIds = await firstValueFrom(this.getUserIds());
		const posts = await this.getPosts(userIds, false, 15, lastElement);
		this.postsLoadedSubject.next(posts);
	}

	async loadFeedPosts(lastElement?: IPost): Promise<void> {
		const userIds = await firstValueFrom(this.getUserIds());
		const posts = await this.getPosts(userIds, true, 3, lastElement);
		this.feedPostsLoadedSubject.next(posts);
	}

	async loadPostsForUser(userId: string, lastElement?: IPost): Promise<void> {
		const posts = await this.getPosts([userId], true, 6, lastElement);
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

	addComment(postId: string, comment: string): void {
		const ref = collection(this.firestore, 'posts', postId, 'comments');
		this.userService.currentUser$.subscribe(currentUser =>
			addDoc(
				ref, {
				text: comment,
				creatorId: currentUser?.uid,
				creatorName: currentUser?.displayName,
				creatorPhoto: currentUser?.photoURL ?? '',
				date: Timestamp.fromDate(new Date())
			})
		)
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

	private async getPosts(userIds: string[], include: boolean, count: number, lastElement?: IPost): Promise<IPost[]> {
		const query = this.createQuery(userIds, include, count, lastElement);
		const snapshot = await getDocs(query);
		const result: IPost[] = []
		snapshot.docs.forEach(doc => {
			const post: IPost = doc.data() as IPost;
			post.id = doc.id;
			result.push(post);
		});
		return result;
	}

	private createQuery(userIds: string[], include: boolean, count: number, lastElement?: IPost): Query<DocumentData> {
		const ref = collection(this.firestore, 'posts');

		if (include) {
			return lastElement
				? query(
					ref,
					where('userId', 'in', userIds),
					orderBy('timestamp', 'desc'),
					startAfter(lastElement.timestamp),
					limit(count)
				)
				: query(ref, where('userId', 'in', userIds), orderBy('timestamp', 'desc'), limit(count));
		} else {
			return lastElement
				? query(
					ref,
					where('userId', 'not-in', userIds),
					orderBy('userId', 'desc'),
					orderBy('timestamp', 'desc'),
					startAfter(lastElement.userId, lastElement.timestamp),
					limit(count)
				)
				: query(
					ref,
					where('userId', 'not-in', userIds),
					orderBy('userId', 'desc'),
					orderBy('timestamp', 'desc'),
					limit(count)
				);
		}
	}
}
