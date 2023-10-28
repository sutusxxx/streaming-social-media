import { Timestamp } from 'firebase/firestore';

export interface INotification {
    message: string;
    read: boolean;
    date: Date & Timestamp;
}
