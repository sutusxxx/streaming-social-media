import { Timestamp } from "@angular/fire/firestore";
import { IUser } from "./user.interface";

export interface IChat {
    id: string;
    lastMessage?: string;
    lastMessageDate?: Date & Timestamp;
    userIds: string[];
    users: IUser[];

    chatPic?: string;
    chatName?: string;
}