import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { UserEntity } from '../../users/entities/user.entity';

@Entity('roles')
export class RoleEntity {
  @PrimaryGeneratedColumn({ name: 'id_role' })
  id!: number;

  @Column({ unique: true, length: 50 })
  name!: string; // 'ESTUDIANTE' | 'ORGANIZADOR'

  @OneToMany(() => UserEntity, (user) => user.role)
  users!: UserEntity[];
}
