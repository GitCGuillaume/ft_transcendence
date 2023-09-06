import {
  SubscribeMessage,
  WebSocketGateway,
  ConnectedSocket,
  WebSocketServer,
  OnGatewayInit,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from "@nestjs/websockets";
import { Socket, Server } from "socket.io";
import { UseGuards, Injectable } from "@nestjs/common";
import { JwtGuard } from "src/auth/jwt.guard";
import { SocketEvents } from "src/socket/socketEvents";
import { RoomsService } from "src/rooms/services/rooms/rooms.service";
import { CustomMM } from "./customMM/customMM";

@WebSocketGateway({
  cors: {
    origin: "http://127.0.0.1:4000/ ",
    credential: true,
  },
})
@Injectable()
export class MatchMakingGateway
  implements OnGatewayConnection, OnGatewayDisconnect, OnGatewayInit
{
  @WebSocketServer() server: Server;
  afterInit(server: Server) {}

  private mm: CustomMM<any>;

  constructor(
    private readonly roomsService: RoomsService,
    private readonly socketEvents: SocketEvents
  ) {
    this.mm = new CustomMM(this.runGame, this.getKey, this, {
      checkInterval: 2000,
    });
  }

  async emitbackplayer2id(id1: number, id2: number) {
    const name: string = String(id1) + "|" + String(id2);
    if (id1 === id2) {
      return { roomName: "", Capacity: "0", private: false, uid: "" };
    }
    const isUserConnected = await this.socketEvents.isUserConnected(
      String(id2)
    );
    if (!isUserConnected)
      return { roomName: "", Capacity: "0", private: false, uid: "" };
    const itm = await this.roomsService.createRoomMatchmaking(name);
    this.socketEvents.MatchmakeUserToGame(String(id1), String(id2), itm.uid);
  }

  public catchresolver(players: any) {
    this.emitbackplayer2id(players[0].id, players[1].id);
  }

  runGame(players: any) {
    players;
  }

  // 0=not in queue, 1=in queue, 2=in game
  public getPlayerStateMM(id: number) {
    return this.mm.getPlayerState(id);
  }

  getKey(player: any) {
    return player.id;
  }

  async handleConnection(client: Socket) {
    client.join(client.id);
  }

  @UseGuards(JwtGuard)
  @SubscribeMessage("queuein")
  async queuein(@ConnectedSocket() socket: Readonly<any>) {
    try {
      let statep1 = this.mm.getPlayerState(socket.user.userID); // 0=not in queue, 1=in queue, 2=in game
      if (statep1 == 2) {
        throw Error("already in game");
      }
      if (statep1 == 1) {
        throw Error("already in queue");
      }

      let map = this.socketEvents.getMap();

      const iterator1 = map.values();
      for (const value of iterator1) {
        if (value == socket.user.userID) {
          throw Error("already in game from socketEventsMap");
        }
      }
      const user = socket.user;
      let player1 = { id: user.userID };
      this.mm.push(player1);
    } catch (error) {
      this.server.to(socket.id).emit("matchmakingfailed", {
        message: socket.id,
      });
    }
  }

  @UseGuards(JwtGuard)
  @SubscribeMessage("queueout")
  queueout(@ConnectedSocket() socket: Readonly<any>) {
    try {
      const user = socket.user;

      if (typeof user.userID != "number") return false;
      let player1 = { id: user.userID };
      this.mm.leaveQueue(player1);
    } catch (error) {
      this.server.to(socket.id).emit("queueoutfailed", {
        message: "queue out failed",
      });
    }
  }

  @UseGuards(JwtGuard)
  @SubscribeMessage("endGame")
  endGame(@ConnectedSocket() socket: Readonly<any>) {
    try {
      const user = socket.user;
      let player1 = { id: user.userID };
      this.mm.endGame(player1);
    } catch (error) {
      this.server.to(socket.id).emit("declineMMmatchFailed", {
        message: "decline match failed",
      });
    }
  }
  @UseGuards(JwtGuard)
  handleDisconnect(@ConnectedSocket() socket: Readonly<any>) {
    try {
      const user = socket.user;
      let player1 = { id: user.userID };
      this.mm.leaveQueue(player1);
    } catch (error) {
      this.server.to(socket.id).emit("disconnect MM failed", {
        message: "disconnect MM fail",
      });
    }
  }
}
