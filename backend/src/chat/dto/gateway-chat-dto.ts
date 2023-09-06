import { IsNotEmpty, IsString } from "class-validator";

export class StopEmit {
    @IsNotEmpty()
    @IsString()
    id: string;
}