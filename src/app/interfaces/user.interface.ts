import { IStory } from "./story.interface";

export interface IUser {
    uid: string;
    email?: string;
    displayName?: string;
    fullName?: string;
    gender?: string;
    dateOfBirth?: Date;
    photoURL?: string;
    story?: IStory;
    description?: string;
}