import { Entity, Column, OneToMany, ManyToOne, PrimaryColumn, JoinColumn } from 'typeorm';
import { User } from '../typeorm/user.entity';
import { ListMsg } from './lstmsg.entity';
import { ListUser } from './lstuser.entity';
import { ListMute } from './lstmute.entity';
import { ListBan } from './lstban.entity';

@Entity()
export class Channel {
    @PrimaryColumn()
    id: string;

    @Column({ nullable: false })
    name: string;

    @Column({ nullable: false })
    accesstype: string;

    @Column({ nullable: true })
    password: string;
    /* owner id */
    @ManyToOne(() => User, (user) => user.lstChannel, { nullable: true, cascade: true, onDelete: 'CASCADE' })
    @JoinColumn({ name: 'user_id' })
    user: User;
    @Column({ nullable: true })
    user_id: number;

    @OneToMany(() => ListMsg, (listmsg) => listmsg.chat)
    lstMsg: ListMsg[];

    @OneToMany(() => ListUser, (listuser) => listuser.chat)
    lstUsr: ListUser[];

    @OneToMany(() => ListMute, (listmute) => listmute.chat)
    lstMute: ListUser[];

    @OneToMany(() => ListBan, (listban) => listban.chat)
    lstBan: ListUser[];
}