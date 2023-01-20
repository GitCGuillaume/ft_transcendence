import { IsString, IsInt, IsArray, ValidateNested, IsObject, IsDefined, IsNumber } from 'class-validator';
import { Type } from 'class-transformer';

class Pair {
    @IsString()
    key: string;
    @IsNumber()
    value: number
}

export class CreateChatDto {
    @IsString()
    id: string;
    @IsString()
    name: string;
    @IsInt()
    owner: number;
    @IsString()
    accessType: string;
    @IsString()
    password: string;
    @IsArray()
    lstMsg: Array<{
        avatarUrl: string,
        id: number | string,
        username: string,
        content: string
    }>;
    @IsArray()
    lstUsr: Array<{
        avatarUrl: string,
        id: number | string,
        username: string,
        content: string
    }>;

    @IsDefined()
    @IsObject()
    @ValidateNested()
    @Type(() => Pair)
    setMute: Pair;
    @IsDefined()
    @IsObject()
    @ValidateNested()
    @Type(() => Pair)
    setBan: Pair;
    
    @IsDefined()
    @ValidateNested()
    @Type(() => Map<string, number>)
    lstMute: Map<string, number>;
    @IsDefined()
    @ValidateNested()
    @Type(() => Map<string, number>)
    lstBan: Map<string, number>;
}

