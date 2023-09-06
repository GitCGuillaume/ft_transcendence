import { Module } from "@nestjs/common";
import { MatchMakingGateway } from "./matchmaking.gateway";
import { RoomsModule } from "../rooms/rooms.module";
import { SocketModule } from "../socket/socket.module";

@Module({
  imports: [RoomsModule, SocketModule],
  controllers: [],
  providers: [MatchMakingGateway],
  exports: [],
})
export class MatchMakingModule {}
