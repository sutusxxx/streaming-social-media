import { Timestamp } from 'firebase/firestore';
import { IRegistration } from 'src/app/shared/interfaces';

export class UserRegistration {
    displayName: string;
    email: string;
    password: string;
    gender?: string;
    fullName?: string;
    dateOfBirth?: Date & Timestamp;

    constructor(registration: IRegistration) {
        this.email = registration.email;
        this.displayName = registration.displayName.toLowerCase();
        this.password = registration.password;

        if (registration.gender) {
            this.gender = registration.gender
        }
        if (registration.fullName) {
            this.fullName = registration.fullName;
        }
        if (registration.dateOfBirth) {
            this.dateOfBirth = registration.dateOfBirth;
        }
    }
}
