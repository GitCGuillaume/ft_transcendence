import { forwardRef, Module } from "@nestjs/common";
import { UsersController } from "./controllers/users/users.controller";
import { UsersService } from "./providers/users/users.service";
import { TypeOrmModule } from "@nestjs/typeorm";
import { User } from "src/typeorm";
import { Stat } from "src/typeorm/stat.entity";
import { BlackFriendList } from '../typeorm/blackFriendList.entity'
import { AuthModule } from 'src/auth/auth.module';
import { UsersGateway } from "./providers/users/users.gateway";
import { SocketModule } from "src/socket/socket.module";
import { MatchHistory } from "src/typeorm/matchHistory.entity";
import { Achievements } from "src/typeorm/achievement.entity";

//fowardRef = circular dependence
@Module({
    imports: [forwardRef(() => AuthModule), SocketModule, TypeOrmModule.forFeature([User, BlackFriendList, Stat, MatchHistory, Achievements])],
    controllers: [UsersController],
    providers: [UsersService, UsersGateway],
    exports: [UsersService, UsersGateway]
})
export class UsersModule { }
