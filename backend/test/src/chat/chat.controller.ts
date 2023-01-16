import { Controller, Get, Post, Body } from '@nestjs/common';
import { ChatService } from './chat.service';
import { ChatGateway } from './chat.gateway';
import { Chat } from './chat.interface';

class CreateChatDto {
    id: number;
    name: string;
    owner: number;
    accessType: number;
}

@Controller('chat')
export class ChatController {
    constructor(private chatService: ChatService,
        private chatGateway: ChatGateway) {}

    @Get('list')
	async getAll(): Promise<Chat[]> {
		return this.chatService.getAll();
	}
    @Post('new')
    async postNewChat(@Body() chat: CreateChatDto)
    {
        console.log(chat);
        this.chatService.create(chat);
        console.log(this.chatService.getAll());
    }
}
