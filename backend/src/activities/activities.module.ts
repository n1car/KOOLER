import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ActivityEntity } from './entities/activity.entity';

@Module({
  imports: [TypeOrmModule.forFeature([ActivityEntity])],
  exports: [TypeOrmModule],
})
export class ActivitiesModule {}
