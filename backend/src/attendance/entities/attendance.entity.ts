import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  Unique,
} from 'typeorm';
import { SessionEntity } from '../../activities/entities/session.entity';
import { UserEntity } from '../../users/entities/user.entity';

@Entity('attendances')
@Unique('UQ_attendance_user_session', ['user', 'session'])
export class AttendanceEntity {
  @PrimaryGeneratedColumn({ name: 'id_attendance' })
  id!: number;

  @ManyToOne(() => UserEntity, { eager: true, nullable: false })
  @JoinColumn({ name: 'id_user' })
  user!: UserEntity;

  @ManyToOne(() => SessionEntity, { eager: true, nullable: false })
  @JoinColumn({ name: 'id_session' })
  session!: SessionEntity;

  @CreateDateColumn({ name: 'registration_date' })
  registrationDate!: Date;

  @Column({ length: 20 })
  status!: 'PRESENT' | 'ABSENT';
}
