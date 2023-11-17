import { IUser } from "../interfaces";
import { IStory } from "../interfaces/story.interface";

export class User implements IUser {
    uid: string;
    email?: string;
    displayName?: string;
    fullName?: string;
    gender?: string;
    dateOfBirth?: Date;
    photoURL?: string;
    story?: IStory;
    description?: string;

    constructor(
        id: string,
        parameters?: {
            email?: string,
            displayName?: string,
            fullName?: string,
            gender?: string,
            dateOfBirth?: Date,
            photoURL?: string,
            story?: IStory,
            description?: string
        }
    ) {
        this.uid = id;

        if (parameters) {
            if (parameters.email) this.email = parameters.email;
            if (parameters.displayName) this.displayName = parameters.displayName;
            if (parameters.fullName) this.fullName = parameters.fullName;
            if (parameters.gender) this.gender = parameters.gender;
            if (parameters.dateOfBirth) this.dateOfBirth = parameters.dateOfBirth;
            if (parameters.photoURL) this.photoURL = parameters.photoURL;
            if (parameters.story) this.story = parameters.story;
            if (parameters.description) this.description = parameters.description;

        }
    }
}