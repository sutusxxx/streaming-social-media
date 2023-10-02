import { Injectable } from '@angular/core';
import { Observable, from, of, switchMap } from 'rxjs';
import { User } from '../models';
import { CollectionReference, DocumentData, DocumentReference, Firestore, collection, collectionData, deleteDoc, doc, docData, query, setDoc, updateDoc } from '@angular/fire/firestore';
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
        const ref: DocumentReference<DocumentData> = doc(this.firestore, 'users', user?.uid);
        return from(setDoc(ref, user));
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
