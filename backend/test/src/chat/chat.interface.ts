import { IsString, IsInt } from 'class-validator';

export interface Chat {
    id: number;
    name: string;
    owner: number;
    accessType: number;
}
