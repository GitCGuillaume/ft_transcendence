import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { User } from './user.entity';

@Entity()
export class BlackFriendList {
	@PrimaryGeneratedColumn()
	id: number;

	@Column({
		nullable: false,
	})
	type_list: number;

	@ManyToOne(() => User, (user) => user.lstBlackFriendOwner, { nullable: false, cascade: true })
	@JoinColumn({ name: 'owner_id' })
	userOwner: User;
	@Column({ nullable: false })
	owner_id: number

	@ManyToOne(() => User, (user) => user.lstBlackFriendFocus, { nullable: false, cascade: true })
	@JoinColumn({ name: 'focus_id' })
	userFocus: User;
	@Column({ nullable: false })
	focus_id: number
}