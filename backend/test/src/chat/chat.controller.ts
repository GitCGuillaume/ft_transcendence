import { Controller, Get, Post, Body, HttpException, HttpStatus } from '@nestjs/common';
import { ChatService } from './chat.service';
import { ChatGateway } from './chat.gateway';
import { Chat } from './chat.interface';
import { IsString, IsInt } from 'class-validator';
import * as bcrypt from 'bcrypt';

class CreateChatDto {
    @IsInt()
    id: number;
    @IsString()
    name: string;
    @IsInt()
    owner: number;
    @IsString()
    accessType: string;
    @IsString()
    password: string;
}

class CreateChatDtoTwo {
    @IsString()
    id: string;
    @IsString()
    name: string;
    @IsInt()
    owner: number;
    @IsString()
    accessType: string;
    @IsString()
    password: string;
}

@Controller('chat')
export class ChatController {
    constructor(private chatService: ChatService,
        private chatGateway: ChatGateway) {}

    @Get('list')
	async getAll(): Promise<Chat[]> {
		return (this.chatService.getAllPublic());
	}
    @Post('new-public')
    async postNewPublicChat(@Body() chat: CreateChatDto): Promise<Chat[]>
    {
        const   len: number = this.chatService.getAllPublic().length;

        if (chat.accessType != '0')
            throw new HttpException('Forbidden', HttpStatus.FORBIDDEN);
        if (chat.password != '')
            chat.accessType = '1';
        this.chatService.createPublic(chat, len);
        console.log(this.chatService.getAllPublic());
        /*pas fou de retourner le psw, à changer*/
        return (this.chatService.getAllPublic());
    }
    @Post('new-private')
    async postNewPrivateChat(@Body() chat: CreateChatDtoTwo): Promise<Chat>
    {
        const str:string = await bcrypt.hash(chat.name, 10);
        console.log(str);
        if (chat.accessType != '1')
            throw new HttpException('Forbidden', HttpStatus.FORBIDDEN);
        if (chat.password != '')
            chat.accessType = '1';
        /*pas fou de retourner le psw, à changer*/
        return (this.chatService.createPrivate(chat, str));
    }
}
