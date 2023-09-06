import {
  SubscribeMessage, WebSocketGateway, MessageBody
  , ConnectedSocket, WebSocketServer, OnGatewayConnection, OnGatewayDisconnect
} from '@nestjs/websockets';
import { Socket, Server } from 'socket.io';
import { TokenUser } from './chat.interface';
import { IsString } from 'class-validator';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { Channel } from './chat.entity';
import { ListMsg } from './lstmsg.entity';
import { ListUser } from './lstuser.entity';
import { JwtGuard } from 'src/auth/jwt.guard';
import { UseGuards } from '@nestjs/common';
import { AuthService } from 'src/auth/auth.service';
import { ChatService } from './chat.service';
import { UserDecoSock } from 'src/common/middleware/user.decorator';
import { StopEmit } from './dto/gateway-chat-dto';

class Room {
  @IsString()
  id: string;
  @IsString()
  psw: string
}

class Pm {
  @IsString()
  id: string;
}

class SendMsg {
  @IsString()
  id: string;
  @IsString()
  username: string;
  @IsString()
  content: string;
}

/*
  middleware nestjs socket
  https://github.com/nestjs/nest/issues/637
  avec react context socket query token
*/

@WebSocketGateway({
  cors: {
    origin: "http://127.0.0.1:4000", credential: true
  }
})

export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer() server: Server;
  @InjectRepository(Channel)
  private chatsRepository: Repository<Channel>;
  @InjectRepository(ListUser)
  private listUserRepository: Repository<ListUser>;
  @InjectRepository(ListMsg)
  private listMsgRepository: Repository<ListMsg>;

  private readonly mapSocket: Map<string, string>;

  constructor(private dataSource: DataSource,
    private authService: AuthService, private chatService: ChatService) {
    this.mapSocket = new Map();
  }

  getMap() {
    return (this.mapSocket);
  }

  /* Socket part */
  @UseGuards(JwtGuard)
  @SubscribeMessage('joinRoomChat')
  async joinRoomChat(@ConnectedSocket() socket: Socket, @UserDecoSock() user: TokenUser,
    @MessageBody() data: Room): Promise<boolean | { ban: boolean }> {
    if (typeof user.userID != "number")
      return (false);
    const channel: Channel | null = await this.chatsRepository.findOne({
      where: {
        id: data.id
      }
    });

    if (typeof channel != "undefined" && channel != null) {
      const getUser: any = await this.chatService.getUserOnChannel(data.id, user.userID);
      if (channel.accesstype === '4' && !getUser)
        return (false)
      if (getUser === "Ban")
        return ({ ban: true });
      if (typeof getUser === "undefined" || getUser === null) {
        const newUser = await this.chatService.setNewUserChannel(channel, user.userID, data);
        if (typeof newUser === "undefined") {
          return (false);
        }
        this.server.to(data.id).emit("updateListChat", true);
      }
    }
    socket.join(data.id);
    return (true);
  }

  private async leavePm(id: string, userId: number) {
    const runner = this.dataSource.createQueryRunner();

    await runner.connect();
    await runner.startTransaction();
    try {
      //remove user from channel
      await this.chatsRepository
        .createQueryBuilder()
        .delete()
        .from(ListUser)
        .where("user_id = :id")
        .setParameters({ id: userId })
        .andWhere("chatid = :idchannel")
        .setParameters({ idchannel: id })
        .execute();
      await runner.commitTransaction();
    } catch (e) {
      await runner.rollbackTransaction();
    } finally {
      //doc want it released
      await runner.release();
    }
  }

  /* Delete current owner, and try to set a new one */
  private async setNewOwner(userId: number, id: string, ownerId: string) {
    const runner = this.dataSource.createQueryRunner();

    await runner.connect();
    await runner.startTransaction();
    try {
      //remove user from channel
      await this.chatsRepository
        .createQueryBuilder()
        .delete()
        .from(ListUser)
        .where("user_id = :id")
        .setParameters({ id: userId })
        .andWhere("chatid = :idchannel")
        .setParameters({ idchannel: id })
        .execute();

      if (Number(ownerId) === userId) {
        //try set first admin as owner
        //if no admin, then first user on list channel become owner
        await this.chatService.searchAndSetAdministratorsChannel(id);
      }
      const channel: Channel | null = await this.chatsRepository.findOne({
        where: {
          id: id
        }
      });
      await runner.commitTransaction();
      return (channel);
    } catch (e) {
      await runner.rollbackTransaction();
    } finally {
      //doc want it released
      await runner.release();
    }
  }

  @UseGuards(JwtGuard)
  @SubscribeMessage('leaveRoomChat')
  async leaveRoomChat(@ConnectedSocket() socket: Socket, @UserDecoSock() user: TokenUser,
    @MessageBody() data: Room): Promise<string | undefined | { ban: boolean }> {
    if (typeof user.userID != "number")
      return ("Couldn't' leave chat, wrong type id?");
    const checkAccess = await this.chatService.getChannelById(data.id);
    if (!checkAccess || checkAccess.accesstype === "4")
      return ("Couldn't' leave chat, make sure you are in a public or private chat.");
    const getUser: any = await this.chatService.getUserOnChannel(data.id, user.userID);
    if (getUser === "Ban")
      return ({ ban: true });
    if (typeof getUser === "undefined" || getUser === null)
      return ("No user found");
    const channel = await this.setNewOwner(user.userID, data.id, getUser.user_id);
    const [listUsr, count]: any = await this.listUserRepository.findAndCountBy({ chatid: data.id });
    socket.leave(data.id);
    this.server.to(data.id).emit("updateListChat", true);
    if (channel != undefined && channel != null && count === 0)
      this.chatsRepository.delete(data);
    return (getUser.User_username + " left the chat");
  }

  @UseGuards(JwtGuard)
  @SubscribeMessage('leaveRoomChatPm')
  async leaveRoomChatPm(@ConnectedSocket() socket: Socket, @UserDecoSock() user: TokenUser,
    @MessageBody() data: Pm): Promise<string | undefined | { ban: boolean }> {
    if (typeof user.userID != "number")
      return ("Couldn't' leave chat, wrong type id?");
    const channel = await this.chatService.getChannelById(data.id);
    if (!channel || channel.accesstype != "4")
      return ("Couldn't' leave chat,not in current chat, or chat is not private");
    const getUser = await this.chatService.getUserOnChannel(data.id, user.userID);
    if (typeof getUser === "undefined" || getUser === null)
      return ("No user found");
    await this.leavePm(data.id, user.userID);
    const [listUsr, count]: any = await this.listUserRepository.findAndCountBy({ chatid: data.id });
    socket.leave(data.id);
    if (count === 0)
      this.chatsRepository.delete(data);
    return (getUser.User_username + " left the chat");
  }

  @UseGuards(JwtGuard)
  @SubscribeMessage('stopEmit')
  async stopEmit(@ConnectedSocket() socket: Socket, @UserDecoSock() user: TokenUser,
    @MessageBody() data: StopEmit) {
    if (typeof data === "undefined"
      || !user || typeof user.userID != "number")
      return;
    const getChannel: any = await this.chatService.getUserOnChannel(data.id, user.userID);
    if (getChannel === "Ban") {
      socket.leave(data.id);
      return ({ ban: true });
    }
    if (typeof getChannel !== "undefined" && getChannel !== null) {
      socket.leave(data.id);
    }
  }

  private ret_error(data: any, user: TokenUser, getUser: any, txt: string) {
    return ({
      room: data.id,
      user_id: user.userID,
      user: { username: getUser.User_username, avatarPath: getUser.User_avatarPath },
      content: txt
    });
  }

  private sendMsg(socket: any, data: SendMsg, user: TokenUser, getUser: any, txt: string) {
    socket.to(data.id).emit(txt, {
      room: data.id,
      user_id: user.userID,
      user: { username: getUser.User_username, avatarPath: getUser.User_avatarPath },
      content: data.content
    });
  }

  @UseGuards(JwtGuard)
  @SubscribeMessage('sendMsg')
  async newPostChat(@ConnectedSocket() socket: Socket, @UserDecoSock() user: TokenUser,
    @MessageBody() data: SendMsg) {
    if (typeof user.userID != "number")
      return;
    const getUser = await this.chatService.getUserOnChannel(data.id, user.userID);
    if (typeof data.content != "string") {
      return (this.ret_error(data, user, getUser, "Please send correct input type"));
    }
    if (getUser === "Ban") {
      return (this.ret_error(data, user, getUser, "You are banned from this channel"));
    }
    if (typeof getUser === "undefined" || getUser === null)
      return (undefined);
    const isMuted = await this.chatService.getUserMuted(data.id, user.userID);
    if (isMuted)
      return ({
        room: data.id,
        user_id: user.userID,
        user: { username: getUser.User_username, avatarPath: getUser.User_avatarPath },
        content: "You are muted from this channel"
      });
    this.listMsgRepository
      .createQueryBuilder()
      .insert()
      .into(ListMsg)
      .values([{
        user_id: user.userID,
        content: data.content,
        chatid: data.id
      }])
      .execute();
    this.sendMsg(socket, data, user, getUser, "sendBackMsg")
    this.sendMsg(socket, data, user, getUser, "sendBackMsg2")
    return ({
      room: data.id,
      user_id: user.userID,
      user: { username: getUser.User_username, avatarPath: getUser.User_avatarPath },
      content: data.content
    });
  }

  @UseGuards(JwtGuard)
  async handleConnection(client: Socket) {
    const bearer = client.handshake.headers.authorization;
    if (bearer) {
      const user: any = await this.authService.verifyToken(bearer);
      if (user)
        this.mapSocket.set(client.id, user.userID);
    }
  }

  @UseGuards(JwtGuard)
  async handleDisconnect(client: Socket) {
    const bearer = client.handshake.headers.authorization;
    if (bearer) {
      const user: any = await this.authService.verifyToken(bearer);
      if (user)
        this.mapSocket.delete(client.id);
    }
  }
}
