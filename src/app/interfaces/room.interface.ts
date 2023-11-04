import { IHost } from 'src/app/interfaces/host.interface';
import { IOffer } from 'src/app/interfaces/offer.interface';

export interface IRoom {
    id: string;
    host: IHost
    offer: IOffer;
}
