import {
  Check, Column, CreateDateColumn, Entity, JoinColumn, ManyToOne,
  PrimaryGeneratedColumn, Unique,
} from 'typeorm';
import { UserEntity } from '../../users/entities/user.entity';
import { ActivityEntity } from '../../activities/entities/activity.entity';

@Entity('review')
@Unique('UQ_review_user_activity', ['idUser', 'idActivity'])
@Check(`"rating" BETWEEN 1 AND 5`)
export class ReviewEntity {
  @PrimaryGeneratedColumn({ name: 'id_review' })
  id!: number;

  @Column({ name: 'id_user' })
  idUser!: number;

  @Column({ name: 'id_activity' })
  idActivity!: number;

  @Column({ type: 'int' })
  rating!: number;

  @Column({ type: 'varchar', length: 500, nullable: true })
  comment!: string | null;

  @CreateDateColumn({ name: 'date' })
  date!: Date;

  @ManyToOne(() => UserEntity)
  @JoinColumn({ name: 'id_user' })
  user!: UserEntity;

  @ManyToOne(() => ActivityEntity)
  @JoinColumn({ name: 'id_activity' })
  activity!: ActivityEntity;
}