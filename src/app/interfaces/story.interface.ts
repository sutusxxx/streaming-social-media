import { Timestamp } from "firebase/firestore";

export interface IStory {
    url: string;
    date: Timestamp;
    userId: string;
}