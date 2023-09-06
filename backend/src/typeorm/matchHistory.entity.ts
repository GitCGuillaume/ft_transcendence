import {PrimaryGeneratedColumn, Column, Entity, ManyToOne, JoinColumn} from 'typeorm';
import {User} from './user.entity';

@Entity()
export class MatchHistory {
	@PrimaryGeneratedColumn()
	id: number;

	@Column({
		nullable: false,
	})
	type_game: string;

	@ManyToOne(() => User, (user) => user.matchPlayerOne, {nullable: false, cascade: true})
	@JoinColumn({name: 'player_one'})
	MP1: User
	@Column({nullable: false})
	player_one: number

	@ManyToOne(() => User, (user) => user.matchPlayerTwo, {nullable: false, cascade: true})
	@JoinColumn({name: 'player_two'})
	MP2: User
	@Column({nullable: false})
	player_two: number

	@ManyToOne(() => User, (user) => user.userVictory, {nullable: false, cascade: true})
	@JoinColumn({name: 'user_victory'})
	victory_user: User
	@Column({nullable: false})
	user_victory: number
}