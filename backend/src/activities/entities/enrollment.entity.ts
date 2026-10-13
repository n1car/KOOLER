import {
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  Unique,
} from 'typeorm';
import { ActivityEntity } from './activity.entity';
import { UserEntity } from '../../users/entities/user.entity';

@Entity('enrollments')
@Unique('UQ_enrollment_user_activity', ['user', 'activity'])
export class EnrollmentEntity {
  @PrimaryGeneratedColumn({ name: 'id_enrollment' })
  id!: number;

  @ManyToOne(() => UserEntity, { nullable: false })
  @JoinColumn({ name: 'id_user' })
  user!: UserEntity;

  @ManyToOne(() => ActivityEntity, { nullable: false })
  @JoinColumn({ name: 'id_activity' })
  activity!: ActivityEntity;

  @CreateDateColumn({ name: 'enrollment_date' })
  enrollmentDate!: Date;
}
