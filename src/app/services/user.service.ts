import { limit, runTransaction } from 'firebase/firestore';
import {
    catchError,
    concatMap,
    EMPTY,
    from,
    Observable,
    of,
    switchMap,
    take,
    throwError
} from 'rxjs';
import { INotification, MessageKey } from 'src/app/shared/interfaces/notification.interface';

import { Injectable } from '@angular/core';
import {
    addDoc,
    collection,
    collectionData,
    CollectionReference,
    deleteDoc,
    doc,
    docData,
    DocumentData,
    documentId,
    DocumentReference,
    Firestore,
    getCountFromServer,
    orderBy,
    query,
    setDoc,
    Timestamp,
    updateDoc,
    where
} from '@angular/fire/firestore';

import { IUser } from '../shared/interfaces';
import { User } from '../shared/models';
import { AuthService } from './auth.service';

@Injectable({
    providedIn: 'root'
})
export class UserService {

    constructor(
        private firestore: Firestore,
        private authService: AuthService
    ) { }

    createUser(user: User): Observable<void> {
        const ref: DocumentReference<DocumentData> = doc(this.firestore, 'users', user.uid);
        return from(setDoc(ref, { ...user }));
    }

    createUserIfNotExists(user: User): Observable<void> {
        return this.getUserById(user.uid).pipe(
            concatMap(
                user => (!user) ? this.createUser(user) : EMPTY)
        );
    }

    async generateUsername(displayName?: string): Promise<string> {
        const ref: CollectionReference<DocumentData> = collection(this.firestore, 'users');
        const snapshot = await getCountFromServer(ref);
        const suffix = snapshot.data().count + Math.floor(Math.random() * 91 + 10);
        return displayName
            ? (displayName.replace(/[^\x00-\x7F]/g, "").replace(/\s/g, "").toLowerCase() + suffix)
            : ('user' + suffix);
    }

    checkUsernameAvailability(username: string): Observable<boolean> {
        const ref: CollectionReference<DocumentData> = collection(this.firestore, 'users');
        return collectionData(query(ref, where('displayName', '==', username))).pipe(
            take(1),
            switchMap(users => of(!users || !users.length))
        );
    }

    saveUser(user: User): Observable<void> {
        const ref: DocumentReference<DocumentData> = doc(this.firestore, 'users', user?.uid);
        return from(updateDoc(ref, { ...user }));
    }

    deleteProfile(): Observable<void> {
        return this.currentUser$.pipe(
            switchMap(user => {
                if (!user) return EMPTY;
                const ref: DocumentReference<DocumentData> = doc(this.firestore, 'users', user.uid);
                return from(deleteDoc(ref));
            })
        );
    }

    getUserById(userId: string): Observable<IUser> {
        const ref: DocumentReference<DocumentData> = doc(this.firestore, 'users', userId);
        return docData(ref) as Observable<IUser>;
    }

    getMultipleUsersById(userIds: string[]): Observable<IUser[]> {
        if (!userIds || !userIds.length) return of([]);

        const ref: CollectionReference<DocumentData> = collection(this.firestore, 'users');
        return collectionData(query(ref, where(documentId(), 'in', userIds))) as Observable<IUser[]>;
    }

    notifyUser(userId: string, messageKey: MessageKey, sender: string): Observable<any> {
        const ref: CollectionReference<DocumentData> = collection(this.firestore, 'users', userId, 'notifications');
        return from(addDoc(ref, {
            from: sender,
            messageKey,
            read: false,
            date: Timestamp.fromDate(new Date())
        }));
    }

    setNotificationsToRead(notifications: INotification[]): Observable<void> {
        return this.currentUser$.pipe(
            switchMap(user => {
                if (!user) return of();
                return from(runTransaction(this.firestore, async transaction => {
                    for (const notification of notifications) {
                        notification.read = true;

                        const ref = doc(this.firestore, 'users', user.uid, 'notifications', notification.id);
                        transaction.update(ref, { ...notification });
                    }
                }));
            })
        ).pipe(
            catchError(error => throwError(() => console.log(error)))
        );
    }

    get notifications$(): Observable<INotification[]> {
        return this.currentUser$.pipe(
            switchMap(user => {
                if (!user) return of([]);
                const ref = collection(this.firestore, 'users', user.uid, 'notifications');
                const queryAll = query(ref, orderBy('date', 'desc'), limit(10));
                return collectionData(queryAll, { idField: 'id' }) as Observable<INotification[]>;
            })
        );
    }

    get unreadNotifications$(): Observable<INotification[]> {
        return this.currentUser$.pipe(
            switchMap(user => {
                if (!user) return of([]);
                const ref = collection(this.firestore, 'users', user.uid, 'notifications');
                const queryAll = query(ref, orderBy('date', 'desc'), where('read', '==', false));
                return collectionData(queryAll, { idField: 'id' }) as Observable<INotification[]>;
            })
        );
    }

    get currentUser$(): Observable<IUser | null> {
        return this.authService.currentUser$.pipe(
            switchMap(user => {
                if (!user?.uid) {
                    return of(null);
                }
                const ref = doc(this.firestore, 'users', user.uid);

                return docData(ref) as Observable<IUser>
            })
        );
    }

    get users$(): Observable<IUser[]> {
        const ref: CollectionReference<DocumentData> = collection(this.firestore, 'users');
        return collectionData(query(ref)) as Observable<IUser[]>;
    }
}
