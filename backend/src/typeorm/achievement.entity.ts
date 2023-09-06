import {PrimaryGeneratedColumn, Column, Entity, ManyToOne, JoinColumn} from 'typeorm';
import {User} from './user.entity';

@Entity()
export class Achievements {
	@PrimaryGeneratedColumn()
	id: number;

	@Column({
		nullable: false,
	})
	name: string;

    @ManyToOne(() => User, (user) => user.achievement, { nullable: false, cascade: true, onDelete: 'CASCADE' })
    @JoinColumn({ name: 'user_id' })
    user: User;
    @Column({ nullable: false })
    user_id: number;
}