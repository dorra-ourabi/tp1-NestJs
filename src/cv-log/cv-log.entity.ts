import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
} from 'typeorm';
import { CvEvent } from '../cv/events/cv.events';

@Entity()
export class CvLog {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  cvId: number;

  @Column()
  ownerId: number;

  @Column({ type: 'enum', enum: CvEvent })
  type: CvEvent;

  @CreateDateColumn()
  performedAt: Date;

  @Column()
  performedBy: number;
}