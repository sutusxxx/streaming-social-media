import { Timestamp } from 'firebase/firestore';

export interface IUser {
    uid: string;
    email?: string;
    displayName?: string;
    fullName?: string;
    gender?: string;
    dateOfBirth?: Date & Timestamp;
    photoURL?: string;
    description?: string;
}
