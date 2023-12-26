import { IUser } from 'src/app/shared/interfaces/user.interface';

export interface IFollowDetails {
    followers: IUser[];
    following: IUser[];
}
