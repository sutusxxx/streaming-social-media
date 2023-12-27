import { Timestamp } from 'firebase/firestore';

export interface IRegistration {
    displayName: string;
    email: string;
    password: string;
    confirmPassword: string;
    fullName: string;
    gender: string;
    dateOfBirth: Date & Timestamp;
}
