import { Timestamp } from 'firebase/firestore';

export interface INotification {
    id: string;
    from: string;
    messageKey: string;
    read: boolean;
    date: Date & Timestamp;
}

export enum MessageKey {
    LIVE = 'liveNotification',
    LIKE = 'likeNotification',
    FOLLOW = 'followNotification'
}
