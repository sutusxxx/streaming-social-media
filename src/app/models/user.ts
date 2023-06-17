import { IUser } from "../interfaces";

export class User implements IUser {
    uid: string;
    email: string;
    displayName: string;
    image?: string;

    constructor(id: string, email: string, name: string) {
        this.uid = id;
        this.email = email;
        this.displayName = name;
    }
}