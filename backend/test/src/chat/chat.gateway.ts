import { SubscribeMessage, WebSocketGateway, MessageBody
	, ConnectedSocket, OnGatewayConnection, OnGatewayDisconnect} from '@nestjs/websockets';
import { Socket } from 'socket.io';

@WebSocketGateway({ cors: {
	origin: "http://localhost:5173", credential: true
}})
export class ChatGateway {
  handleConnection(client: Socket) {
  	console.log("connect client id: " + client.id);
  }
  handleDisconnect(client: Socket) {
  	console.log("disconnect client id: " + client.id);
  }
  @SubscribeMessage('events')
  handleEvents(@MessageBody() data: string
  , @ConnectedSocket() client: Socket): string {
  	console.log("data: " + data);
	return (data);
  }
  @SubscribeMessage('message')
  handleMessage(client: any, payload: any): string {
    return 'Hello world!';
  }
}
