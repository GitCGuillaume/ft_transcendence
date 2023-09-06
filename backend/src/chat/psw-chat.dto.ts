import {
    IsString
} from 'class-validator';

export class PswChat {
    @IsString()
    id: string;
    @IsString()
    psw: string;
}