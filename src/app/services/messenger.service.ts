import { Injectable } from '@angular/core';
import { Firestore, collectionData, addDoc, collection, query, where } from '@angular/fire/firestore';
import { User } from '../models';
import { Observable, concatMap, map, take, throwError } from 'rxjs';
import { UserService } from './user.service';
import { IChat } from '../interfaces';

@Injectable({
	providedIn: 'root'
})
export class MessengerService {

	constructor(
		private readonly firestore: Firestore,
		private readonly userService: UserService
	) {
	}

	createChat(user: User): Observable<string> {
		const ref = collection(this.firestore, 'chats');
		return this.userService.currentUser$.pipe(
			take(1),
			concatMap(currentUser => addDoc(ref, {
				userIds: [currentUser?.uid, user?.uid],
				users: [
					{
						displayName: currentUser?.displayName ?? '',
						photoURL: currentUser?.photoURL ?? ''
					},
					{
						displayName: user?.displayName ?? '',
						photoURL: user.photoURL ?? ''
					}
				]
			})),
			map(ref => ref.id)
		);
	}

	get chats$(): Observable<IChat[]> {
		const ref = collection(this.firestore, 'chats');
		return this.userService.currentUser$.pipe(
			concatMap(currentUser => {
				const q = query(ref, where('userIds', 'array-contains', currentUser?.uid));
				return collectionData(q, { idField: 'id' }).pipe(
					map(chats => this.addChatNameAndPicture(currentUser?.uid ?? '', chats as IChat[]))
				);
			})
		);
	}

	addChatNameAndPicture(currentUserId: string, chats: IChat[]): IChat[] {
		chats.forEach(chat => {
			const otherIndex = chat.userIds.indexOf(currentUserId) === 0 ? 1 : 0;
			const { displayName, photoURL } = chat.users[otherIndex];
			chat.chatName = displayName;
			chat.chatPic = photoURL;
		});

		return chats;
	}
}
