import { UseGuards } from '@nestjs/common';
import { ConnectedSocket, MessageBody, OnGatewayConnection, OnGatewayDisconnect, SubscribeMessage, WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { IsNumber } from 'class-validator';
import { Server, Socket } from 'socket.io';
import { AuthService } from 'src/auth/auth.service';
import { JwtGuard } from 'src/auth/jwt.guard';
import { TokenUser } from 'src/chat/chat.interface';
import { UserDecoSock } from 'src/common/middleware/user.decorator';
import { SocketEvents } from 'src/socket/socketEvents';

class Info {
  @IsNumber()
  userId: number;
}

@WebSocketGateway({
  cors: {
    origin: "http://127.0.0.1:4000", credential: true
  }
})
export class UsersGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer() server: Server;
  private readonly mapSocket: Map<string, string>;
  private readonly mapBusySocket: Map<string, string>;
  constructor(private authService: AuthService, private socketEvents: SocketEvents
  ) {
    this.mapSocket = new Map();
    this.mapBusySocket = new Map();
  }

  @UseGuards(JwtGuard)
  @SubscribeMessage('status')
  getStatusUser(@MessageBody() data: Info) {
    const map = this.mapSocket;
    const mapBusy = this.mapBusySocket;
    const mapUserInGame = this.socketEvents.getMap();

    for (let value of mapBusy.values()) {
      if (value === String(data.userId)) {
        //check if busy
        return ({ code: 3 });
      }
    }
    for (let value of mapUserInGame.values()) {
      if (Number(value) === data.userId) {
        //check if in game
        return ({ code: 2 });
      }
    }
    for (let value of map.values()) {
      if (value === String(data.userId)) {
        //check if online
        return ({ code: 1 });
      }
    }
    return ({ code: 0 });
  }

  @UseGuards(JwtGuard)
  @SubscribeMessage('userInGame')
  userInGame(@UserDecoSock() user: TokenUser) {
    let find: boolean = false;
    const userIsString = String(user.userID);
    for (let value of this.mapBusySocket.values()) {
      if (value === userIsString) {
        //check if busy
        find = true;
      }
    }
    if (find === true) {
      this.server.emit("currentStatus", {
        code: 3, userId: user.userID
      });
    } else {
      this.server.emit("currentStatus", {
        code: 2, userId: user.userID
      });
    }
  }

  @UseGuards(JwtGuard)
  @SubscribeMessage('iAmBusy')
  iAmBusy(@ConnectedSocket() client: Socket, @UserDecoSock() user: TokenUser) {
    const mapUserInGame = this.socketEvents.getMap();
    const result = this.mapBusySocket.get(client.id);
    //user is busy
    if (!result) {
      this.mapBusySocket.set(client.id, String(user.userID));
      this.server.emit("currentStatus", {
        code: 3, userId: user.userID
      });
      return ({ isBusy: true });
    }
    else
      this.mapBusySocket.delete(client.id);
    //check if in game, if it is send in game status
    let find: boolean = false;

    for (let value of mapUserInGame.values()) {
      if (value === user.userID) {
        //check if in game
        find = true;
      }
    }
    if (find === true) {
      this.server.emit("currentStatus", {
        code: 2, userId: user.userID
      });
    } else {
      this.server.emit("currentStatus", {
        code: 1, userId: user.userID
      });
    }
    return ({ isBusy: false });
  }

  @UseGuards(JwtGuard)
  @SubscribeMessage('getBusy')
  getBusy(@ConnectedSocket() client: Socket) {
    const result = this.mapBusySocket.get(client.id);
    if (result)
      return ({ isBusy: true });
    return ({ isBusy: false });
  }

  @UseGuards(JwtGuard)
  async handleConnection(client: Socket) {
    const bearer = client.handshake.headers.authorization;
    if (bearer) {
      const user: any = await this.authService.verifyToken(bearer);
      let find: boolean = false;
      if (!user)
        return;
      const userIsString = String(user.userID);
      for (let value of this.mapBusySocket.values()) {
        if (value === userIsString) {
          //check if in game
          find = true;
        }
      }
      this.mapSocket.forEach((value, key) => {
        this.server.to(key).emit("currentStatus", {
          code: 1, userId: user.userID
        });
      })
      if (user)
        this.mapSocket.set(client.id, user.userID);
    }
  }

  @UseGuards(JwtGuard)
  async handleDisconnect(client: Socket) {
    let found: undefined | string = undefined
    for (let [key, value] of this.mapSocket.entries()) {
      if (key === client.id) {
        found = value;
      }
    }
    if (found) {
      this.mapSocket.forEach((value, key) => {
        this.server.to(key).emit("currentStatus", {
          code: 0, userId: found
        });
      })
      this.mapSocket.delete(client.id);
      this.mapBusySocket.delete(client.id);
    }
  }

  getMap() {
    return (this.mapSocket);
  }

  getMapBusy() {
    return (this.mapBusySocket);
  }
}