import { Timestamp } from 'firebase/firestore';

export interface IHost {
    id: string;
    name?: string;
    photoURL?: string;
    date: Date & Timestamp;
}
