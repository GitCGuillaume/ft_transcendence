import { Controller, Query, Get, Post, Body, HttpException, HttpStatus, UseGuards, ParseIntPipe } from '@nestjs/common';
import { InformationChat, TokenUser, DbChat } from './chat.interface';
import { CreateChatDto } from './dto/create-chat.dto';
import { PswChat } from './psw-chat.dto';
import * as bcrypt from 'bcrypt';
import * as crypto from 'crypto';
import { JwtGuard } from 'src/auth/jwt.guard';
import { Channel } from './chat.entity';
import { ListUser } from './lstuser.entity';
import { UsersService } from '../users/providers/users/users.service';
import { User } from 'src/typeorm';
import { ChatService } from './chat.service';
import { UserDeco } from 'src/common/middleware/user.decorator';

type Channel_ret = {
    Channel_id: string
}

@Controller('chat')
export class ChatController {
    constructor(private chatService: ChatService,
        private userService: UsersService) { }

    /* Get part */
    @UseGuards(JwtGuard)
    @Get('public')
    getAllPublic(): Promise<InformationChat[]> {
        return (this.chatService.getAllPublic());
    }

    @UseGuards(JwtGuard)
    @Get('private')
    async getAllPrivate(@UserDeco() user: TokenUser): Promise<InformationChat[]> {
        return (await this.chatService.getAllPrivate(user.userID));
    }

    @Get('users')
    async getAllUsersOnChannel(@UserDeco() user: TokenUser,
        @Query('id') id: string) {
        const listUsers: any = await this.chatService.getAllUsersOnChannel(id, user.userID);

        if (typeof listUsers === "undefined" || listUsers === null)
            return (false);
        return (listUsers);
    }

    /* Start of fixed chatbox part */
    @Get('list-pm')
    async getDirectMessage(@UserDeco() user: TokenUser) {
        const channel: ListUser[] | null
            = await this.chatService.getAllPmUser(user.userID);
        return (channel);
    }
    @Get('channel-registered')
    async getAllChanUser(@UserDeco() user: TokenUser) {
        const channel: Channel[] | null
            = await this.chatService.getAllUserOnChannels(user.userID);
        return (channel);
    }

    /* find and create if needed a private message */
    private async findPm(user_id: number, id: string): Promise<string> {
        const concatOne = String(user_id).concat(String(id));
        const concatTwo = String(id).concat(String(user_id));

        const getChanOne = await this.chatService.getChannelById(concatOne);
        if (getChanOne) {
            await this.chatService.insertMemberPm(user_id, concatOne);
            return (getChanOne.id);
        }
        const getChanTwo = await this.chatService.getChannelById(concatTwo);
        if (getChanTwo) {
            await this.chatService.insertMemberPm(user_id, concatTwo);
            return (getChanTwo.id);
        }
        const list_user: Channel_ret | undefined
            = await this.chatService.findPmUsers(user_id, id);
        if (typeof list_user === "undefined") {
            const ret: string
                = await this.chatService.createPrivateMessage(user_id, id);
            return (ret);
        }
        return (list_user.Channel_id);
    }

    /* Find user PM by username */
    @Get('find-pm-username')
    async openPrivateMessageByUsername(@UserDeco() tokenUser: TokenUser,
        @Query('username') username: string): Promise<{
            valid: boolean,
            channel_id: string, listPm: {
                chatid: string,
                user: {
                    username: string
                },
            }
        }> {
        const error = {
            valid: false,
            channel_id: "",
            listPm: {
                chatid: "", user: { username: "" }
            }
        }

        if (username === "" || typeof username === "undefined")
            return (error);
        const user: User | null = await this.userService.findUserByName(username);
        if (!user || tokenUser.userID === Number(user.userID))
            return (error);
        const channel_id = await this.findPm(tokenUser.userID, String(user.userID));
        return ({
            valid: true,
            channel_id: channel_id,
            listPm: {
                chatid: channel_id, user: { username: user.username }
            }
        });
    }

    /*
        find PM from both user
        if it doesn't exist, create a pm
    */
    @Get('private-messages')
    async openPrivateMessage(@UserDeco() user: TokenUser,
        @Query('id', ParseIntPipe) id: string): Promise<{ asw: string | null | undefined }> {
        if (user.userID === Number(id))
            return ({ asw: null });
        const channel = await this.findPm(user.userID, id);
        return ({ asw: channel });
    }
    /* End of fixed chatbox part */

    /*
        id = id channel
        name = channel's name
    */
    @UseGuards(JwtGuard)
    @Get('has-paswd')
    async getHasPaswd(@UserDeco() user: TokenUser,
        @Query('id') id: string): Promise<boolean> {
        const channel: undefined | DbChat = await this.chatService.getChannelById(id);

        if (typeof channel != "undefined" && channel != null) {
            const getUser = await this.chatService.getUserOnChannel(id, user.userID);
            if (typeof getUser !== "undefined" || getUser === null)
                return (false);
        }
        if (typeof channel === "undefined" || channel?.password == '' || channel === null)
            return (false);
        return (true);
    }

    /* Post part */
    /* Create new public chat and return them by Name */
    /* (?: mean non-group (optionnal)*/
    @UseGuards(JwtGuard)
    @Post('new-public')
    async postNewPublicChat(@UserDeco() user: TokenUser,
        @Body() chat: CreateChatDto): Promise<InformationChat | string[]> {
        const channelById: undefined | DbChat = await this.chatService.getChannelByName(chat.name);
        let err: string[] = [];
        const regex = /^[\wàâéêèäÉÊÈÇç]+(?: [\wàâéêèäÉÊÈÇç]+)*$/;
        const resultRegex = regex.exec(chat.name);
        const id: string = crypto.randomBytes(4).toString('hex');
        const getChanneByName = await this.chatService.getChannelById(id);

        if ((chat.accesstype != '0' && chat.accesstype != '1'))
            err.push("Illegal access type");
        if (chat.name.length === 0)
            err.push("Chat name must not be empty.");
        else if (chat.name == chat.password)
            err.push("Password and chat name can't be the same.");
        if (channelById)
            err.push("Channel already exist.");
        if (chat.name.length > 0 && chat.name.length < 4)
            err.push("Channel name too short.");
        if (chat.name.length > 0 && 100 < chat.name.length)
            err.push("Channel name too long.");
        if (chat.name.length > 0 && !resultRegex)
            err.push("Channel name format is wrong.");
        if (getChanneByName)
            err.push("Channel id already exist, please try again.");
        if (err.length > 0)
            return (err);
        const getAll = await this.chatService.getAllPublic();
        const salt = Number(process.env.CHAT_SALT);
        if (chat.accesstype != '0' || typeof getAll == undefined)
            throw new HttpException('Forbidden', HttpStatus.FORBIDDEN);
        if (chat.password != '') {
            chat.accesstype = '1';
            chat.password = bcrypt.hashSync(chat.password, salt);
        }
        const findUser = await this.userService.findUsersById(user.userID);
        return (await this.chatService.createChat(chat, id, { idUser: user.userID, username: findUser?.username }));
    }

    /* Create new private chat and return them by Name
      (?: mean non-group (optionnal)
        https://nodejs.org/api/crypto.html#cryptorandombytessize-callback
    */
    @UseGuards(JwtGuard)
    @Post('new-private')
    async postNewPrivateChat(@UserDeco() user: TokenUser,
        @Body() chat: CreateChatDto): Promise<InformationChat | string[]> {
        const channelByName: undefined | DbChat = await this.chatService.getChannelByName(chat.name);
        let err: string[] = [];
        const regex = /^[\wàâéêèäÉÊÈÇç]+(?: [\wàâéêèäÉÊÈÇç]+)*$/;
        const resultRegex = regex.exec(chat.name);
        const id: string = crypto.randomBytes(6).toString('hex');
        const getChannelById = await this.chatService.getChannelById(id);

        if ((chat.accesstype != '2' && chat.accesstype != '3'))
            err.push("Illegal access type");
        if (chat.name.length === 0)
            err.push("Chat name must not be empty.");
        else if (chat.name == chat.password)
            err.push("Password and chat name can't be the same.");
        if (chat.name.length > 0 && chat.name.length < 4)
            err.push("Channel name too short.");
        if (chat.name.length > 0 && 100 < chat.name.length)
            err.push("Channel name too long.");
        if (channelByName)
            err.push("Channel already exist.");
        if (chat.name.length > 0 && !resultRegex)
            err.push("Channel name format is wrong.");
        if (getChannelById)
            err.push("Channel id already exist, please try again.");
        if (err.length > 0)
            return (err);
        const salt = Number(process.env.CHAT_SALT);
        if (chat.password != '') {
            chat.accesstype = '3';
            chat.password = bcrypt.hashSync(chat.password, salt);
        }
        const findUser = await this.userService.findUsersById(user.userID);
        return (await this.chatService.createChat(chat, id, { idUser: user.userID, username: findUser?.username }));
    }

    @Post('valid-paswd')
    async passwordIsValid(@Body() psw: PswChat): Promise<boolean> {
        const channel: undefined | DbChat = await this.chatService.getChannelById(psw.id);

        if (typeof channel == "undefined" || channel === null || channel.password == '')
            return (false);
        if (psw && psw.psw && channel && channel.password) {
            const comp = await bcrypt.compare(psw.psw, channel.password);
            return (comp);
        }

        return (false);
    }

    @Get('')
    async getChannel(@UserDeco() user: TokenUser,
        @Query('id') id: string) {
        const chan = await this.chatService.getChannelById(id);
        const listMsg = await this.chatService.getListMsgByChannelId(id, user.userID);
        if (!chan)
            return ({});
        let channel = {
            id: chan?.id,
            name: chan?.name,
            owner: chan?.user_id,
            password: chan?.password,
            accesstype: chan?.accesstype,
            lstMsg: listMsg
        };
        if (typeof channel === "undefined" || channel === null)
            return ({});
        const getUser = await this.chatService.getUserOnChannel(id, user.userID);
        if (getUser === "Ban")
            return ({ ban: true });
        if (typeof getUser === "undefined" || getUser === null)
            return ({ authorized: false });
        let arrayStart: number = channel.lstMsg.length - 30;
        let arrayEnd: number = channel.lstMsg.length;
        if (arrayStart < 0)
            arrayStart = 0;
        const convertChannel = {
            id: channel.id,
            name: channel.name,
            owner: channel.owner,
            accesstype: channel.accesstype,
            lstMsg: channel.lstMsg.slice(arrayStart, arrayEnd),
            authorized: true
        };
        return (convertChannel);
    }
}
