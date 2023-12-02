import { Injectable } from '@angular/core';
import { Firestore, collectionData, addDoc, collection, query, where } from '@angular/fire/firestore';
import { User } from '../models';
import { Observable, concatMap, map, take, throwError } from 'rxjs';
import { UserService } from './user.service';
import { IChat, IMessage } from '../interfaces';
import { Timestamp, doc, limit, orderBy, updateDoc } from 'firebase/firestore';

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

	addChatMessage(chatId: string, message: string): Observable<any> {
		const ref = collection(this.firestore, 'chats', chatId, 'messages');
		const chatRef = doc(this.firestore, 'chats', chatId);
		const date = Timestamp.fromDate(new Date());
		return this.userService.currentUser$.pipe(
			take(1),
			concatMap(currentUser => addDoc(ref, {
				text: message,
				senderId: currentUser?.uid,
				date: date
			})),
			concatMap(() => updateDoc(chatRef, { lastMessage: message, lastMessageDate: date }))
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
		const queryAll = query(ref, orderBy('date', 'asc'));

		return collectionData(queryAll) as Observable<IMessage[]>;
	}
}