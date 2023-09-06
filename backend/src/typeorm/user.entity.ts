import { Column, Entity, PrimaryColumn, OneToMany, OneToOne } from 'typeorm';
import { Channel } from '../chat/chat.entity';
import { ListMsg } from '../chat/lstmsg.entity';
import { ListUser } from '../chat/lstuser.entity';
import { ListBan } from '../chat/lstban.entity';
import { ListMute } from '../chat/lstmute.entity';
import { BlackFriendList } from './blackFriendList.entity';
import { Stat } from './stat.entity';
import { MatchHistory } from './matchHistory.entity';
import { Achievements } from './achievement.entity';

@Entity()
export class User {
  //the ID provided by 42
  @PrimaryColumn({
    type: 'bigint',
    name: 'user_id',
    nullable: false,
    default: 0,
  })
  userID: number;

  @Column({
    nullable: false,
    default: '',
  })
  username: string;

  @Column({
    nullable: true,
    default: 'upload_avatar/default.png'
  })
  avatarPath!: string;

  @Column({
    nullable: false,
    default: '',
  })
  token: string;

  @Column({ default: false })
  fa: boolean;

  @Column({
    nullable: true,
  })
  secret_fa!: string;

  /* Want to know if user has connected with a code for the first time */
  @Column({ default: false })
  fa_first_entry: boolean;

  @Column({
    nullable: true,
  })
  fa_psw!: string;

  @OneToMany(() => Channel, (listchannel) => listchannel.user)
  lstChannel: Channel[];

  @OneToMany(() => ListMsg, (listMsg) => listMsg.user)
  lstMsg: User[];

  @OneToMany(() => ListUser, (listUsr) => listUsr.user)
  lstUsr: User[];

  @OneToMany(() => ListBan, (listBan) => listBan.user)
  lstBan: User[];

  @OneToMany(() => ListMute, (listMute) => listMute.user)
  lstMute: User[];

  //OneToMany vers blackfriendList
  @OneToMany(() => BlackFriendList, (blackfriendlist) => blackfriendlist.owner_id)
  lstBlackFriendOwner: BlackFriendList[];
  @OneToMany(() => BlackFriendList, (blackfriendlist) => blackfriendlist.userFocus)
  lstBlackFriendFocus: BlackFriendList[];

  @OneToOne(() => Stat, (stat) => stat.user)
  sstat: Stat[]

    //OneToMany vers MatchHistory
  @OneToMany(() => MatchHistory, (matchhistory) => matchhistory.MP1)
  matchPlayerOne: MatchHistory[];
  @OneToMany(() => MatchHistory, (matchhistory) => matchhistory.MP2)
  matchPlayerTwo: MatchHistory[];
  @OneToMany(() => MatchHistory, (matchhistory) => matchhistory.victory_user)
  userVictory: MatchHistory[];

  //One
  @OneToMany(() => Achievements, (achievement) => achievement.user)
  achievement: User[];
}
