import {
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  Unique,
} from 'typeorm';
import { UserEntity } from '../../users/entities/user.entity';
import { ActivityEntity } from './activity.entity';

@Entity('enrollments')
// La restricción también evita inscripciones duplicadas bajo concurrencia.
@Unique('UQ_enrollment_user_activity', ['user', 'activity'])
export class EnrollmentEntity {
  @PrimaryGeneratedColumn({ name: 'id_enrollment' })
  id!: number;

  @ManyToOne(() => UserEntity, { eager: true, nullable: false, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'id_user' })
  user!: UserEntity;

  @ManyToOne(() => ActivityEntity, (activity) => activity.enrollments, {
    nullable: false,
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'id_activity' })
  activity!: ActivityEntity;

  @CreateDateColumn({ name: 'enrollment_date' })
  enrollmentDate!: Date;
}
