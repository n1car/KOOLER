import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RoleEntity } from '../roles/entities/role.entity';
import { UserEntity } from '../users/entities/user.entity';
import { ActivityTypeEntity } from '../catalog/entities/activity-type.entity';
import { LocationEntity } from '../catalog/entities/location.entity';
import { SeedService } from './seed.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      RoleEntity,
      UserEntity,
      ActivityTypeEntity,
      LocationEntity,
    ]),
  ],
  providers: [SeedService],
})
export class SeedModule {}
