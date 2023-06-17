import { Timestamp } from "@angular/fire/firestore";

export interface IMessage {
    text: string;
    senderId: string;
    date: Date & Timestamp;
}