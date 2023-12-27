import { doc, orderBy, Timestamp, updateDoc } from 'firebase/firestore';
import { concatMap, map, Observable, take, throwError } from 'rxjs';
import { CreateMessage } from 'src/app/shared/models';

import { Injectable } from '@angular/core';
import {
	addDoc,
	collection,
	collectionData,
	Firestore,
	query,
	where
} from '@angular/fire/firestore';

import { IChat, IMessage, IUser } from '../shared/interfaces';
import { UserService } from './user.service';

@Injectable({
	providedIn: 'root'
})
export class MessengerService {

	constructor(
		private readonly firestore: Firestore,
		private readonly userService: UserService
	) {
	}

	createChat(user: IUser): Observable<string> {
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

	addNewMessage(chatId: string, messageText: string): Observable<any> {
		const ref = collection(this.firestore, 'chats', chatId, 'messages');
		const chatRef = doc(this.firestore, 'chats', chatId);
		const date = Timestamp.fromDate(new Date());
		return this.userService.currentUser$.pipe(
			take(1),
			concatMap(currentUser => {
				if (!currentUser) return throwError(() => 'Not Authenticated');
				const message = new CreateMessage(messageText, currentUser?.uid, date);
				return addDoc(ref, { ...message });
			}),
			concatMap(() => updateDoc(chatRef, { lastMessage: messageText, lastMessageDate: date }))
		);
	}

	isExistingChat(userId: string): Observable<string | null> {
		return this.chats$.pipe(
			take(1),
			map(chats => {
				for (const chat of chats)
					if (chat.userIds.includes(userId)) return chat.id;
				return null;
			})
		)
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

	// getCreatedChats(): Observable<IChat[]> {
	// 	const ref = collection(this.firestore, 'chats');
	// 	return this.userService.currentUser$.pipe(
	// 		concatMap(currentUser => {
	// 			const q = query(ref, where('userIds', 'array-contains', currentUser?.uid));
	// 			return collectionData(q, { idField: 'id' }).pipe(
	// 				map(chats => this.addChatNameAndPicture(currentUser?.uid ?? '', chats as IChat[]))
	// 			);
	// 		})
	// 	);
	// }

	addChatNameAndPicture(currentUserId: string, chats: IChat[]): IChat[] {
		chats.forEach(chat => {
			const otherIndex = chat.userIds.indexOf(currentUserId) === 0 ? 1 : 0;
			const { displayName, photoURL } = chat.users[otherIndex];
			chat.chatName = displayName;
			chat.chatPic = photoURL;
		});

		return chats;
	}

	getChatMessages$(chatId: string): Observable<IMessage[]> {
		const ref = collection(this.firestore, 'chats', chatId, 'messages');
		const queryAll = query(ref, orderBy('date', 'desc'));

		return collectionData(queryAll) as Observable<IMessage[]>;
	}
}
