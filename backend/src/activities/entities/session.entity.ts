import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { ActivityEntity } from './activity.entity';

@Entity('sessions')
export class SessionEntity {
  @PrimaryGeneratedColumn({ name: 'id_session' })
  id!: number;

  @ManyToOne(() => ActivityEntity, { eager: true, nullable: false })
  @JoinColumn({ name: 'id_activity' })
  activity!: ActivityEntity;

  @Column({ name: 'session_date', type: 'date' })
  sessionDate!: string;

  @Column({ name: 'start_time', length: 10, nullable: true })
  startTime?: string;

  @Column({ name: 'end_time', length: 10, nullable: true })
  endTime?: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;
}
