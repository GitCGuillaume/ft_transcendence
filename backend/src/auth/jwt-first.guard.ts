import { ExecutionContext, Injectable, Inject } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { AuthService } from './auth.service';

@Injectable()
export class JwtFirstGuard extends AuthGuard('jwt') {
    constructor(@Inject(AuthService) private authService: AuthService) {
        super({ passReqToCallback: true });
    }

    async canActivate(context: ExecutionContext): Promise<boolean> {
        const request = context.switchToHttp().getRequest(); //see guard doc
        let bearer: string = "";

        if (typeof request.route != "undefined"
            && typeof request.headers.authorization != "undefined") {
            bearer = request.headers.authorization.split('Bearer ')[1];
        }
        if (typeof bearer == "undefined")
            return (false);
        const decoded = await this.authService.verifyFirstToken(bearer);
        if (decoded === null || decoded === false)
            return (false);
        super.canActivate(context)
        return (true);
    }
}
