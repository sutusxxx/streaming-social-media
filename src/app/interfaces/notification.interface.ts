import { Timestamp } from 'firebase/firestore';

export interface INotification {
    id: string;
    message: string;
    read: boolean;
    date: Date & Timestamp;
}
