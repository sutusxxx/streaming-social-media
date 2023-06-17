import { Injectable } from '@angular/core';
import { Auth, UserCredential, UserInfo, authState, createUserWithEmailAndPassword, deleteUser, signInWithEmailAndPassword, updateEmail, updateProfile } from '@angular/fire/auth';
import { Observable, concatMap, from, of, switchMap } from 'rxjs';

@Injectable({
    providedIn: 'root'
})
export class AuthService {
    currentUser$ = authState(this.auth);

    constructor(private readonly auth: Auth) { }

    login(email: string, password: string): Observable<UserCredential> {
        return from(signInWithEmailAndPassword(this.auth, email, password));
    }

    updateProfileData(profileData: Partial<UserInfo>): Observable<any> {
        const user = this.auth.currentUser;
        return of(user).pipe(
            concatMap(user => {
                if (!user) throw new Error('Not Authenticated');

                if (profileData.email) {
                    updateEmail(user, profileData.email);
                }
                return updateProfile(user, profileData);
            })
        );
    }

    logout(): Observable<void> {
        return from(this.auth.signOut());
    }

    registration(email: string, password: string): Observable<any> {
        return from(createUserWithEmailAndPassword(this.auth, email, password));
    }

    deleteAccount(): Observable<any> {
        const user = this.auth.currentUser;
        return of(user).pipe(
            concatMap(user => {
                if (!user) throw new Error('Not Authenticated');
                return deleteUser(user);
            })
        );
    }
}
