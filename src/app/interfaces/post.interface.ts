import { Timestamp } from "@angular/fire/firestore";
import { User } from "../models";

export interface IPost {
    type: string;
    url: string;
    description: string;
    timestamp: Date & Timestamp;
    userId: string;
    user: { displayName: string, photoURL: string };
}