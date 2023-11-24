import { concatMap, from, Observable, of, switchMap } from 'rxjs';
import { INotification } from 'src/app/interfaces/notification.interface';

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

import { IUser } from '../interfaces';
import { User } from '../models';
import { AuthService } from './auth.service';

@Injectable({
    providedIn: 'root'
})
export class UserService {

    constructor(
        private firestore: Firestore,
        private authService: AuthService
    ) { }

    createUser(user: IUser): Observable<void> {
        const ref: DocumentReference<DocumentData> = doc(this.firestore, 'users', user.uid);
        return from(setDoc(ref, user));
    }

    createUserIfNotExists(user: IUser): Observable<void> {
        return this.getUserById(user.uid).pipe(
            concatMap(user => {
                if (!user) return this.createUser(user);
                return of();
            })
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
            switchMap(users => of(!users || !users.length))
        );
    }

    saveUser(user: User): Observable<void> {
        const ref: DocumentReference<DocumentData> = doc(this.firestore, 'users', user?.uid);
        return from(updateDoc(ref, { ...user }));
    }

    deleteProfile(userId: string): Observable<void> {
        const ref: DocumentReference<DocumentData> = doc(this.firestore, 'users', userId);
        return from(deleteDoc(ref));
    }

    getUserById(userId: string): Observable<User> {
        const ref: DocumentReference<DocumentData> = doc(this.firestore, 'users', userId);
        return docData(ref) as Observable<User>;
    }

    getMultipleUsersById(userIds: string[]): Observable<User[]> {
        if (!userIds || !userIds.length) return of([]);

        const ref: CollectionReference<DocumentData> = collection(this.firestore, 'users');
        return collectionData(query(ref, where(documentId(), 'in', userIds))) as Observable<User[]>;
    }

    notifyUser(userId: string, text: string): Observable<any> {
        const ref: CollectionReference<DocumentData> = collection(this.firestore, 'users', userId, 'notifications');
        return from(addDoc(ref, {
            message: text,
            read: false,
            date: Timestamp.fromDate(new Date())
        }))
    }

    get notifications$(): Observable<INotification[]> {
        return this.currentUser$.pipe(
            switchMap(user => {
                if (!user) return of([]);
                const ref = collection(this.firestore, 'users', user.uid, 'notifications')
                const queryAll = query(ref, orderBy('date', 'desc'));
                return collectionData(queryAll) as Observable<INotification[]>;
            })
        )
    }

    get currentUser$(): Observable<User | null> {
        return this.authService.currentUser$.pipe(
            switchMap(user => {
                if (!user?.uid) {
                    return of(null);
                }
                const ref = doc(this.firestore, 'users', user.uid);

                return docData(ref) as Observable<User>
            })
        );
    }

    get users$(): Observable<User[]> {
        const ref: CollectionReference<DocumentData> = collection(this.firestore, 'users');
        return collectionData(query(ref)) as Observable<User[]>;
    }
}
