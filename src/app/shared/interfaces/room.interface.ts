import { IHost } from 'src/app/shared/interfaces/host.interface';
import { IOffer } from 'src/app/shared/interfaces/offer.interface';

export interface IRoom {
    id: string;
    host: IHost;
    offer: IOffer;
}
