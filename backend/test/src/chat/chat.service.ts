import { Injectable } from '@nestjs/common';
import { Chat } from './chat.interface';

@Injectable()
export class ChatService {
    private readonly publicChats: Chat[] = [];
    private readonly privateChats: Chat[] = [];
    getAllPublic(): Chat[] {
		  return this.publicChats;
	  }
    getAllPrivate(): Chat[] {
		  return this.privateChats;
	  }
    createPublic(chat: Chat, id: number){
      chat.id = id;
      this.publicChats.push(chat);
    }
    createPrivate(chat: Chat, id: string): Chat{
      chat.id = id;
      this.privateChats.push(chat);
      return (this.privateChats[this.privateChats.length - 1]);
    }
}
