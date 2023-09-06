import { ExecutionContext, Injectable, SetMetadata, Inject } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { AuthService } from './auth.service';
import { Reflector } from '@nestjs/core';
import { WsException } from '@nestjs/websockets';

export const IS_PUBLIC_KEY = 'isPublic';
export const Public = () => SetMetadata(IS_PUBLIC_KEY, true);

@Injectable()
export class JwtGuard extends AuthGuard('jwt') {
    constructor(@Inject(AuthService) private authService: AuthService,
        private reflector: Reflector) {
        super({ passReqToCallback: true });
    }

    async canActivate(context: ExecutionContext): Promise<boolean> {
        const request = context.switchToHttp().getRequest(); //see guard doc
        //get context handler and class through metadata key
        const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
            context.getHandler(), context.getClass()
        ]);
        let bearer: string = "";
        //if ispublic return true from metadata, meaning route is public, and do not need a user connection
        if (isPublic)
            return (true);
        if (typeof request.route != "undefined"
            && typeof request.headers.authorization != "undefined") {
            bearer = request.headers.authorization.split('Bearer ')[1];
        }
        else if (typeof request.route == "undefined") {
            bearer = request.handshake.headers.authorization;
        }
        if (typeof bearer == "undefined")
            return (false);
        const decoded = await this.authService.verifyToken(bearer);
        if ((decoded === null && typeof request.route == "undefined")
            || (decoded === false && typeof request.route == "undefined")) {
            throw new WsException('Token not valid');
        }
        else if (decoded === null || decoded === false)
            return (false);
        if (typeof request.route == "undefined") {
            request.headers = {};
            request.headers.authorization = "Bearer " + bearer;
        }
        super.canActivate(context)
        return (true);
    }
}
