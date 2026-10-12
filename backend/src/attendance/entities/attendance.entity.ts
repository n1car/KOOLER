import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  Unique,
} from 'typeorm';
import { ActivityEntity } from '../../activities/entities/activity.entity';
import { UserEntity } from '../../users/entities/user.entity';

@Entity('attendances')
@Unique('UQ_attendance_user_activity', ['user', 'activity'])
export class AttendanceEntity {
  @PrimaryGeneratedColumn({ name: 'id_attendance' })
  id!: number;

  @ManyToOne(() => UserEntity, { eager: true, nullable: false })
  @JoinColumn({ name: 'id_user' })
  user!: UserEntity;

  @ManyToOne(() => ActivityEntity, { eager: true, nullable: false })
  @JoinColumn({ name: 'id_activity' })
  activity!: ActivityEntity;

  @CreateDateColumn({ name: 'registration_date' })
  registrationDate!: Date;

  @Column({ length: 20 })
  status!: 'PRESENT' | 'ABSENT';
}
