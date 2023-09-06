import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Channel } from './chat.entity';
import { User } from '../typeorm/user.entity';

@Entity()
export class ListBan {
    @PrimaryGeneratedColumn()
    id: number;
    /* z = timezone */
    @Column({ nullable: true, type: 'timestamptz' })
    time: Date;

    @ManyToOne(() => User, (user) => user.lstBan, { nullable: false, cascade: true, onDelete: 'CASCADE' })
    @JoinColumn({ name: 'user_id' })
    user: User;
    @Column({ nullable: false })
    user_id: number;

    @ManyToOne(() => Channel, (chat) => chat.lstBan, { nullable: false, cascade: true, onDelete: 'CASCADE' })
    @JoinColumn({ name: 'chatid' })
    chat: Channel;
    @Column({ nullable: false })
    chatid: string;
}