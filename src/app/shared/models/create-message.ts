import { Timestamp } from 'firebase/firestore';

export class CreateMessage {
    text: string;
    senderId: string;
    date: Timestamp;

    constructor(text: string, senderId: string, date: Timestamp) {
        this.text = text;
        this.senderId = senderId;
        this.date = date;
    }
}
