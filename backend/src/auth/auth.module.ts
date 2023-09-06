import { forwardRef, Global, Module, Scope } from '@nestjs/common';
import { AuthService } from './auth.service';
import { UsersModule } from 'src/users/users.module';
import { PassportModule } from '@nestjs/passport';
import { LocalStrategy } from './local.strategy';
import { JwtStrategy } from './jwt.strategy';
import { JwtModule } from '@nestjs/jwt';
import { APP_GUARD } from '@nestjs/core';
import { JwtGuard } from './jwt.guard';

//fowardRef = circular dependence*
@Global()
@Module({
    imports: [forwardRef(() => UsersModule), PassportModule,
    JwtModule.register({
        secret: process.env.AUTH_SECRET,
        signOptions: { expiresIn: '2629800s' }
    })],
    providers: [{
        provide: APP_GUARD, scope: Scope.REQUEST, useClass: JwtGuard
    }, AuthService, LocalStrategy, JwtStrategy],
    exports: [AuthService]
})
export class AuthModule { }
