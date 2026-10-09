import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { RoleEntity } from '../../roles/entities/role.entity';

@Entity('users')
export class UserEntity {
  @PrimaryGeneratedColumn({ name: 'id_user' })
  id!: number;

  @Column({ name: 'first_name', length: 100 })
  firstName!: string;

  @Column({ name: 'last_name', length: 100 })
  lastName!: string;

  @Column({ unique: true, length: 150 })
  email!: string;

  @Column({ name: 'password_hash' })
  passwordHash!: string;

  @Column({ default: 'ACTIVE', length: 20 })
  status!: string;

  @ManyToOne(() => RoleEntity, (role) => role.users, {
    eager: true,
    nullable: false,
  })
  @JoinColumn({ name: 'id_role' })
  role!: RoleEntity;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;
}
