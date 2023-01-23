import {
  SubscribeMessage, WebSocketGateway, MessageBody
  , ConnectedSocket, WebSocketServer, OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
} from '@nestjs/websockets';
import { isObject } from 'class-validator';
import { Socket, Server } from 'socket.io';
import { CreateChatDto } from './create-chat.dto';
import { Chat, InformationChat } from './chat.interface';

@WebSocketGateway({
  cors: {
    origin: "http://127.0.0.1:4000", credential: true
  }
})
export class ChatGateway implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer() server: Server;
  afterInit(server: Server) { }
  private readonly publicChats: Chat[] = [];
  private readonly privateChats: Chat[] = [];

  getAllPublic(): Chat[] {
    return this.publicChats;
  }
  getAllPublicByName(): InformationChat[] {
    let arrName:InformationChat[] = [];
  
    const size:number = this.publicChats.length;
  
    for (let i:number = 0; i < size; ++i)
    {
      arrName[i] = {
        id: this.publicChats[i].id, name: this.publicChats[i].name,
          owner: this.publicChats[i].owner, accessType: this.publicChats[i].accessType
      };
    }
    return arrName;
  }
  getAllPrivate(): Chat[] {
    return this.privateChats;
  }
  getChannel(id: string): undefined | Chat {
    const elem:number = this.publicChats.findIndex(x => x.id == id)
  
	  return (this.publicChats[elem]);
  }
  createPublic(chat: CreateChatDto, id: string) {
    chat.id = id;
    let newChat:Chat = {
      id: chat.id, name: chat.name, owner: chat.owner,
      accessType: chat.accessType, password: chat.password,
      lstMsg: chat.lstMsg, lstUsr: chat.lstUsr, lstMute: chat.lstMute,
      lstBan: chat.lstBan
      };
    console.log(newChat);
    this.publicChats.push(newChat);
  }
  createPrivate(chat: Chat, id: string): Chat {
    chat.id = id;
    //this.privateChats.find(this.pri);
    this.privateChats.push(chat);
    return (this.privateChats[this.privateChats.length - 1]);
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
    client.broadcast.to(client.handshake.auth.token).emit('roomCreated'
      , 'client: ' + client.id + ' joined room');
    const sockets = this.server.sockets.adapter.rooms;
    console.log(sockets);
    return ("Joined test room");
  }
  @SubscribeMessage('events')
  handleEvents(@MessageBody() data: []
    , @ConnectedSocket() client: Socket): [] {
    console.log("data: " + data);
    return (data);
  }
  @SubscribeMessage('message')
  handleMessage(client: any, payload: any): string {
    return 'Hello world!';
  }
}
