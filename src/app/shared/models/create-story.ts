import { Timestamp } from 'firebase/firestore';
import { IStory } from 'src/app/shared/interfaces';

export class CreateStory implements IStory {
    url: string;
    date: Timestamp;
    userId: string;

    constructor(url: string, date: Timestamp, userId: string) {
        this.url = url;
        this.date = date;
        this.userId = userId;
    }
}
