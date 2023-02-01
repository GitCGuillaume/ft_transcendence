import {
  SubscribeMessage, WebSocketGateway, MessageBody
  , ConnectedSocket, WebSocketServer, OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
} from '@nestjs/websockets';
import { Socket, Server } from 'socket.io';
import { CreateChatDto } from './create-chat.dto';
import { Chat, InformationChat } from './chat.interface';
import { IsString } from 'class-validator';
import * as bcrypt from 'bcrypt';

class Room {
  @IsString()
  id: string;
  @IsString()
  idUser: string;
  @IsString()
  username: string;
  @IsString()
  name: string;
  @IsString()
  psw: string
}

class SendMsg {
  @IsString()
  id: string;
  @IsString()
  idUser: string;
  @IsString()
  username: string;
  @IsString()
  content: string;
}

/*
  middleware nestjs socket
  https://github.com/nestjs/nest/issues/637
  avec react context socket query token
  BONUS part https://dev.to/bravemaster619/how-to-use-socket-io-client-correctly-in-react-app-o65
*/

const filterAccessPublic = (elem: Chat) => {
  if (elem.accessType === "0" || elem.accessType === "1")
    return (true);
  return (false);
}

@WebSocketGateway({
  cors: {
    origin: "http://127.0.0.1:4000", credential: true
  }
})
export class ChatGateway implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer() server: Server;
  afterInit(server: Server) { }
  private readonly publicChats: Chat[] = [];

  getAllPublic(): Chat[] {
    let arr: Chat[] = this.publicChats.filter(filterAccessPublic);
    return arr;
  }
  getAllPrivate(id: string): Chat[] {
    let arr: Chat[] = this.publicChats.filter((elem) => {
      console.log("id: " + id);
      console.log(elem.lstUsr.get(id));
      if ((elem.accessType === "2" || elem.accessType === "3") && elem.lstUsr.get(id) != undefined)
        return (true);
      return (false);
    });
    console.log(arr);
    return arr;
  }
  getAllPublicByName(): InformationChat[] {
    let arrName: InformationChat[] = [];

    const size: number = this.publicChats.length;

    for (let i: number = 0; i < size; ++i) {
      arrName[i] = {
        id: this.publicChats[i].id, name: this.publicChats[i].name,
        owner: this.publicChats[i].owner, accessType: this.publicChats[i].accessType
      };
    }
    return arrName;
  }

  /*getAllPrivateByName(): InformationChat[] {
    let arrName: InformationChat[] = [];

    const size: number = this.privateChats.length;

    for (let i: number = 0; i < size; ++i) {
      arrName[i] = {
        id: this.privateChats[i].id, name: this.privateChats[i].name,
        owner: this.privateChats[i].owner, accessType: this.privateChats[i].accessType
      };
    }
    return arrName;
  }*/
  /*getAllPrivate(): Chat[] {
    return this.privateChats;
  }*/
  getChannelById(id: string): undefined | Chat {
    const elem: number = this.publicChats.findIndex(x => x.id == id)
    return (this.publicChats[elem]);
  }
  getChannelByName(name: string): undefined | Chat {
    const elem: number = this.publicChats.findIndex(x => x.name == name)

    return (this.publicChats[elem]);
  }
  /*getChannelPrivateByName(name: string): undefined | Chat {
    const elem: number = this.privateChats.findIndex(x => x.name == name)

    return (this.privateChats[elem]);
  }*/
  createPublic(chat: CreateChatDto, id: string): InformationChat {
    chat.id = id;
    let newChat: Chat = {
      id: chat.id, name: chat.name, owner: chat.owner.username,
      accessType: chat.accessType, password: chat.password,
      lstMsg: chat.lstMsg,
      lstUsr: chat.lstUsr, lstMute: chat.lstMute,
      lstBan: chat.lstBan
    };
    this.publicChats.push(newChat);
    const return_chat: InformationChat = {
      id: newChat.id,
      name: newChat.name,
      owner: newChat.owner,
      accessType: newChat.accessType,
    }
    return (return_chat);
  }
  /*createPrivate(chat: CreateChatDto, id: string): string {
    chat.id = id;
    //find id dans privateChat
    //si undefined alors id pas trouvé ou liste vide?
    let newChat: Chat = {
      id: chat.id, name: chat.name, owner: chat.owner,
      accessType: chat.accessType, password: chat.password,
      lstMsg: chat.lstMsg,
      lstUsr: chat.lstUsr, lstMute: chat.lstMute,
      lstBan: chat.lstBan
    };
    this.privateChats.push(newChat);
   */ /* droit retourner le chat créé */
  // return (newChat.id);
  // }
  setNewUserChannel(id: Readonly<string>,
    idUsr: Readonly<number | string>,
    username: Readonly<string>,
    psw: Readonly<string>): undefined | Chat {
    console.log("setNewUserChannel");
    const index = this.publicChats.findIndex(x => x.id == id);
    if (index === -1)
      return (undefined);
    if (this.publicChats[index].password != '') {
      const comp = bcrypt.compareSync(psw, this.publicChats[index].password);
      if (comp === false)
        return (undefined)
    }
    this.publicChats[index].lstUsr.set(idUsr, username);
    console.log("endNew");
    return (this.publicChats[index]);
  }
  /* Socket part */
  @SubscribeMessage('joinRoomChat')
  async joinRoomChat(@ConnectedSocket() socket: Readonly<Socket>, @MessageBody() data: Readonly<Room>): Promise<boolean> {
    console.log("joinRoomChat");
    console.log(data);
    const newUser = this.setNewUserChannel(data.id, data.idUser, data.username, data.psw);
    if (typeof newUser === "undefined") {
      console.log("join room undefined");
      return (false);

    } const getName = this.getChannelById(data.id)?.name;
    console.log("name: " + getName);
    console.log("data.id: " + data.id + " name: " + getName);
    socket.join(data.id + getName);
    return (true);
  }
  @SubscribeMessage('leaveRoomChat')
  async leaveRoomChat(@ConnectedSocket() socket: Readonly<Socket>,
    @MessageBody() data: Readonly<Room>): Promise<string | undefined> {
    console.log(data);
    const index = this.publicChats.findIndex(x => x.id == data.id);

    if (index === -1)
      return (undefined);
    const getUser = this.publicChats[index].lstUsr.get(data.idUser);
    if (typeof getUser === "undefined")
      return ("User not found");
    this.publicChats[index].lstUsr.delete(data.idUser);
    const getName = this.getChannelById(data.id)?.name;
    console.log("data.id: " + data.id + " name: " + getName);
    socket.leave(data.id + getName);
    //console.log(this.getChannelById(data.id));
    return ("User left the chat");
  }
  @SubscribeMessage('stopEmit')
  async stopEmit(@ConnectedSocket() socket: Readonly<Socket>,
    @MessageBody() data: Readonly<any>) {
    const getName = this.getChannelById(data.id)?.name;
    socket.leave(data.id + getName);
  }
  /* est-ce que je peux chercher l'user enregistré dans le gateway depuis le middleware? */
  @SubscribeMessage('sendMsg')
  newPostChat(@MessageBody() data: Readonly<SendMsg>) {
    console.log(data);
    const chat: Chat[] = this.publicChats;
    const index = chat.findIndex(x => x.id == data.id);
    if (index === -1)
      return (undefined);
    const getUsername = chat[index].lstUsr.get(data.idUser);
    if (typeof getUsername === "undefined")
      return ("User not found");
    //if typeChat === public
    console.log("index: " + index);
    chat[index].lstMsg.push({ idUser: data.idUser, username: getUsername, content: data.content });
    //else if (typechat === private)
    console.log(chat[index].id + chat[index].name);
    const length = chat[index].lstMsg.length;
    console.log("chatId: " + chat[index].id + " chatName: " + chat[index].name);
    this.server.to(chat[index].id + chat[index].name).emit("sendBackMsg", chat[index].lstMsg[length - 1]);
  }

  /* Tests ws */
  handleConnection(client: Socket) {
    console.log("connect client id: " + client.id);
  }
  handleDisconnect(client: Socket) {
    console.log("disconnect client id: " + client.id);
  }
  @SubscribeMessage('joinTestRoom')
  async handleJoinTest(@ConnectedSocket() client: Socket
    , server: Server): Promise<any> {
    console.log("event joinTestRoom");
    client.join(client.handshake.auth.token);
    client.broadcast.to(client.handshake.auth.token).emit('joinTestRoom'
      , 'client: ' + client.id + ' joined room');
    const sockets = this.server.sockets.adapter.rooms;
    console.log(sockets);
    return ("Joined test room");
  }
  @SubscribeMessage('events')
  handleEvents(@MessageBody() data: []
    , @ConnectedSocket() socket: Socket) {
    /*console.log(data);
    console.log(this.publicChats.length);
    console.log(socket.handshake.query);*/
    this.server.emit("events", socket.id);
  }
  @SubscribeMessage('message')
  handleMessage(client: any, payload: any): string {
    return 'Hello world!';
  }
}
