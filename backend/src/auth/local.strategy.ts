import { Strategy } from 'passport-custom';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { AuthService } from './auth.service';
import { IsDefined, IsObject, IsString } from 'class-validator';

class Code {
    @IsDefined()
    @IsString()
    code: string;
}

class Body {
    @IsDefined()
    @IsObject()
    body: Code
}

@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy, "custom") {
    constructor(private authService: AuthService) {
        super();
    }

    async validate(req: Body) {
        const code: string = req.body.code;

        if (typeof code === "undefined" || !code || code === '')
            return (false);
        const user = await this.authService.validateUser(code);
        if (!user || typeof user == "undefined")
            throw new UnauthorizedException();
        //must return User
        return (user);
    }
}