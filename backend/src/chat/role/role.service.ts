import { Injectable, NotFoundException } from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { Channel } from '../chat.entity';
import { ListUser } from '../lstuser.entity';
import { RoleGateway } from './role.gateway';
import { ListBan } from '../lstban.entity';
import { ListMute } from '../lstmute.entity';
import * as bcrypt from 'bcrypt';

@Injectable()
export class RoleService {
        @InjectRepository(Channel)
        private chatsRepository: Repository<Channel>;
        @InjectRepository(ListUser)
        private listUserRepository: Repository<ListUser>;
        @InjectRepository(ListBan)
        private listBanRepository: Repository<ListBan>;
        @InjectRepository(ListMute)
        private listMuteRepository: Repository<ListMute>;

        constructor(private dataSource: DataSource,
                private roleGateway: RoleGateway) { }

        /* id == idChannel */
        getOwner(id: Readonly<string>): Promise<Channel | null> {
                const channel: Promise<Channel | null> = this.chatsRepository.createQueryBuilder("channel")
                        .where("channel.id = :id")
                        .setParameters({ id: id })
                        .getOne();
                return (channel);
        }

        async getHasPsw(id: Readonly<string>): Promise<boolean> {
                const channel: Channel | null = await this.chatsRepository.createQueryBuilder("channel")
                        .select("channel.password")
                        .where("channel.id = :id")
                        .setParameters({ id: id })
                        .getOne();
                if (channel && channel.password && channel.password != "")
                        return (true);
                return (false);
        }

        getAccessType(id: Readonly<string>): Promise<Channel | null> {
                const channel: Promise<Channel | null> = this.chatsRepository.createQueryBuilder("channel")
                        .select("channel.accesstype")
                        .where("channel.id = :id")
                        .setParameters({ id: id })
                        .getOne();
                return (channel);
        }

        getRole(id: Readonly<string>, userId: Readonly<number>): Promise<ListUser | null> {
                const list_user: Promise<ListUser | null> = this.listUserRepository.createQueryBuilder("list_user")
                        .where("list_user.chatid = :id")
                        .andWhere("list_user.user_id = :userId")
                        .setParameters({ id: id, userId: userId })
                        .getOne();
                return (list_user);
        }

        getUser(id: Readonly<string>, userId: Readonly<number>): Promise<ListUser | null> {
                return (
                        this.listUserRepository.createQueryBuilder("list_user")
                                .addSelect(["User.username", "User.avatarPath"])
                                .innerJoin("list_user.user", "User")
                                .where("list_user.chatid = :id")
                                .andWhere("list_user.user_id = :userId")
                                //get username aussi
                                .setParameters({ id: id, userId: userId })
                                .getOne()
                );
        }

        async kickUser(id: Readonly<string>, user_id: Readonly<number>) {
                const runner = this.dataSource.createQueryRunner();

                await runner.connect();
                await runner.startTransaction();
                try {
                        const user: ListUser | null = await this.getUser(id, user_id);
                        if (!user) {
                                throw new NotFoundException("User not found, couldn't kick user.");
                        }
                        //remove user from channel
                        await this.listUserRepository
                                .createQueryBuilder()
                                .delete()
                                .from(ListUser)
                                .where("chatid = :id")
                                .setParameters({ id: id })
                                .andWhere("user_id = :user_id")
                                .setParameters({ user_id: user_id })
                                .execute();
                        await runner.commitTransaction();
                        this.roleGateway.updateListChat(id);
                        this.roleGateway.actionOnUser(id, user_id,
                                user.user.username, user.user.avatarPath, "Kick");
                } catch (e) {
                        await runner.rollbackTransaction();
                } finally {
                        //doc want it released
                        await runner.release();
                }
        }

        async muteUser(id: Readonly<string>, user_id: Readonly<number>,
                time: Readonly<number>) {
                const runner = this.dataSource.createQueryRunner();

                await runner.connect();
                await runner.startTransaction();
                try {
                        const user: ListUser | null = await this.getUser(id, user_id);
                        if (!user) {
                                throw new NotFoundException("User not found, couldn't mute user.");
                        }
                        let date = new Date();
                        date.setSeconds(date.getSeconds() + time);
                        //mute user
                        await this.listMuteRepository.createQueryBuilder()
                                .insert()
                                .into(ListMute)
                                .values({
                                        time: date,
                                        user_id: user_id,
                                        chatid: id
                                })
                                .execute();
                        await runner.commitTransaction();
                        this.roleGateway.actionOnUser(id, user_id,
                                user.user.username, user.user.avatarPath, "Mute");
                } catch (e) {
                        await runner.rollbackTransaction();
                } finally {
                        //doc want it released
                        await runner.release();
                }
        }

        async banUser(id: Readonly<string>, user_id: Readonly<number>,
                time: Readonly<number>) {
                const runner = this.dataSource.createQueryRunner();

                await runner.connect();
                await runner.startTransaction();
                try {
                        const user: ListUser | null = await this.getUser(id, user_id);
                        if (!user) {
                                throw new NotFoundException("User not found, couldn't ban user.");
                        }
                        let date = new Date();
                        date.setSeconds(date.getSeconds() + time);
                        //ban user
                        await this.listBanRepository.createQueryBuilder()
                                .insert()
                                .into(ListBan)
                                .values({
                                        time: date,
                                        user_id: user_id,
                                        chatid: id
                                })
                                .execute();
                        //remove user from channel
                        await this.listUserRepository
                                .createQueryBuilder()
                                .delete()
                                .from(ListUser)
                                .where("chatid = :id")
                                .setParameters({ id: id })
                                .andWhere("user_id = :user_id")
                                .setParameters({ user_id: user_id })
                                .execute();
                        await runner.commitTransaction();
                        this.roleGateway.updateListChat(id);
                        this.roleGateway.actionOnUser(id, user_id,
                                user.user.username, user.user.avatarPath, "Ban");
                } catch (e) {
                        await runner.rollbackTransaction();
                } finally {
                        //doc want it released
                        await runner.release();
                }
        }

        async unBanUser(id: Readonly<string>, userId: Readonly<number>) {
                const runner = this.dataSource.createQueryRunner();

                await runner.connect();
                await runner.startTransaction();
                try {
                        const arr = await this.listBanRepository.createQueryBuilder("bl")
                                .where("user_id = :userId")
                                .setParameters({ userId: userId })
                                .andWhere("chatid = :id")
                                .setParameters({ id: id })
                                .getMany();
                        await this.listBanRepository.remove(arr);
                        await runner.commitTransaction();
                } catch (e) {
                        await runner.rollbackTransaction();
                } finally {
                        //doc want it released
                        await runner.release();
                }
        }

        async unMuteUser(id: Readonly<string>, userId: Readonly<number>) {
                const runner = this.dataSource.createQueryRunner();

                await runner.connect();
                await runner.startTransaction();
                try {
                        const arr = await this.listMuteRepository.createQueryBuilder("mt")
                                .where("user_id = :userId")
                                .setParameters({ userId: userId })
                                .andWhere("chatid = :id")
                                .setParameters({ id: id })
                                .getMany();
                        await this.listMuteRepository.remove(arr);
                        await runner.commitTransaction();
                } catch (e) {
                        await runner.rollbackTransaction();
                } finally {
                        //doc want it released
                        await runner.release();
                }
        }

        /* run transaction
                find the future user granted
                grant the user
        */
        async grantAdminUserWithTransact(id: Readonly<string>, userId: Readonly<number>,
                newRole: string) {
                const runner = this.dataSource.createQueryRunner();

                await runner.connect();
                await runner.startTransaction();
                try {
                        const user: ListUser | null = await this.getUser(id, userId);
                        if (!user) {
                                throw new NotFoundException("User not found, couldn't grant user.");
                        }
                        await this.listUserRepository.createQueryBuilder().update(ListUser)
                                .set({ role: newRole })
                                .where("id = :id")
                                .setParameters({ id: user.id })
                                .execute();
                        await runner.commitTransaction();
                        this.roleGateway.updateListChat(id);
                } catch (e) {
                        await runner.rollbackTransaction();
                } finally {
                        //doc want it released
                        await runner.release();
                }
        }

        async setPsw(id: Readonly<string>, psw: Readonly<string>) {
                const runner = this.dataSource.createQueryRunner();
                let accesstype = '0';
                await runner.connect();
                await runner.startTransaction();
                try {
                        const accessDb = await this.getAccessType(id);
                        const salt = Number(process.env.CHAT_SALT);
                        const password = bcrypt.hashSync(psw, salt);
                        if (accessDb) {
                                accesstype = accessDb.accesstype;
                                if (accessDb.accesstype === '0')
                                        accesstype = '1';
                                else if (accessDb.accesstype === '2')
                                        accesstype = '3';
                        }
                        await this.listUserRepository.createQueryBuilder().update(Channel)
                                .set({ password: password, accesstype: accesstype })
                                .where("id = :id")
                                .setParameters({ id: id })
                                .execute();
                        await runner.commitTransaction();
                } catch (e) {
                        await runner.rollbackTransaction();
                } finally {
                        //doc want it released
                        await runner.release();
                }
        }

        async unSetPsw(id: Readonly<string>) {
                const runner = this.dataSource.createQueryRunner();
                let accesstype = '0';

                await runner.connect();
                await runner.startTransaction();
                try {
                        const accessDb = await this.getAccessType(id);
                        if (accessDb) {
                                accesstype = accessDb.accesstype;
                                if (accessDb.accesstype === '1')
                                        accesstype = '0';
                                else if (accessDb.accesstype === '3')
                                        accesstype = '2';
                        }
                        await this.listUserRepository.createQueryBuilder().update(Channel)
                                .set({ password: "", accesstype: accesstype })
                                .where("id = :id")
                                .setParameters({ id: id })
                                .execute();
                        await runner.commitTransaction();
                } catch (e) {
                        await runner.rollbackTransaction();
                } finally {
                        //doc want it released
                        await runner.release();
                }
        }
}