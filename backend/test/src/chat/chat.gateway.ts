import {
  SubscribeMessage, WebSocketGateway, MessageBody
  , ConnectedSocket, WebSocketServer
} from '@nestjs/websockets';
import { isObject } from 'class-validator';
import { Socket, Server } from 'socket.io';

@WebSocketGateway({
  cors: {
    origin: "http://localhost:4000", credential: true
  }
})
export class ChatGateway {
  handleConnection(client: Socket) {
    console.log("connect client id: " + client.id);
  }
  handleDisconnect(client: Socket) {
    console.log("disconnect client id: " + client.id);
  }
  @SubscribeMessage('joinTestRoom')
  handleJoinTest(@ConnectedSocket() client: Socket
    , server: Server): string {
    console.log("event joinTestRoom");
    client.join(client.handshake.auth.token);
    client.broadcast.to(client.handshake.auth.token).emit('roomCreated'
      , 'client: ' + client.id + ' joined room');
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
