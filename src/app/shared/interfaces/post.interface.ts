import { Timestamp } from '@angular/fire/firestore';

export interface IPost {
    id: string;
    type: string;
    url: string;
    description: string;
    timestamp: Date & Timestamp;
    userId: string;
    user: { displayName: string, photoURL: string };
    likes?: string[];
}
