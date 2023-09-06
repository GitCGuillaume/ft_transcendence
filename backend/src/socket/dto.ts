import { IsBoolean, IsDefined, IsNumber, IsObject, IsString } from "class-validator";

export class UpdateTypeRoom {
    @IsBoolean()
    type: boolean;
    @IsDefined()
    @IsString()
    roomId: string;
}

export class LeaveGame {
    @IsDefined()
    @IsString()
    roomId: string;
}

class Settings {
    @IsNumber()
    ballSize: number;
    @IsNumber()
    speed: number;
    @IsNumber()
    acceleration: number;
    @IsNumber()
    goal: number;
    @IsDefined()
    @IsString()
    ballColor: string;
    @IsBoolean()
    powerUps: boolean;
    @IsDefined()
    @IsString()
    type: string;
}

export class UserIdRdy {
    @IsBoolean()
    rdy: boolean;

    @IsDefined()
    @IsString()
    uid: string;

    @IsDefined()
    @IsString()
    usr1: string;

    @IsDefined()
    @IsString()
    usr2: string;

    @IsBoolean()
    custom: boolean;

    @IsDefined()
    @IsObject()
    settings: Settings;
}
