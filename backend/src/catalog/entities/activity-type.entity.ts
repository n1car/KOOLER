import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('activity_types')
export class ActivityTypeEntity {
  @PrimaryGeneratedColumn({ name: 'id_type' })
  id!: number;

  @Column({ length: 100, unique: true })
  name!: string;

  @Column({ name: 'requires_enrollment', default: true })
  requiresEnrollment!: boolean;
}
