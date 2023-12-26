import { collection, endAt, limit, orderBy, query, startAt } from 'firebase/firestore';
import { Observable, of } from 'rxjs';
import { IUser } from 'src/app/shared/interfaces';

import { Injectable } from '@angular/core';
import { collectionData, Firestore } from '@angular/fire/firestore';

@Injectable({
    providedIn: 'root'
})
export class SearchService {
    constructor(private readonly firestore: Firestore) {
    }

    search(term: string): Observable<IUser[]> {
        const trimmedText: string = term.trim();
        if (!trimmedText) return of([]);

        const ref = collection(this.firestore, 'users');
        const q = query(
            ref, limit(5), orderBy('displayName'), startAt(trimmedText), endAt((trimmedText + '\uf8ff'))
        );
        return collectionData(q) as Observable<IUser[]>;
    }
}
