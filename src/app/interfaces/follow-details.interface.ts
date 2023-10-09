import { User } from "../models";

export interface IFollowDetails {
    followers: User[];
    following: User[];
}