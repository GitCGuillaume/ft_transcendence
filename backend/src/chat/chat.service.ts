import { CreateChatDto, Owner } from './dto/create-chat.dto';
import { Chat, InformationChat, DbChat } from './chat.interface';
import { IsString } from 'class-validator';
import * as bcrypt from 'bcrypt';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { Channel } from './chat.entity';
import { ListBan } from './lstban.entity';
import { ListMsg } from './lstmsg.entity';
import { ListMute } from './lstmute.entity';
import { ListUser } from './lstuser.entity';
import { BlackFriendList } from 'src/typeorm/blackFriendList.entity';
import { Injectable } from '@nestjs/common';

type Channel_ret = {
    Channel_id: string
}

class Room {
    @IsString()
    id: string;
    @IsString()
    psw: string
}

@Injectable()
export class ChatService {
    @InjectRepository(Channel)
    private chatsRepository: Repository<Channel>;
    @InjectRepository(ListUser)
    private listUserRepository: Repository<ListUser>;
    @InjectRepository(ListMsg)
    private listMsgRepository: Repository<ListMsg>;
    @InjectRepository(ListBan)
    private listBanRepository: Repository<ListBan>;
    @InjectRepository(ListMute)
    private listMuteRepository: Repository<ListMute>;
    @InjectRepository(BlackFriendList)
    private readonly blFrRepository: Repository<BlackFriendList>

    constructor(private dataSource: DataSource) { }
    async getAllPublic(): Promise<any[]> {
        const arr: Channel[] = await this.chatsRepository
            .createQueryBuilder("channel")
            .innerJoin("channel.user", "User")
            .select(['channel.id',
                'channel.name', 'channel.user_id', 'channel.accesstype', "User.username"])
            .where("accesstype = :a1 OR accesstype = :a2")
            .setParameters({ a1: 0, a2: 1 })
            .getRawMany();
        return arr;
    }

    async getAllPrivate(userID: Readonly<number>): Promise<any[]> {
        const arr: Channel[] = await this.chatsRepository
            .createQueryBuilder("channel")
            .innerJoin("channel.user", "User")
            .innerJoin("channel.lstUsr", "ListUser")
            .select(['channel.id', 'channel.name',
                'channel.user_id', 'channel.accesstype',
                'User.username'])
            .where("(accesstype = :a1 OR accesstype = :a2) AND ListUser.user_id = :userID")
            .setParameters({ a1: 2, a2: 3, userID: userID })
            .getRawMany();
        return arr;
    }

    async searchAndSetAdministratorsChannel(id: string) {
        let listUser: ListUser[] = await this.listUserRepository.createQueryBuilder("list_user")
            .select(["list_user.id", "list_user.user_id"])
            .where("list_user.chatid = :id")
            .setParameters({ id: id })
            .andWhere("list_user.role = :role")
            .setParameters({ role: 'Administrator' })
            .getMany();

        if (listUser.length === 0) {
            listUser = await this.listUserRepository.createQueryBuilder("list_user")
                .select(["list_user.id", "list_user.user_id"])
                .where("list_user.chatid = :id")
                .setParameters({ id: id })
                .getMany();
        }
        if (listUser.length > 0) {
            await this.chatsRepository.createQueryBuilder().update(Channel)
                .set({ user_id: listUser[0].user_id })
                .where("id = :id")
                .setParameters({ id: id })
                .execute();
            await this.listUserRepository.createQueryBuilder().update(ListUser)
                .set({ role: "Owner" })
                .where("id = :id")
                .setParameters({ id: listUser[0].id })
                .execute();
        }
    }

    /* PRIVATE MESSAGE PART */
    async getAllPmUser(userID: Readonly<number>) {
        const subquery = this.chatsRepository
            .createQueryBuilder("channel").subQuery()
            .from(Channel, "channel")
            .select("channel.id")
            .innerJoin("channel.lstUsr", "ListUser")
            .innerJoin("ListUser.user", "User")
            .where("channel.accesstype = :type", { type: '4' })
            .andWhere("ListUser.user_id = :user_id", { user_id: userID })

        const channel: ListUser[] | null = await this.listUserRepository
            .createQueryBuilder("list_user")
            .select("list_user.chatid")
            .addSelect("User.username")
            .innerJoin("list_user.user", "User")
            .where("list_user.chatid IN " + subquery.getQuery())
            .andWhere("list_user.user_id != :user_id")
            .setParameters({ type: '4', user_id: userID })
            .getMany();
        return (channel)
    }

    /* GET PM BETWEEN 2 USERS BY NEEDED ID */
    async findPmUsers(userOne: Readonly<number>,
        userTwo: Readonly<string>) {
        const listUser: Channel_ret | undefined = await this.listUserRepository
            .createQueryBuilder("list_user")
            .select("Channel.id")
            .innerJoin("list_user.chat", "Channel")
            .where("list_user.user_id IN (:userOne, :userTwo)")
            .setParameters({
                userOne: userOne,
                userTwo: Number(userTwo)
            })
            .andWhere("Channel.accesstype = :type")
            .setParameters({ type: '4' })
            .groupBy("Channel.id")
            .orHaving("COUNT(Channel.id) >= :nb")
            .setParameters({ nb: 2 })
            .getRawOne();
        return (listUser);
    }

    /* GET PM BY USERNAME */

    /* Create private message part */
    async insertMemberPm(userId: Readonly<number>, concat: string) {
        const runner = this.dataSource.createQueryRunner();

        await runner.connect();
        await runner.startTransaction();

        try {
            /* insert first user */
            await this.listUserRepository.createQueryBuilder()
                .insert().into(ListUser)
                .values([
                    { user_id: userId, chatid: concat }
                ]).execute();
            await runner.commitTransaction();
        } catch (e) {
            await runner.rollbackTransaction();
        } finally {
            //doc want it released
            await runner.release();
        }
    }
    /* Create private message part */
    async createPrivateMessage(userOne: Readonly<number>,
        userTwo: Readonly<string>): Promise<string> {
        /* create Private message channel */
        const concat = String(userOne).concat(userTwo);
        const runner = this.dataSource.createQueryRunner();

        await runner.connect();
        await runner.startTransaction();

        try {
            await this.chatsRepository.createQueryBuilder()
                .insert().into(Channel)
                .values({
                    id: concat,
                    name: concat,
                    accesstype: '4'
                })
                .execute();
            /* insert first user */
            await this.listUserRepository.createQueryBuilder()
                .insert().into(ListUser)
                .values([
                    { user_id: userOne, chatid: concat }
                ]).execute();
            /* insert second user */
            await this.listUserRepository.createQueryBuilder()
                .insert().into(ListUser)
                .values([
                    { user_id: Number(userTwo), chatid: concat }
                ]).execute();
            await runner.commitTransaction();
            return (concat);
        } catch (e) {
            await runner.rollbackTransaction();
        } finally {
            //doc want it released
            await runner.release();
        }
        return (concat);
    }
    /* END OF PRIVATE  */

    /* Get all channels where the user is registered, except privates messages */
    async getAllUserOnChannels(userID: Readonly<number>) {
        const channel: Channel[] | null = await this.chatsRepository
            .createQueryBuilder("channel")
            .select(["channel.id", "channel.name"])
            .innerJoin("channel.lstUsr", "ListUser")
            .where("(accesstype = :a1 OR accesstype = :a2 OR accesstype = :a3 OR accesstype = :a4) AND ListUser.user_id = :userID")
            .setParameters({ a1: 0, a2: 1, a3: 2, a4: 3, userID: userID })
            .getMany();
        return (channel);
    }

    async getListMsgByChannelId(id: string, userId: number) {
        const subQuery = this.blFrRepository.createQueryBuilder("bl")
            .subQuery()
            .from(BlackFriendList, "bl")
            .select("bl.focus_id")
            .where("bl.owner_id = :userId")
            .andWhere("bl.type_list = :type")

        const listMsg: Array<{
            user_id: number,
            content: string
        }> = await this.listMsgRepository.createQueryBuilder("list_msg")
            .select(["list_msg.user_id", "User.username", "User.avatarPath", "list_msg.content"])
            .innerJoin("list_msg.user", "User")
            .where("list_msg.chatid = :id")
            .setParameters({ id: id })
            .andWhere("list_msg.user_id NOT IN " + subQuery.getQuery())
            .setParameters({ userId: userId, type: 1 })
            .orderBy("list_msg.created_at", 'ASC')
            .getMany();
        return (listMsg);
    }

    async getChannelById(id: string): Promise<undefined | DbChat> {
        const channel: any = await this.chatsRepository
            .createQueryBuilder("channel")
            .select(["channel.id", "channel.name", "channel.accesstype",
                "channel.user_id", "channel.password"])
            .where("channel.id = :id")
            .setParameters({ id: id })
            .getOne();
        return (channel);
    }

    async getChannelByName(name: string): Promise<undefined | DbChat> {
        const channel: any = await this.chatsRepository.findOne({
            where: {
                name: name
            }
        });
        return (channel);
    }

    /* check if user is not muted */
    getUserMuted(id: string, user_id: number) {
        const user: Promise<ListMute | null> = this.listMuteRepository
            .createQueryBuilder("list_mute")
            .where("list_mute.chatid = :id")
            .setParameters({ id: id })
            .andWhere("list_mute.user_id = :user_id")
            .setParameters({ user_id: user_id })
            .andWhere("list_mute.time > :time")
            .setParameters({ time: "NOW()" })
            .getOne()
        return (user);
    }

    /* check if user is on channel and not banned */
    async getUserOnChannel(id: string, user_id: number) {
        const listBan: ListBan[] = await this.listBanRepository
            .createQueryBuilder("list_ban")
            .select("list_ban.user_id")
            .where("list_ban.user_id = :user_id")
            .setParameters({ user_id: user_id })
            .andWhere("list_ban.time > :time")
            .setParameters({ time: "NOW()" })
            .andWhere("list_ban.chatid = :id")
            .setParameters({ id: id })
            .getMany();
        if (listBan.length > 0)
            return ("Ban")
        const user: any = await this.chatsRepository
            .createQueryBuilder("channel")
            .innerJoin("channel.lstUsr", "ListUser")
            .innerJoinAndSelect("ListUser.user", "User")
            .select(["channel.id", "channel.name", "channel.accesstype", "Channel.user_id", "User.username", "User.avatarPath"])
            .where("channel.id = :id")
            .setParameters({ id: id })
            .andWhere("User.userID = :user_id")
            .setParameters({ user_id: user_id })
            .getRawOne();
        return (user);
    }

    /* join and subquery seem to not work with getMany() */
    async getAllUsersOnChannel(id: string, userId: number) {
        const bl = this.blFrRepository.createQueryBuilder("t1").subQuery()
            .from(BlackFriendList, "t1")
            .select(["focus_id", "type_list"])
            .where("owner_id = :ownerId")
            .andWhere("type_list = :type1")
        const fl = this.blFrRepository.createQueryBuilder("t2").subQuery()
            .from(BlackFriendList, "t2")
            .select(["focus_id", "type_list"])
            .where("owner_id = :ownerId")
            .andWhere("type_list = :type2")

        const arr: any = await this.listUserRepository
            .createQueryBuilder("list_user")
            .select(["list_user.user_id", "list_user.role"])
            .addSelect(["User.username", "User.avatarPath"])
            .addSelect("t1.type_list AS bl")
            .addSelect("t2.type_list AS fl")
            .innerJoin("list_user.user", "User")
            .leftJoin(bl.getQuery(), "t1", "t1.focus_id = User.user_id")
            .setParameters({ type1: 1, ownerId: userId })
            .leftJoin(fl.getQuery(), "t2", "t2.focus_id = User.user_id")
            .setParameters({ type2: 2, ownerId: userId })
            .where("list_user.chatid = :id")
            .setParameters({ id: id })
            .orderBy("User.username", 'ASC')
            .getRawMany();
        return (arr);
    }

    async createChat(chat: CreateChatDto, id: string, owner: Owner): Promise<InformationChat> {
        chat.id = id;
        let newChat: Chat = {
            id: chat.id, name: chat.name, owner: owner.idUser,
            accesstype: chat.accesstype, password: chat.password,
            lstMsg: chat.lstMsg,
            lstUsr: chat.lstUsr, lstMute: chat.lstMute,
            lstBan: chat.lstBan
        };
        /* New Channel in DB */
        const channel = new Channel();
        channel.id = newChat.id;
        channel.name = newChat.name;
        channel.user_id = owner.idUser;
        channel.accesstype = newChat.accesstype;
        channel.password = newChat.password;
        /* Add owner */
        const listUsr = new ListUser();
        listUsr.user_id = owner.idUser;
        listUsr.role = "Owner";
        listUsr.chat = channel;
        const runner = this.dataSource.createQueryRunner();

        await runner.connect();
        await runner.startTransaction();
        try {
            this.listUserRepository.save(listUsr);
            await runner.commitTransaction();
        } catch (e) {
            await runner.rollbackTransaction();
        } finally {
            //doc want it released
            await runner.release();
        }
        const return_chat: InformationChat = {
            channel_id: newChat.id,
            channel_name: newChat.name,
            User_username: String(owner.username),
            channel_accesstype: newChat.accesstype,
        }
        return (return_chat);
    }

    async setNewUserChannel(channel: Readonly<any>, user_id: Readonly<number>,
        data: Readonly<Room>): Promise<undefined | boolean> {
        if (channel.password != '' && channel.password != null) {
            if (data.psw === "" || data.psw === null)
                return (undefined)
            if (!data.psw)
                return (undefined)
            const comp = bcrypt.compareSync(data.psw, channel.password);
            if (comp === false)
                return (undefined)
        }
        const runner = this.dataSource.createQueryRunner();

        await runner.connect();
        await runner.startTransaction();
        try {
            await this.listUserRepository
                .createQueryBuilder()
                .insert()
                .into(ListUser)
                .values([{
                    user_id: user_id,
                    chatid: data.id
                }])
                .execute();
            await runner.commitTransaction();
        } catch (e) {
            await runner.rollbackTransaction();
        } finally {
            //doc want it released
            await runner.release();
        }
        return (true);
    }
}