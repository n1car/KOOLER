import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('locations')
export class LocationEntity {
  @PrimaryGeneratedColumn({ name: 'id_location' })
  id!: number;

  @Column({ length: 150 })
  name!: string;

  @Column({ length: 100, nullable: true })
  building?: string;
}
