import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { UserEntity } from '../../users/entities/user.entity';

@Entity('activities')
export class ActivityEntity {
  @PrimaryGeneratedColumn({ name: 'id_activity' })
  id!: number;

  @Column({ length: 150 })
  name!: string;

  @Column({ type: 'text' })
  description!: string;

  @Column({ type: 'date' })
  date!: string;

  @Column({ name: 'start_time', length: 10 })
  startTime!: string;

  @Column({ name: 'end_time', length: 10 })
  endTime!: string;

  @Column({ type: 'int', default: 20 })
  capacity!: number;

  @Column({ default: 'ACTIVE', length: 20 })
  status!: 'ACTIVE' | 'CANCELLED' | 'FINISHED';

  @Column({ name: 'registration_deadline', type: 'timestamp' })
  registrationDeadline!: Date;

  @Column({ name: 'is_certifiable', default: false })
  isCertifiable!: boolean;

  @Column({ name: 'min_attendance_percentage', type: 'int', default: 80, nullable: true })
  minAttendancePercentage!: number;

  @Column({ name: 'image_url', nullable: true, length: 255 })
  imageUrl?: string;

  @ManyToOne(() => UserEntity, { eager: true, nullable: false })
  @JoinColumn({ name: 'id_organizer' })
  organizer!: UserEntity;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;
}
