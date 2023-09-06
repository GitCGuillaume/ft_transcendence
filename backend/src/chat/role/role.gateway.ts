import { WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { Server } from 'socket.io';
import { ChatGateway } from '../chat.gateway';

@WebSocketGateway({
  cors: {
    origin: "http://127.0.0.1:4000", credential: true
  }
})
export class RoleGateway {
  @WebSocketServer() server: Server;
  afterInit(server: Server) { }

  constructor(private chatGateway: ChatGateway) { }

  /* emit action to room */
  emitToRoom(id: string, user_id: number,
    username: string, avatar_path: string, emit_name: string) {
    let content = "";

    if (emit_name === "Ban")
      content = username + " is banned from this channel";
    else if (emit_name === "Kick")
      content = username + " is kicked from this channel";
    else
      content = username + " is muted from this channel";
    this.server.to(id).emit("actionOnUser", {
      room: id,
      user_id: String(user_id),
      user: { username: username, avatarPath: avatar_path },
      content: content,
      type: emit_name
    });
    //2 for second chat if open by client
    this.server.to(id).emit("actionOnUser" + "2", {
      room: id,
      user_id: String(user_id),
      user: { username: username, avatarPath: avatar_path },
      content: content,
      type: emit_name
    });
  }

  /* id = id channel */
  actionOnUser(id: string, user_id: number,
    username: string, avatar_path: string, emit_name: string) {
    this.emitToRoom(id, user_id, username, avatar_path, emit_name);
    const map = this.chatGateway.getMap();

    if (emit_name === "Ban" || emit_name === "Kick") {
      map.forEach((value, key) => {
        if (value === String(user_id)) {
          this.server.in(key).socketsLeave(id);
        }
      })
    }
  }

  /* id = id channel */
  updateListChat(id: string) {
    this.server.to(id).emit("updateListChat", true);
  }
}