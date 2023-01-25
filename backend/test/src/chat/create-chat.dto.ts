import { IsString, IsInt, IsArray, ValidateNested, IsObject, IsDefined, IsNumber } from 'class-validator';
import { Type } from 'class-transformer';

/* Pair for ban and mute */
/*class Pair {
    @IsString()
    key: string;
    @IsNumber()
    value: number
}*/
/*@IsDefined()
 @IsObject()
 @ValidateNested()
 @Type(() => Pair)
 setMute: Pair;
 @IsDefined()
 @IsObject()
 @ValidateNested()
 @Type(() => Pair)
 setBan: Pair;*/

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
        id: number | string,
        idUser: string,
        username: string, //à enlever pour un find dans repository
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

