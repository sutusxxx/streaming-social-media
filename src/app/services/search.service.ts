import { Injectable } from '@angular/core';
import { Firestore, collectionData } from '@angular/fire/firestore';
import { collection, endAt, limit, orderBy, query, startAt } from 'firebase/firestore';
import { Observable, of } from 'rxjs';
import { User } from '../models';

@Injectable({
    providedIn: 'root'
})
export class SearchService {
    constructor(private readonly firestore: Firestore) {
    }

    search(term: string): Observable<User[]> {
        const trimmedText: string = term.trim().toLowerCase();
        if (!trimmedText) return of([]);

        const ref = collection(this.firestore, 'users');
        const q = query(
            ref, limit(5), orderBy('displayName'), startAt(trimmedText), endAt((trimmedText + '\uf8ff'))
        );
        return collectionData(q) as Observable<User[]>;
    }
}