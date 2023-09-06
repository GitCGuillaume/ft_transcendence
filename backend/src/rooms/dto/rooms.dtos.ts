import { IsDefined, IsNotEmpty, IsNumber, IsString, MinLength } from "class-validator";

export class CreateRoomDto {
  @IsNotEmpty()
  @MinLength(3)
  roomName: string;
  settings: {
    powerUps: boolean;
    type: string;
    goal: number;
    speed: number;
    acceleration: number;
    ballSize: number;
    ballColor: string;
  };
}

export class CreateRoomPrivate {
  @IsNumber()
  settings: {
    powerUps: boolean;
    type: string;
    goal: number;
    speed: number;
    acceleration: number;
    ballSize: number;
    ballColor: string;
  };
  id: number;
}

export class CreateRoomInvite {
  @IsNumber()
  id: number;
}

export class ParamRoom {
  @IsDefined()
  @IsString()
  id: string;
}