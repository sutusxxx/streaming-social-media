import { IUser } from "../interfaces";

export class User implements IUser {
    uid: string;
    email?: string;
    displayName?: string;
    photoURL?: string;
    description?: string;

    constructor(id: string, parameters?: { email?: string, name?: string, photoURL?: string, description?: string }) {
        this.uid = id;

        if (parameters) {
            if (parameters.email) this.email = parameters.email;
            if (parameters.name) this.displayName = parameters.name;
            if (parameters.photoURL) this.photoURL = parameters.photoURL;
            if (parameters.description) this.description = parameters.description;

        }
    }
}