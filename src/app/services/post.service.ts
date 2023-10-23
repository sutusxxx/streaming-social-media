import { Injectable } from '@angular/core';
import { Observable, concatMap, of } from 'rxjs';
import { AuthService } from './auth.service';
import { Firestore, Timestamp, addDoc, collection, collectionData, limit, orderBy, query, where } from '@angular/fire/firestore';
import { ImageUploadService } from './image-upload.service';
import { User } from '../models';
import { v4 as uuidv4 } from 'uuid';
import { IPost } from '../interfaces/post.interface';

@Injectable({
	providedIn: 'root'
})
export class PostService {

	constructor(
		private readonly firestore: Firestore,
		private readonly imageUploadService: ImageUploadService
	) { }

	createPost(user: User, image: File, description: string): Observable<any> {
		const postId = user.uid + '-' + uuidv4();
		return this.imageUploadService.uploadImage(image, `posts/images/${postId}`).pipe(
			concatMap(url => {
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
		);
	}

	getPosts(userIds: string[]): Observable<IPost[]> {
		const ref = collection(this.firestore, 'posts');
		const q = query(ref, where('userId', 'in', userIds), orderBy('timestamp', 'desc'), limit(10));
		return collectionData(q) as Observable<IPost[]>;
	}
}
