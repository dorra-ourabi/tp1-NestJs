import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
} from 'typeorm';

import { User } from '../../user/entities/user.entity';

@Entity('messages')
export class Message {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column('text')
  text!: string;

  @Column({ type: 'json' })
  reactions: any = { '👍': 0, '🔥': 0, '💡': 0 };

  @CreateDateColumn()
  timestamp!: Date;

  @ManyToOne(() => User, { eager: true })
  user!: User;
}
