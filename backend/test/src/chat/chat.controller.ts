import { Controller, Request, Req, Query, Param, Get, Post, Body, HttpException, HttpStatus } from '@nestjs/common';
/*import { ChatService } from './chat.service';*/
import { ChatGateway } from './chat.gateway';
import { Chat, InformationChat } from './chat.interface';
import * as bcrypt from 'bcrypt';
import { IsString, IsInt, IsArray, ValidateNested, IsObject, IsDefined, IsNumber } from 'class-validator';
import { CreateChatDto } from './create-chat.dto';
import { PswChat } from './psw-chat.dto'

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
    /* Get part */
    //@Guard() IL FAUT UN AUTHGUARD
    @Get('list')
    async getAllPublic(): Promise<Chat[]> {
        return (this.chatGateway.getAllPublic());
    }
    /*
        id = id channel
        name = channel's name
    */
   //@Guard() IL FAUT UN AUTHGUARD
    @Get('has-paswd/:id')
    getHasPaswd(@Param('id') id: Readonly<string>): boolean {
        const channel: undefined | Chat = this.chatGateway.getChannelById(id)

        if (typeof channel == "undefined" || channel.password == '')
            return (false);
        return (true);
    }

    /* Post part */
    /* Create new public chat and return them by Name */
    //@Guard() IL FAUT UN AUTHGUARD
    @Post('new-public')
    async postNewPublicChat(@Body() chat: CreateChatDto): Promise<InformationChat[] | string[]> {
        const channel: undefined | Chat = this.chatGateway.getChannelByName(chat.name);
        let err: string[] = [];

        if (chat.name == chat.password)
            err.push("hasErrorPsw");
        if (typeof channel !== "undefined")
            err.push("hasErrorExist");
        if (err.length > 0)
            return (err);
        const len: string = this.chatGateway.getAllPublic().length.toString();
        let salt = 10; //DOIT ETRE UTILISE DEPUIS .env
        if (chat.accessType != '0' || typeof this.chatGateway.getAllPublic() == undefined)
            throw new HttpException('Forbidden', HttpStatus.FORBIDDEN);
        chat.lstUsr = new Map<string | number, string>;
        chat.lstMute = new Map<string, number>; //([[chat.setMute.key, chat.setMute.value]]);
        chat.lstBan = new Map<string, number>; //([[chat.setBan.key, chat.setBan.value]]);
        if (chat.password != '') {
            chat.accessType = '1';
            chat.password = bcrypt.hashSync(chat.password, salt);
        }
        console.log(chat);
        this.chatGateway.createPublic(chat, len);
        //console.log(this.chatGateway.getAllPublicByName());
        return (this.chatGateway.getAllPublicByName());
    }
    //@Guard() IL FAUT UN AUTHGUARD
    /* Remplacer id et username par un actuel user */
    @Get(':id')
    async getChannel(@Param('id') id: Readonly<string>,
        @Query('iduser') idUser: Readonly<number>,
        @Query('username') username: Readonly<string>): Promise<any> {
        const channel = this.chatGateway.setNewUserChannel(id, idUser, username);
        if (typeof channel === "undefined")
            return (undefined);
        console.log(channel);
        const convertChannel = {
            id: channel.id,
            name: channel.name,
            owner: channel.owner,
            accessType: channel.accessType,
            lstMsg: channel.lstMsg,
            //lstUsr: Object.fromEntries(channel.lstUsr),
            /*,
            lstMute: Object.fromEntries(channel.lstMute),
            lstBan: Object.fromEntries(channel.lstBan),*/
        };
        return (convertChannel);
    }
    /* Create new private chat and return them by Name */
    //@Guard() IL FAUT UN AUTHGUARD
    @Post('new-private')
    async postNewPrivateChat(@Body() chat: CreateChatDtoTwo): Promise<Chat[]> {
        const str: string = bcrypt.hashSync(chat.name, 10);

        if (chat.accessType != '1')
            throw new HttpException('Forbidden', HttpStatus.FORBIDDEN);
        if (chat.password != '')
            chat.accessType = '1';
        //this.chatGateway.createPrivate(chat, str)
        //create private room
        /*pas fou de retourner le psw, à changer*/
        return (this.chatGateway.getAllPrivate());
    }
    //@Guard() IL FAUT UN AUTHGUARD
    @Post('valid-paswd')
    async passwordIsValid(@Body() psw: PswChat): Promise<boolean> {
        const channel: undefined | Chat = this.chatGateway.getChannelById(psw.id)
        //console.log(channel);
        if (typeof channel == "undefined" || channel.password == '')
            return (false);
        const comp = await bcrypt.compare(psw.psw, channel.password);
        return (comp);
    }
}
