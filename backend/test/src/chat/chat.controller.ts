import { Controller, Request, Req, Query, Param, Get, Post, Body, HttpException, HttpStatus } from '@nestjs/common';
/*import { ChatService } from './chat.service';*/
import { ChatGateway } from './chat.gateway';
import { Chat, InformationChat } from './chat.interface';
import * as bcrypt from 'bcrypt';
import { IsString, IsInt, IsArray, ValidateNested, IsObject, IsDefined, IsNumber } from 'class-validator';
import { Type } from 'class-transformer';
import { CreateChatDto } from './create-chat.dto';

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
    @IsArray()
    lstMsg: Array<{
        id: number | string,
        username: string,
        content: string,
        avatarUrl: string,
    }>;
    @IsArray()
    lstUsr: Array<{
        id: number | string,
        username: string,
        avatarUrl: string,
    }>;
    lstMute: Array<{
        id: number | string,
        time: number //parse millisecondes depuis 1970
    }>
    lstBan: Array<{
        id: number | string,
        time: number //parse millisecondes depuis 1970
    }>
}

@Controller('chat')
export class ChatController {
    constructor(private chatGateway: ChatGateway) { }

    @Get('list')
    async getAllPublic(): Promise<Chat[]> {
        return (this.chatGateway.getAllPublic());
    }

    /* Get part */
    /*@Get(':id')
    async getChannel(@Param('id') id: Readonly<string>): Promise<Chat> {
	    const channel:Chat = this.chatGateway.getChannel(id);

	    return (channel);
    }*/

    /* id = id channel
        name = channel's name
    */
    @Get('has-paswd/:id')
    getHasPaswd(@Param('id') id: Readonly<string>): boolean
    {
        const channel: undefined | Chat = this.chatGateway.getChannel(id)

        if (typeof channel == "undefined" || channel.password == '')
            return (false);
        return(true);
    }

    /* Post part */
    /* Create new public chat and return them by Name */
    @Post('new-public')
    async postNewPublicChat(@Body() chat: CreateChatDto): Promise<InformationChat[]> {
        const len: string = this.chatGateway.getAllPublic().length.toString();

	if (chat.accessType != '0' || typeof this.chatGateway.getAllPublic() == undefined)
            throw new HttpException('Forbidden', HttpStatus.FORBIDDEN);
        if (chat.password != '')
		    chat.accessType = '1';
	    chat.lstMute = new Map<string, number>; //([[chat.setMute.key, chat.setMute.value]]);
	    chat.lstBan = new Map<string, number>; //([[chat.setBan.key, chat.setBan.value]]);
        console.log(chat);
        this.chatGateway.createPublic(chat, len);
        return (this.chatGateway.getAllPublicByName());
    }

    /* Create new private chat and return them by Name */
    @Post('new-private')
    async postNewPrivateChat(@Body() chat: CreateChatDtoTwo): Promise<Chat[]> {
        const str: string = await bcrypt.hash(chat.name, 10);

        if (chat.accessType != '1')
            throw new HttpException('Forbidden', HttpStatus.FORBIDDEN);
        if (chat.password != '')
            chat.accessType = '1';
	    //this.chatGateway.createPrivate(chat, str)
        //create private room
        /*pas fou de retourner le psw, à changer*/
        return (this.chatGateway.getAllPrivate());
    }
}
