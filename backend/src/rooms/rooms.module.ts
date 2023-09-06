import { Module, forwardRef } from '@nestjs/common';
import { RoomsController } from './controllers/rooms/rooms.controller';
import { RoomsService } from './services/rooms/rooms.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Room } from 'src/typeorm/room.entity';
import { UsersModule } from 'src/users/users.module';
import { SocketModule } from 'src/socket/socket.module';
import { SocketEvents } from 'src/socket/socketEvents';


@Module({
  imports: [forwardRef(() => SocketModule), forwardRef(() => UsersModule), TypeOrmModule.forFeature([Room])],
  controllers: [RoomsController],
  providers: [RoomsService],
  exports: [RoomsService]
})
export class RoomsModule { }
