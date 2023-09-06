import { IsIn, IsNotEmpty, IsNumber, IsOptional, IsString } from "class-validator";

export class PostActionDto {
    @IsNotEmpty()
    @IsString()
    id: string;

    @IsNotEmpty()
    @IsString()
    @IsIn(["Grant", "Remove", "Ban", "Mute", "Kick",
        "grant", "remove", "ban", "mute", "kick",
        "unban", "unmute"])
    action: string

    @IsOptional()
    @IsString()
    option: string;

    @IsNumber()
    userId: number;
}

export class PostActionDtoPsw {
    @IsNotEmpty()
    @IsString()
    id: string;

    @IsNotEmpty()
    @IsString()
    @IsIn(["setpsw", "unsetpsw"])
    action: string

    @IsNotEmpty()
    @IsString()
    psw: string;
}