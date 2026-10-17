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

@Entity('certificates')
@Unique('UQ_certificate_user_activity', ['user', 'activity'])
export class CertificateEntity {
  @PrimaryGeneratedColumn({ name: 'id_certificate' })
  id!: number;

  @ManyToOne(() => UserEntity, { eager: true, nullable: false })
  @JoinColumn({ name: 'id_user' })
  user!: UserEntity;

  @ManyToOne(() => ActivityEntity, { eager: true, nullable: false })
  @JoinColumn({ name: 'id_activity' })
  activity!: ActivityEntity;

  @CreateDateColumn({ name: 'issue_date' })
  issueDate!: Date;

  @Column({ name: 'certificate_code', unique: true, length: 128 })
  certificateCode!: string;
}
