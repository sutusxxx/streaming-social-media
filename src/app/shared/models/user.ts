import { Timestamp } from 'firebase/firestore';
import { UserRegistration } from 'src/app/shared/models/user-registration';

import { IUser } from '../interfaces';

export class User implements IUser {
    uid: string;
    email?: string;
    displayName?: string;
    fullName?: string;
    gender?: string;
    dateOfBirth?: Date & Timestamp;
    photoURL?: string;
    description?: string;

    constructor(
        id: string,
        parameters?: {
            email?: string,
            displayName?: string,
            fullName?: string,
            gender?: string,
            dateOfBirth?: Date & Timestamp,
            photoURL?: string,
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
            if (parameters.description) this.description = parameters.description;

        }
    }

    static fromRegistration(uid: string, reg: UserRegistration): User {
        const user = new User(uid);
        user.displayName = reg.displayName;
        user.email = reg.email;

        if (reg.gender) {
            user.gender = reg.gender;
        }
        if (reg.fullName) {
            user.fullName = reg.fullName;
        }
        if (reg.dateOfBirth) {
            user.dateOfBirth = reg.dateOfBirth;
        }

        return user;
    }
}
