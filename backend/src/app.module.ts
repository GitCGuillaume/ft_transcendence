import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { UsersModule } from './users/users.module';
import { ChatModule } from './chat/chat.module';
import { SocketModule } from "./socket/socket.module";
import { MatchMakingModule } from './matchmaking/matchmaking.module';
import { AuthModule } from './auth/auth.module';
import { RoomsModule } from './rooms/rooms.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRootAsync({
      useFactory: () => ({
        type: "postgres",
        host: process.env.DB_HOST,
        port: Number(process.env.DB_PORT),
        username: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME,
        synchronize: true,
        autoLoadEntities: true
      }),
      inject: [ConfigService],
    }),
    UsersModule, ChatModule, SocketModule, AuthModule, MatchMakingModule, RoomsModule
  ],
})
export class AppModule { }
