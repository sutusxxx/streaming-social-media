import { Timestamp } from "firebase/firestore";

export interface IComment {
    text: string;
    creatorId: string;
    creatorName: string;
    creatorPhoto: string;
    date: Date & Timestamp;
}