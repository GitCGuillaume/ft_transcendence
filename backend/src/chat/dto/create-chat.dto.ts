import { IsString, IsArray, ValidateNested, IsDefined } from 'class-validator';
import { Type } from 'class-transformer';

export class Owner {
    @IsString()
    idUser: number;
    @IsString()
    username: string | undefined
}

export class CreateChatDto {
    @IsString()
    id: string;
    @IsString()
    name: string;
    @IsString()
    accesstype: string;
    @IsString()
    password: string;
    @IsArray()
    lstMsg: Array<{
        user_id: number,
        username: string,
        content: string
    }>;
    @IsDefined()
    @ValidateNested()
    @Type(() => Map<string, string>)
    lstUsr: Map<number | string, string>
    @IsDefined()
    @ValidateNested()
    @Type(() => Map<string, number>)
    lstMute: Map<string, number>;
    @IsDefined()
    @ValidateNested()
    @Type(() => Map<string, number>)
    lstBan: Map<string, number>;
}

