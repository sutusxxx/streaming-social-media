import { Timestamp } from 'firebase/firestore';

export class CreatePost {
    type: string;
    url: string;
    description: string;
    timestamp: Timestamp;
    userId: string;
    user: { displayName: string, photoURL: string };

    constructor(
        type: string,
        url: string,
        description: string,
        timestamp: Timestamp,
        userId: string,
        displayName: string,
        photoURL: string
    ) {
        this.type = type;
        this.url = url;
        this.description = description;
        this.timestamp = timestamp;
        this.userId = userId;
        this.user = {
            displayName,
            photoURL
        };
    }
}
