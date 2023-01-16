import { Injectable } from '@nestjs/common';
import { Chat } from './chat.interface';

@Injectable()
export class ChatService {
    private readonly chats: Chat[] = [];
    getAll(): Chat[] {
		  return this.chats;
	  }
    create(chat: Chat){
      this.chats.push(chat);
    }
}
