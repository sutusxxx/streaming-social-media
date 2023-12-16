import { concatMap, from, Observable, of, throwError } from 'rxjs';

import { Injectable } from '@angular/core';
import {
    Auth,
    authState,
    createUserWithEmailAndPassword,
    deleteUser,
    FacebookAuthProvider,
    GoogleAuthProvider,
    sendPasswordResetEmail,
    signInWithEmailAndPassword,
    signInWithPopup,
    updateEmail,
    updatePassword,
    updateProfile,
    UserCredential,
    UserInfo
} from '@angular/fire/auth';

@Injectable({
    providedIn: 'root'
})
export class AuthService {
    currentUser$ = authState(this.auth);

    constructor(private readonly auth: Auth) { }

    login(email: string, password: string): Observable<UserCredential> {
        return from(signInWithEmailAndPassword(this.auth, email, password));
    }

    signInWithGoogle(): Observable<UserCredential> {
        return from(signInWithPopup(this.auth, new GoogleAuthProvider));
    }

    signInWithFacebook(): Observable<UserCredential> {
        return from(signInWithPopup(this.auth, new FacebookAuthProvider));
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

    updateUserPassword(newPassword: string): Observable<any> {
        const user = this.auth.currentUser;
        if (!user) return throwError(() => 'Not Authenticated!');

        return from(updatePassword(user, newPassword));
    }

    resetPasswordByEmail(email: string): Observable<any> {
        return from(sendPasswordResetEmail(this.auth, email));
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
