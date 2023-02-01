import { Controller, Request, Req, Query, Param, Get, Post, Body, HttpException, HttpStatus } from '@nestjs/common';
import { ChatGateway } from './chat.gateway';
import { Chat, InformationChat } from './chat.interface';
import { CreateChatDto } from './create-chat.dto';
import { PswChat } from './psw-chat.dto'
import * as bcrypt from 'bcrypt';
import * as crypto from 'crypto';

@Controller('chat')
export class ChatController {
    constructor(private chatGateway: ChatGateway) { }
    /* Get part */
    //@Guard() IL FAUT UN AUTHGUARD
    @Get('public')
    async getAllPublic(): Promise<Chat[]> {
        console.log(this.chatGateway.getAllPublic());
        return (this.chatGateway.getAllPublic());
    }
    @Get('private')
    async getAllPrivate(@Query('id') id: string): Promise<Chat[]> {
        console.log(this.chatGateway.getAllPrivate(id));
        return (this.chatGateway.getAllPrivate(id));
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
    /* admin pas fait */
    //@Guard() IL FAUT UN AUTHGUARD
    @Post('new-public')
    async postNewPublicChat(@Body() chat: CreateChatDto): Promise<InformationChat | string[]> {
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
        chat.lstUsr.set(chat.owner.idUser, chat.owner.username);
        if (chat.password != '') {
            chat.accessType = '1';
            chat.password = bcrypt.hashSync(chat.password, salt);
        }
        console.log(chat);
        return (this.chatGateway.createPublic(chat, len));
        //console.log(this.chatGateway.getAllPublicByName());
        //return (this.chatGateway.getAllPublicByName());
    }

    /* Create new private chat and return them by Name */
    /* admin pas fait */
    //@Guard() IL FAUT UN AUTHGUARD
    /*
        https://nodejs.org/api/crypto.html#cryptorandombytessize-callback
    */
    @Post('new-private')
    async postNewPrivateChat(@Body() chat: CreateChatDto): Promise<InformationChat | string[]> {
        const channel: undefined | Chat = this.chatGateway.getChannelByName(chat.name);
        let err: string[] = [];

        if (chat.accessType != '2')
            throw new HttpException('Forbidden', HttpStatus.FORBIDDEN);
        if (chat.name == chat.password)
            err.push("hasErrorPsw");
        if (typeof channel !== "undefined")
            err.push("hasErrorExist");
        if (err.length > 0)
            return (err);
        const id: string = crypto.randomBytes(4).toString('hex');
        let salt = 10;
        if (chat.password != '') {
            chat.accessType = '3';
            chat.password = bcrypt.hashSync(chat.password, salt);
        }
        chat.lstUsr = new Map<string | number, string>;
        chat.lstMute = new Map<string, number>; //([[chat.setMute.key, chat.setMute.value]]);
        chat.lstBan = new Map<string, number>; //([[chat.setBan.key, chat.setBan.value]]);
        chat.lstUsr.set(chat.owner.idUser, chat.owner.username);
        /*
            appeler createPrivate + dedans vérifier si id existe déjà
        */
        return (this.chatGateway.createPublic(chat, id));
    }

    //@Guard() IL FAUT UN AUTHGUARD
    /* Remplacer id et username par un actuel user */
    @Get(':id')
    async getChannel(@Param('id') id: Readonly<string>) {
        const channel = this.chatGateway.getChannelById(id);
        let authorized = true;
        if (typeof channel === "undefined")
            return ({});
        let arrayStart: number = channel.lstMsg.length - 5;
        let arrayEnd: number = channel.lstMsg.length;
        if (arrayStart < 0)
            arrayStart = 0;
        const convertChannel = {
            id: channel.id,
            name: channel.name,
            owner: channel.owner,
            accessType: channel.accessType,
            lstMsg: channel.lstMsg.slice(arrayStart, arrayEnd),
            authorized: authorized
            //lstUsr: Object.fromEntries(channel.lstUsr),
            /*,
            lstMute: Object.fromEntries(channel.lstMute),
            lstBan: Object.fromEntries(channel.lstBan),*/
        };
        return (convertChannel);
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
